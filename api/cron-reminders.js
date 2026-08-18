import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getDb() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) throw new Error('ไม่มี FIREBASE_SERVICE_ACCOUNT_KEY ตั้งไว้');
    const serviceAccount = JSON.parse(raw);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  return Math.round((d - today) / (24 * 3600 * 1000));
}

// คำนวณวันครบกำหนดจ่ายบัตรของรอบปัจจุบัน จาก dueDay (วันที่ในเดือน) — ตรรกะเดียวกับฝั่ง client (nextCardDueDate)
function nextCardDueDateStr(dueDay) {
  const now = new Date();
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let due = new Date(now.getFullYear(), now.getMonth(), Number(dueDay || 15));
  if (due < todayOnly) due = new Date(now.getFullYear(), now.getMonth() + 1, Number(dueDay || 15));
  return due.toISOString().slice(0, 10);
}

async function pushLine(message) {
  const target = process.env.LINE_GROUP_ID;
  if (!target) { console.error('cron-reminders: ไม่มี LINE_GROUP_ID ตั้งไว้'); return; }
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
    body: JSON.stringify({ to: target, messages: [{ type: 'text', text: message }] }),
  });
  if (!response.ok) console.error('cron-reminders: LINE push failed', response.status, await response.text().catch(() => ''));
}

function label(dl) {
  return dl === 0 ? 'วันนี้' : 'พรุ่งนี้';
}

export default async function handler(req, res) {
  try {
    const db = getDb();
    const snap = await db.collection('shared').doc('krangya-family').collection('data').doc('main').get();
    if (!snap.exists) { res.status(200).json({ ok: true, note: 'ไม่มีข้อมูล shared doc' }); return; }
    const data = snap.data();
    const lines = [];

    // บัตรเครดิตใกล้ครบกำหนดจ่าย
    (data.creditCards || []).forEach((c) => {
      const dl = daysUntil(nextCardDueDateStr(c.dueDay));
      if (dl === 0 || dl === 1) lines.push(`💳 ${label(dl)}ครบกำหนดจ่ายบัตร ${c.bankName || ''} ${c.cardName || ''}${c.last4 ? ` (...${c.last4})` : ''}`);
    });

    // กรมธรรม์ใกล้ต่ออายุ
    (data.insurancePolicies || []).forEach((p) => {
      const dl = daysUntil(p.endDate);
      if (dl === 0 || dl === 1) lines.push(`📄 ${label(dl)}กรมธรรม์ครบกำหนด: ${p.company || ''} ${p.planName || ''}`);
    });

    // นัดลูกๆ (ทั่วไป) + พบหมอ
    (data.dogs || []).forEach((d) => {
      (d.appointments || []).forEach((a) => {
        const dl = daysUntil(a.date);
        if (dl === 0 || dl === 1) lines.push(`🐕 ${label(dl)} ${d.name} มีนัด: ${a.purpose || 'นัดหมาย'}${a.hospital ? ` ที่ ${a.hospital}` : ''}`);
      });
      (d.vetVisits || []).forEach((v) => {
        const dl = daysUntil(v.date);
        if (dl === 0 || dl === 1) lines.push(`🩺 ${label(dl)} ${d.name} นัดพบหมอ${v.hospital ? ` ที่ ${v.hospital}` : ''}${v.reason ? ` (${v.reason})` : ''}`);
      });
    });

    if (lines.length > 0) {
      await pushLine(`📅 แจ้งเตือนวันนี้จากเป๋าตุง Family\n\n${lines.join('\n')}`);
    }

    res.status(200).json({ ok: true, sent: lines.length });
  } catch (e) {
    console.error('cron-reminders error', e);
    res.status(200).json({ ok: false, error: e.message });
  }
}
