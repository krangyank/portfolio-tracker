// ปฏิทินปันผล (XD) แบบประหยัดเงิน — รันทุกวันจันทร์ (ตั้งใน vercel.json) และเรียกจากปุ่ม "รีเฟรช" ในแอปได้ (?manual=1)
//
// ลำดับการหาข้อมูล (ถูก → แพง):
//  1) Yahoo Finance (ฟรี) — ดึงประวัติปันผลย้อนหลัง แล้วคาดการณ์รอบถัดไปจากรอบเดิม (ถ้ามีรอบที่ประกาศล่วงหน้าแล้วจะใช้ตัวจริง)
//  2) AI + เว็บเสิร์ช (Haiku, จำกัดจำนวนครั้งค้น) — เฉพาะตัวที่ Yahoo ไม่มีข้อมูล และเป็นตัวที่เคยได้รับปันผลจริงเท่านั้น
// รายการที่ผ่านมาแล้วเกิน 30 วันจะถูกตัดทิ้ง ไม่ค้างเป็นข้อมูลเก่า
//
// Environment Variables (มีอยู่แล้ว): FIREBASE_SERVICE_ACCOUNT, CRON_SECRET, ANTHROPIC_API_KEY, LINE_CHANNEL_ACCESS_TOKEN, LINE_GROUP_ID

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const FIRESTORE_PATH = ['users', '7XDNF2jiEVOXXxtnt5tVvUoSgKV2', 'data', 'portfolio'];
const SHARED_FIRESTORE_PATH = ['shared', 'krangya-family', 'data', 'main'];
const DIVIDEND_SOURCES = ['coop_div', 'thai_div', 'us_div', 'yieldtech'];
const AI_MODEL = 'claude-haiku-4-5-20251001';
const MANUAL_CACHE_HOURS = 6;
const STALE_DAYS = 30;
const AI_MAX_SYMBOLS = 15;

function getDb() {
  if (getApps().length === 0) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  return getFirestore();
}

const dayMs = 86400000;
const toStr = (d) => d.toISOString().slice(0, 10);
const todayStr = () => toStr(new Date());
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / dayMs);
function addMonths(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + n);
  return toStr(d);
}
function formatDateDMY(s) {
  if (!s) return '-';
  const [y, m, d] = s.split('-');
  return y && m && d ? `${d}/${m}/${y}` : s;
}
function isStale(it, today) {
  if (!it || !it.exDate) return true;
  const cutoff = toStr(new Date(new Date(today).getTime() - STALE_DAYS * dayMs));
  return it.exDate < cutoff && (!it.payDate || it.payDate < cutoff);
}

// ---------- 1) Yahoo Finance ----------
async function yahooDividends(yahooSymbol, dbg) {
  let r = null;
  for (const host of ['query1', 'query2']) {
    const url = `https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=3y&interval=1mo&events=div`;
    try {
      r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', Accept: 'application/json' } });
      if (dbg) dbg.push(`${yahooSymbol}@${host}:${r.status}`);
      if (r.ok) break;
    } catch (e) { if (dbg) dbg.push(`${yahooSymbol}@${host}:ERR ${e.message}`); r = null; }
  }
  if (!r || !r.ok) return null;
  const j = await r.json();
  const result = j && j.chart && j.chart.result && j.chart.result[0];
  if (!result) return null;
  const divs = result.events && result.events.dividends;
  const list = divs ? Object.values(divs).map((d) => ({ date: toStr(new Date(d.date * 1000)), amount: Number(d.amount) })).filter((d) => d.amount > 0).sort((a, b) => a.date.localeCompare(b.date)) : [];
  return { list, currency: result.meta && result.meta.currency };
}

function predictFromHistory(list, today) {
  if (!list || list.length === 0) return null;
  const upcoming = list.find((d) => d.date >= today);
  if (upcoming) return { exDate: upcoming.date, amount: upcoming.amount, kind: 'announced' };
  const last = list[list.length - 1];
  let months = 12;
  if (list.length >= 2) {
    const gaps = [];
    for (let i = Math.max(1, list.length - 6); i < list.length; i++) gaps.push(daysBetween(list[i - 1].date, list[i].date));
    gaps.sort((a, b) => a - b);
    const med = gaps[Math.floor(gaps.length / 2)];
    months = med < 45 ? 1 : med < 135 ? 3 : med < 270 ? 6 : 12;
  }
  // จ่ายล่าสุดนานเกิน 2 เท่าของรอบปกติ = น่าจะหยุดจ่ายแล้ว ไม่คาดการณ์
  if (daysBetween(last.date, today) > months * 61 + 30) return null;
  let next = last.date;
  let guard = 0;
  while (next < today && guard++ < 60) next = addMonths(next, months);
  if (next < today) return null;
  return { exDate: next, amount: last.amount, kind: 'estimate' };
}

