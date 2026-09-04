// รันอัตโนมัติทุกวัน 07:00 น. (ตั้งเวลาไว้ใน vercel.json) — ดึงวัน XD/วันจ่ายปันผลของหุ้นที่ถืออยู่ทั้งหมด
// แล้วอัปเดตเข้า Firestore ให้เลย โดยไม่ต้องเปิดแอป
//
// สิ่งที่ต้องตั้งค่าก่อนใช้งานได้ (ทำครั้งเดียว ดูขั้นตอนในข้อความที่ส่งมาด้วย):
// 1. Environment Variable บน Vercel: FIREBASE_SERVICE_ACCOUNT (JSON key ทั้งก้อนจาก Firebase Console)
// 2. Environment Variable บน Vercel: CRON_SECRET (ตั้งเป็นรหัสลับอะไรก็ได้ ป้องกันคนนอกยิง endpoint นี้เล่น)
// 3. Environment Variable ANTHROPIC_API_KEY (มีอยู่แล้วจาก api/claude.js)
// 4. อัปโหลดไฟล์นี้ + vercel.json ขึ้น repo

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const FIRESTORE_PATH = ['shared', 'krangya-family', 'data', 'main']; // ต้องตรงกับ path ที่ App.jsx ใช้อยู่จริง เช็คให้ตรงก่อนใช้งาน

function getDb() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

async function askClaude(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    }),
  });
  const data = await response.json();
  return (data.content || []).map((c) => c.text || '').join('\n');
}

function safeParseJson(text) {
  try {
    const cleaned = (text || '').replace(/```json|```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : cleaned);
  } catch {
    return { items: [] };
  }
}

async function sendLineNotify(message) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const groupId = process.env.LINE_GROUP_ID;
  if (!token || !groupId) return;
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: groupId, messages: [{ type: 'text', text: message }] }),
  });
}

export default async function handler(req, res) {
  // ป้องกันคนนอกยิง endpoint นี้เล่น — Vercel Cron จะส่ง header นี้มาเองอัตโนมัติถ้าตั้ง CRON_SECRET ไว้
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const db = getDb();
    const docRef = db.collection(FIRESTORE_PATH[0]).doc(FIRESTORE_PATH[1]).collection(FIRESTORE_PATH[2]).doc(FIRESTORE_PATH[3]);
    const snap = await docRef.get();
    if (!snap.exists) {
      res.status(404).json({ error: 'ไม่พบเอกสารข้อมูล ตรวจสอบ FIRESTORE_PATH ในไฟล์นี้ว่าตรงกับ App.jsx ไหม' });
      return;
    }
    const state = snap.data();

    // รวบรวมสัญลักษณ์หุ้น/กองทุนที่ถืออยู่จริงทั้งหมด
    const symbolSet = new Set();
    (state.accounts || []).forEach((a) => (a.holdings || []).forEach((h) => { if (h.symbol) symbolSet.add(h.symbol.trim().toUpperCase()); }));
    const symbols = Array.from(symbolSet);
    if (symbols.length === 0) {
      res.status(200).json({ ok: true, message: 'ไม่มีหุ้น/กองทุนที่ถืออยู่ ข้ามการดึงข้อมูล' });
      return;
    }

    const prompt = `คุณคือนักวิเคราะห์การลงทุน ค้นหาวันขึ้นเครื่องหมาย XD (ex-dividend date) และวันจ่ายเงินปันผล (payment date) ล่าสุดหรือที่ประกาศไว้ล่วงหน้า สำหรับหุ้น/กองทุนต่อไปนี้เท่านั้น ใช้เครื่องมือค้นเว็บจริงจากแหล่งทางการ ห้ามตอบจากความจำเก่า ห้ามเดา
หุ้น/กองทุนที่ต้องการ: ${symbols.join(', ')}
ถ้าหาไม่เจอสำหรับตัวไหน ให้ข้ามตัวนั้นไปเลย เอาเฉพาะรอบล่าสุดที่ประกาศแล้ว/ใกล้ที่สุด 1 รอบต่อสัญลักษณ์
ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่นก่อน/หลัง รูปแบบ:
{"items":[{"symbol":"สัญลักษณ์","exDate":"YYYY-MM-DD","payDate":"YYYY-MM-DD หรือ null","amount":ตัวเลขหรือnull,"source":"ชื่อแหล่งข้อมูลสั้นๆ"}]}`;

    const text = await askClaude(prompt);
    const parsed = safeParseJson(text);
    const newItems = parsed.items || [];

    // เทียบกับข้อมูลเดิม เพื่อดูว่ามีวัน XD ใหม่ที่เพิ่งประกาศไหม (ไว้แจ้งเตือนใน LINE เฉพาะของใหม่ ไม่ต้องแจ้งซ้ำทุกวัน)
    const oldItems = (state.dividendCalendar && state.dividendCalendar.items) || [];
    const isNew = (item) => !oldItems.some((o) => o.symbol === item.symbol && o.exDate === item.exDate);
    const freshItems = newItems.filter(isNew);

    await docRef.set({ dividendCalendar: { items: newItems, fetchedAt: new Date().toISOString() } }, { merge: true });

    if (freshItems.length > 0) {
      const lines = freshItems.map((it) => `• ${it.symbol}: XD ${it.exDate}${it.payDate ? ` · จ่าย ${it.payDate}` : ''}`).join('\n');
      await sendLineNotify(`📅 พบวัน XD ใหม่ที่เพิ่งประกาศ:\n${lines}\n\nเข้าแอป > ข่าว > ปฏิทินปันผล เพื่อตั้งเตือนในปฏิทิน`);
    }

    res.status(200).json({ ok: true, total: newItems.length, new: freshItems.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