async function fromYahoo(symbol, today, dbg) {
  const candidates = /^[A-Z0-9&-]+$/.test(symbol) ? [`${symbol}.BK`, symbol] : [symbol];
  for (const c of candidates) {
    try {
      const d = await yahooDividends(c, dbg);
      if (!d || d.list.length === 0) continue;
      if (c.endsWith('.BK') && d.currency && d.currency !== 'THB') continue;
      const p = predictFromHistory(d.list, today);
      return { found: true, thai: c.endsWith('.BK'), item: p ? { symbol, exDate: p.exDate, payDate: null, amount: p.amount, kind: p.kind, source: p.kind === 'announced' ? 'Yahoo Finance (ประกาศแล้ว)' : 'Yahoo Finance (คาดการณ์จากประวัติ — ยังไม่ประกาศ)' } : null };
    } catch { /* ลองตัวถัดไป */ }
  }
  return { found: false, thai: false, item: null };
}

// ---------- 1.5) SET (ตลาดหลักทรัพย์ไทย) — วัน XD ที่ประกาศแล้วของหุ้น/REIT/กองทุนอินฟราไทย ----------
// ทดลอง: ถ้า SET บล็อกหรือรูปแบบข้อมูลเปลี่ยน จะข้ามเงียบๆ (ดูผลใน debug)
async function fromSET(symbol, today, dbg) {
  try {
    const r = await fetch(`https://www.set.or.th/api/set/stock/${encodeURIComponent(symbol)}/corporate-action?lang=th`, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', Accept: 'application/json, text/plain, */*', 'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8', Referer: `https://www.set.or.th/th/market/product/stock/quote/${encodeURIComponent(symbol)}/rights-benefits` } });
    if (dbg) dbg.push(`SET:${symbol}:${r.status}`);
    if (!r.ok) return null;
    const j = await r.json();
    const list = Array.isArray(j) ? j : (j && (j.data || j.corporateActions || j.items)) || [];
    const pick = (o, keys) => { for (const k of keys) if (o && o[k]) return String(o[k]).slice(0, 10); return null; };
    const rows = list
      .filter((o) => /^X[DN]/i.test(String(o.caType || o.type || o.symbolType || '')) || /ปันผล|dividend|เงินคืน|capital reduction/i.test(JSON.stringify(o).slice(0, 400)))
      .map((o) => ({ ex: pick(o, ['xdate', 'xDate', 'exDate', 'exdate', 'xd']), pay: pick(o, ['paymentDate', 'payDate', 'paymentdate']), amt: Number(o.dividend || o.dividendPerShare || o.amount || o.dividendAmount) || null }))
      .filter((o) => o.ex && /^\d{4}-\d{2}-\d{2}$/.test(o.ex) && o.ex >= today)
      .sort((a, b) => a.ex.localeCompare(b.ex));
    if (rows.length === 0) return null;
    const x = rows[0];
    return { symbol, exDate: x.ex, payDate: x.pay, amount: x.amt, kind: 'announced', source: 'SET (ประกาศแล้ว)' };
  } catch (e) { if (dbg) dbg.push(`SET:${symbol}:ERR ${e.message}`); return null; }
}

// ---------- 2) AI สำรอง ----------
async function fromAI(symbols, today) {
  if (symbols.length === 0 || !process.env.ANTHROPIC_API_KEY) return [];
  const prompt = `วันนี้คือ ${today} ค้นหาวันขึ้นเครื่องหมาย XD และวันจ่ายปันผล "ของรอบที่ยังไม่ถึง" (XD ตั้งแต่ ${today} เป็นต้นไป และประกาศแล้วเท่านั้น) ของหุ้น/กองทุน: ${symbols.join(', ')}
กฎ: ห้ามเดา ห้ามตอบรอบที่ผ่านมาแล้ว ถ้าไม่พบรอบที่ประกาศล่วงหน้าให้ข้ามตัวนั้น amount = ปันผลต่อหน่วยของรอบนั้นรอบเดียว
ตอบ JSON เท่านั้น: {"items":[{"symbol":"","exDate":"YYYY-MM-DD","payDate":"YYYY-MM-DD หรือ null","amount":ตัวเลขหรือnull,"source":"แหล่งข้อมูลสั้นๆ"}]}`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: AI_MODEL, max_tokens: 2500, messages: [{ role: 'user', content: prompt }], tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 6 }] }),
    });
    const data = await r.json();
    const text = (data.content || []).map((c) => c.text || '').join('\n').replace(/```json|```/g, '');
    const m = text.match(/\{[\s\S]*\}/);
    const items = (m ? JSON.parse(m[0]).items : []) || [];
    return items
      .filter((it) => it && it.symbol && /^\d{4}-\d{2}-\d{2}$/.test(it.exDate || '') && it.exDate >= today)
      .map((it) => ({ symbol: String(it.symbol).toUpperCase(), exDate: it.exDate, payDate: /^\d{4}-\d{2}-\d{2}$/.test(it.payDate || '') ? it.payDate : null, amount: it.amount != null ? Number(it.amount) || null : null, kind: 'ai', source: `${it.source || 'AI เว็บเสิร์ช'} (AI — เช็คซ้ำ)` }));
  } catch { return []; }
}

async function sendLineNotify(message) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const groupId = process.env.LINE_GROUP_ID;
  if (!token || !groupId) return;
  try {
    await fetch('https://api.line.me/v2/bot/message/push', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ to: groupId, messages: [{ type: 'text', text: message }] }) });
  } catch { /* ไม่ให้การแจ้งเตือนพังทั้งงาน */ }
}

export default async function handler(req, res) {
  const manual = req.query && (req.query.manual === '1' || req.query.manual === 'true');
  if (!manual && process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  // ?manual=1&force=1&key=<CRON_SECRET> ใช้ทดสอบ: ข้ามการแคช 6 ชม.
  const forced = manual && req.query.force === '1' && !!process.env.CRON_SECRET && req.query.key === process.env.CRON_SECRET;
  try {
    const db = getDb();
    const docRef = db.collection(FIRESTORE_PATH[0]).doc(FIRESTORE_PATH[1]).collection(FIRESTORE_PATH[2]).doc(FIRESTORE_PATH[3]);
    const snap = await docRef.get();
    if (!snap.exists) { res.status(404).json({ error: 'ไม่พบเอกสารข้อมูล ตรวจสอบ FIRESTORE_PATH' }); return; }
    const state = snap.data();
    const sharedSnap = await db.collection(SHARED_FIRESTORE_PATH[0]).doc(SHARED_FIRESTORE_PATH[1]).collection(SHARED_FIRESTORE_PATH[2]).doc(SHARED_FIRESTORE_PATH[3]).get();
    const sharedState = sharedSnap.exists ? sharedSnap.data() : {};

    const old = state.dividendCalendar || { items: [], fetchedAt: '' };
    const today = todayStr();

    // ปุ่มรีเฟรชในแอป: ถ้าเพิ่งอัพเดตไม่เกิน 6 ชม. ส่งของเดิมกลับ ไม่ดึงใหม่ (กันกดรัว)
    if (manual && !forced && old.fetchedAt && Date.now() - new Date(old.fetchedAt).getTime() < MANUAL_CACHE_HOURS * 3600000) {
      res.status(200).json({ ok: true, cached: true, items: old.items || [], fetchedAt: old.fetchedAt });
      return;
    }

    // สัญลักษณ์ที่ถืออยู่ + สัญลักษณ์ที่เคยได้รับปันผลจริง (เฉพาะกลุ่มหลังที่ยอมใช้ AI สำรอง)
    const accounts = [...(state.accounts || []), ...(sharedState.accounts || [])];
    const held = new Set();
    accounts.forEach((a) => (a.holdings || []).forEach((h) => { if (h.symbol && Number(h.shares) > 0) held.add(h.symbol.trim().toUpperCase()); }));
    const payers = new Set();
    [...(state.contributions || []), ...(sharedState.contributions || [])].forEach((c) => {
      if (DIVIDEND_SOURCES.includes(c.source) && c.sourceSymbol) payers.add(String(c.sourceSymbol).trim().toUpperCase());
    });
    // ใช้ทุกตัวที่ถืออยู่จริง (shares > 0) — เดิมใช้เฉพาะตัวที่เคยบันทึกปันผล ทำให้หุ้นอื่นหลุดไป
    const symbols = [...held];
    if (symbols.length === 0) { res.status(200).json({ ok: true, items: [], message: 'ไม่มีหุ้นที่ถืออยู่' }); return; }

    const fresh = [];
    const debug = [];
    const noYahoo = [];
    for (const s of symbols) {
      const y = await fromYahoo(s, today, debug);
      let item = y.item;
      if (y.thai) { const st = await fromSET(s, today, debug); if (st) item = st; }
      if (item) fresh.push(item);
      else if (!y.found) noYahoo.push(s);
    }
    // Yahoo มักไม่มีวัน XD ที่ "ประกาศล่วงหน้า" ของหุ้น/REIT ไทย → ถามเว็บเสิร์ชสำหรับตัวที่ยังไม่มีรอบ "ประกาศแล้ว"
    // (เรียกครั้งเดียว/สัปดาห์ด้วย Haiku จึงถูกมาก) เรียงตัวที่เคยจ่ายปันผลก่อน
    const announced = new Set(fresh.filter((f) => f.kind === 'announced').map((f) => f.symbol));
    // ลำดับความสำคัญ: เคยจ่ายปันผล +2, ชื่อแบบหุ้น/REIT (ไม่มีขีด เช่น QHBREIT) +1, กองทุนชื่อมีขีด (KT-JEPQ) 0
    const score = (s) => (payers.has(s) ? 2 : 0) + (/^[A-Z0-9&]{2,10}$/.test(s) ? 1 : 0);
    const soon = toStr(new Date(Date.now() + 60 * dayMs));
    const needsAI = (s) => { const f = fresh.find((x) => x.symbol === s); return !f || (f.kind === 'estimate' && f.exDate <= soon); };
    const aiTargets = symbols.filter((s) => !announced.has(s) && needsAI(s)).sort((a, b) => score(b) - score(a)).slice(0, AI_MAX_SYMBOLS);
    const aiItems = await fromAI(aiTargets, today);
    aiItems.forEach((it) => { const i = fresh.findIndex((f) => f.symbol === it.symbol); if (i === -1) fresh.push(it); else if (fresh[i].kind === 'estimate') fresh[i] = it; });

    // รวมกับของเดิม: ใช้ของใหม่ก่อน, ของเดิมเก็บไว้เฉพาะที่ยังไม่เก่า และไม่มีรอบใหม่ของตัวเดียวกัน
    const oldItems = (old.items || []).filter((o) => !isStale(o, today));
    const merged = fresh.map((it) => {
      const same = (old.items || []).find((o) => o.symbol === it.symbol && o.exDate === it.exDate);
      return same ? { ...same, ...it, calendarEventId: same.calendarEventId, calendarEventIdPay: same.calendarEventIdPay, payDate: it.payDate || same.payDate || null } : it;
    });
    oldItems.forEach((o) => { if (!merged.some((m) => m.symbol === o.symbol)) merged.push(o); });
    merged.sort((a, b) => (a.exDate || '').localeCompare(b.exDate || ''));
    // Firestore ไม่รับค่า undefined → ตัดทิ้งก่อนบันทึก
    const clean = JSON.parse(JSON.stringify(merged));

    const fetchedAt = new Date().toISOString();
    await docRef.set({ dividendCalendar: { items: clean, fetchedAt } }, { merge: true });

    // แจ้ง LINE เฉพาะรอบที่ประกาศจริง/AI พบใหม่ (ไม่แจ้งตัวคาดการณ์)
    const isNew = (it) => !(old.items || []).some((o) => o.symbol === it.symbol && o.exDate === it.exDate);
    const notify = fresh.filter((it) => it.kind !== 'estimate' && it.exDate >= today && isNew(it));
    if (notify.length > 0) {
      const lines = notify.map((it) => `• ${it.symbol}: XD ${formatDateDMY(it.exDate)}${it.payDate ? ` · จ่าย ${formatDateDMY(it.payDate)}` : ''}`).join('\n');
      await sendLineNotify(`📅 พบวัน XD ใหม่ (เช็คซ้ำกับประกาศทางการก่อนนะ):\n${lines}\n\nเข้าแอป > ข่าว > ปฏิทินปันผล เพื่อตั้งเตือนในปฏิทิน`);
    }

    const foundSet = new Set(merged.map((m) => m.symbol));
    res.status(200).json({ ok: true, cached: false, items: clean, fetchedAt, missing: symbols.filter((s) => !foundSet.has(s)), debug, stats: { symbols: symbols.length, yahoo: fresh.filter((f) => f.kind !== 'ai').length, ai: aiItems.length, notified: notify.length } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
