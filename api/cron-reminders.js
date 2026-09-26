// รันอัตโนมัติทุกวัน (ตั้งเวลาไว้ใน vercel.json — แนะนำ 08:00 น. ให้รันหลัง cron-dividends ที่ 07:00)
// ไล่เช็คทุกจุดในแอปที่มีปุ่มตั้ง "แจ้งเตือนล่วงหน้า (วัน)" อยู่แล้ว (นัดหมายลูกๆ, ยาเห็บหมัด/พยาธิ, ค่าเช่า, ครบสัญญาเช่า, บัตรเครดิต, ประกัน)
// แล้วส่ง LINE เตือนให้เอง ไม่ต้องเปิดแอปเข้ามาดูก่อนถึงจะรู้ — แก้ปัญหาที่ก่อนหน้านี้การเตือนเป็นแค่แถบสีในแอปเท่านั้น
//
// ใช้ pattern เดียวกับ api/cron-dividends.js ทุกอย่าง (Firebase Admin init, CRON_SECRET, FIRESTORE_PATH ของ Tommy)
// อ่านค่าเพิ่มจาก 2 เอกสาร: เอกสารส่วนตัวของภรรยา (สำหรับบัตรเครดิต/ประกันของภรรยาเอง ถ้ามี) และเอกสารกลาง shared/krangya-family (ลูกๆ + บ้านเช่า)
//
// สิ่งที่ต้องมี (ใช้ค่าเดิมจาก cron-dividends.js ได้เลย ไม่ต้องตั้งใหม่):
// 1. Environment Variable: FIREBASE_SERVICE_ACCOUNT
// 2. Environment Variable: CRON_SECRET
// 3. Environment Variable: LINE_CHANNEL_ACCESS_TOKEN, LINE_GROUP_ID (ใช้อยู่แล้วกับ LINE webhook/notify จุดอื่น)
// 4. อัปโหลดไฟล์นี้ + เพิ่ม entry ใหม่ใน vercel.json (ดูตัวอย่างท้ายไฟล์นี้)

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const TOMMY_PATH = ['users', '7XDNF2jiEVOXXxtnt5tVvUoSgKV2', 'data', 'portfolio'];
// UID ของภรรยา (Tunn0202@gmail.com) — ตามที่บันทึกไว้จากการทดสอบ LINE webhook ก่อนหน้านี้
const WIFE_PATH = ['users', 'bHbdGCk6G0OK9EXHVdjTfNqJuYr2', 'data', 'portfolio'];
const SHARED_PATH = ['shared', 'krangya-family', 'data', 'main'];

function getDb() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

function docRefFromPath(db, path) {
  return db.collection(path[0]).doc(path[1]).collection(path[2]).doc(path[3]);
}

function formatDateDMY(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function monthKey(dateStr) {
  return (dateStr || new Date().toISOString().slice(0, 10)).slice(0, 7);
}

// คำนวณวันครบกำหนดจ่ายบัตรของรอบปัจจุบัน จาก dueDay (วันที่ในเดือน) — ตรรกะเดียวกับ nextCardDueDate ใน App.jsx
function nextCardDueDate(dueDay) {
  const now = new Date();
  let due = new Date(now.getFullYear(), now.getMonth(), Number(dueDay || 15));
  if (due < now) due = new Date(now.getFullYear(), now.getMonth() + 1, Number(dueDay || 15));
  return due.toISOString().slice(0, 10);
}

async function sendLineText(message, to) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const groupId = to || process.env.LINE_GROUP_ID;
  if (!token || !groupId) return;
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: groupId, messages: [{ type: 'text', text: message }] }),
  });
}

// เช็ครายการหนึ่งตัว: ถึงกำหนดวันนี้พอดี (ตรงกับหนึ่งใน reminderDays) หรือเลยกำหนดไปแล้ว (แจ้งซ้ำทุกวันจนกว่าจะแก้ไข)
// คืนค่า { shouldNotify, dedupKey, line } — dedupKey ใช้กันแจ้งซ้ำวันเดียวกันสำหรับรายการที่ยังไม่เลยกำหนด (ส่วนรายการที่เลยกำหนดแล้วไม่กันซ้ำ เพราะอยากให้เตือนต่อเนื่องทุกวันจนกว่าจะจัดการ)
function evaluateItem({ id, label, dueDate, reminderDays, todayStr, remindersSent }) {
  const dl = daysUntil(dueDate);
  if (dl === null) return null;
  const days = reminderDays && reminderDays.length ? reminderDays : [3, 1];
  if (dl < 0) {
    return { shouldNotify: true, dedupKey: null, line: `🔴 ${label} — เลยกำหนดมาแล้ว ${Math.abs(dl)} วัน (${formatDateDMY(dueDate)})` };
  }
  if (days.includes(dl)) {
    const dedupKey = `${id}_${dueDate}_${dl}`;
    if (remindersSent[dedupKey]) return null; // แจ้งไปแล้ววันนี้/ก่อนหน้านี้สำหรับรอบนี้พอดี ไม่แจ้งซ้ำ
    return { shouldNotify: true, dedupKey, line: `🟡 ${label} — อีก ${dl} วันถึงกำหนด (${formatDateDMY(dueDate)})` };
  }
  return null;
}

// ตัดทิ้ง dedup key ที่เก่าเกิน 45 วัน กันเอกสารโตไม่มีที่สิ้นสุด
function pruneRemindersSent(remindersSent, todayStr) {
  const cutoff = new Date(todayStr); cutoff.setDate(cutoff.getDate() - 45);
  const next = {};
  Object.entries(remindersSent).forEach(([key, sentDate]) => {
    if (!sentDate || new Date(sentDate) >= cutoff) next[key] = sentDate;
  });
  return next;
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const db = getDb();
    const todayStr = new Date().toISOString().slice(0, 10);

    // ข้อความที่จะส่ง แยกเป็นกลุ่มตามปลายทาง LINE (ค่าเริ่มต้น = กลุ่มหลัก, บางตัวมีกลุ่มเฉพาะของลูกๆ แต่ละตัว)
    const messagesByGroup = { DEFAULT: [] };
    const pushLine = (line, groupId) => {
      const key = groupId || 'DEFAULT';
      if (!messagesByGroup[key]) messagesByGroup[key] = [];
      messagesByGroup[key].push(line);
    };

    // ---------- เอกสารกลาง (ลูกๆ + บ้านเช่า) ----------
    const sharedRef = docRefFromPath(db, SHARED_PATH);
    const sharedSnap = await sharedRef.get();
    const sharedState = sharedSnap.exists ? sharedSnap.data() : {};
    const sharedRemindersSent = sharedState.remindersSent || {};
    let nextSharedRemindersSent = { ...sharedRemindersSent };

    (sharedState.dogs || []).forEach((dog) => {
      const groupId = dog.lineGroupId || undefined;
      // นัดหมาย
      (dog.appointments || []).forEach((a) => {
        const result = evaluateItem({
          id: `appt_${a.id}`, label: `${dog.name} — นัดหมาย: ${a.purpose || '-'}${a.hospital ? ' @ ' + a.hospital : ''}`,
          dueDate: a.date, reminderDays: a.reminderDays, todayStr, remindersSent: sharedRemindersSent,
        });
        if (result && result.shouldNotify) { pushLine(result.line, groupId); if (result.dedupKey) nextSharedRemindersSent[result.dedupKey] = todayStr; }
      });
      // ยาเห็บหมัด/พยาธิ
      const ft = dog.fleaTick;
      if (ft && ft.lastGivenDate && ft.intervalDays) {
        const due = new Date(ft.lastGivenDate); due.setDate(due.getDate() + Number(ft.intervalDays || 84));
        const dueDate = due.toISOString().slice(0, 10);
        const result = evaluateItem({
          id: `flea_${dog.id}`, label: `${dog.name} — ถึงรอบให้ยา ${ft.productName || 'เห็บหมัด/พยาธิ'}`,
          dueDate, reminderDays: ft.reminderDays, todayStr, remindersSent: sharedRemindersSent,
        });
        if (result && result.shouldNotify) { pushLine(result.line, groupId); if (result.dedupKey) nextSharedRemindersSent[result.dedupKey] = todayStr; }
      }
    });

    (sharedState.properties || []).forEach((p) => {
      // ค่าเช่ารายเดือน (เฉพาะห้องที่มีผู้เช่าอยู่ และเดือนนี้ยังไม่จ่าย)
      if (p.status === 'occupied' && p.rentDueDay) {
        const ym = monthKey(todayStr);
        const paid = ((p.payments || {})[ym] || {}).paid;
        if (!paid) {
          const dueDate = `${ym}-${String(p.rentDueDay).padStart(2, '0')}`;
          const result = evaluateItem({ id: `rent_${p.id}`, label: `ค่าเช่า: ${p.name}`, dueDate, reminderDays: p.rentReminderDays, todayStr, remindersSent: sharedRemindersSent });
          if (result && result.shouldNotify) { pushLine(result.line); if (result.dedupKey) nextSharedRemindersSent[result.dedupKey] = todayStr; }
        }
      }
      // ครบกำหนดสัญญาเช่า
      if (p.contractEndDate) {
        const result = evaluateItem({ id: `contract_${p.id}`, label: `ครบสัญญาเช่า: ${p.name}`, dueDate: p.contractEndDate, reminderDays: p.reminderDays, todayStr, remindersSent: sharedRemindersSent });
        if (result && result.shouldNotify) { pushLine(result.line); if (result.dedupKey) nextSharedRemindersSent[result.dedupKey] = todayStr; }
      }
    });

    (sharedState.vehicles || []).forEach((v) => {
      // ภาษี/พ.ร.บ./ประกันภัยชั้น 1 — ต่ออายุปีละครั้ง
      const VEHICLE_ITEM_LABELS = { tax: '🚙 ภาษีรถยนต์', compulsory: '📄 พ.ร.บ.', insurance: '🛡️ ประกันภัยชั้น 1' };
      ['tax', 'compulsory', 'insurance'].forEach((key) => {
        const item = v[key];
        if (!item || !item.expiryDate) return;
        const result = evaluateItem({ id: `vitem_${v.id}_${key}`, label: `${v.name} — ${VEHICLE_ITEM_LABELS[key]}`, dueDate: item.expiryDate, reminderDays: item.reminderDays, todayStr, remindersSent: sharedRemindersSent });
        if (result && result.shouldNotify) { pushLine(result.line); if (result.dedupKey) nextSharedRemindersSent[result.dedupKey] = todayStr; }
      });
      // งานซ่อมบำรุง (เช็คระยะ/เปลี่ยนน้ำมันเครื่อง/เปลี่ยนน้ำมันเกียร์) — ครบกำหนดครั้งถัดไป = ครั้งล่าสุด + ทุกกี่วันที่ตั้งไว้
      const VEHICLE_MAINTENANCE_LABELS = { service: '🔧 เช็คระยะ', oilChange: '🛢️ เปลี่ยนน้ำมันเครื่อง', transmission: '⚙️ เปลี่ยนน้ำมันเกียร์' };
      Object.entries(v.maintenance || {}).forEach(([key, m]) => {
        const history = m && m.history;
        if (!history || history.length === 0 || !m.intervalDays) return;
        const latest = [...history].sort((a, b) => b.date.localeCompare(a.date))[0];
        const due = new Date(latest.date); due.setDate(due.getDate() + Number(m.intervalDays || 0));
        const dueDate = due.toISOString().slice(0, 10);
        const result = evaluateItem({ id: `vmaint_${v.id}_${key}`, label: `${v.name} — ${VEHICLE_MAINTENANCE_LABELS[key] || key}`, dueDate, reminderDays: m.reminderDays, todayStr, remindersSent: sharedRemindersSent });
        if (result && result.shouldNotify) { pushLine(result.line); if (result.dedupKey) nextSharedRemindersSent[result.dedupKey] = todayStr; }
      });
    });

    nextSharedRemindersSent = pruneRemindersSent(nextSharedRemindersSent, todayStr);
    await sharedRef.set({ remindersSent: nextSharedRemindersSent }, { merge: true });

    // ---------- เอกสารส่วนตัว (บัตรเครดิต + ประกัน ของ Tommy และภรรยา) ----------
    for (const personalPath of [TOMMY_PATH, WIFE_PATH]) {
      const ref = docRefFromPath(db, personalPath);
      const snap = await ref.get();
      if (!snap.exists) continue;
      const state = snap.data();
      const remindersSent = state.remindersSent || {};
      let nextRemindersSent = { ...remindersSent };

      (state.creditCards || []).forEach((c) => {
        const dueDate = nextCardDueDate(c.dueDay);
        const result = evaluateItem({ id: `card_${c.id}`, label: `บัตร ${c.bankName || ''} ${c.cardName || ''}`.trim(), dueDate, reminderDays: c.reminderDays, todayStr, remindersSent });
        if (result && result.shouldNotify) { pushLine(result.line); if (result.dedupKey) nextRemindersSent[result.dedupKey] = todayStr; }
      });

      (state.insurancePolicies || []).forEach((p) => {
        if (!p.nextDueDate) return;
        const result = evaluateItem({ id: `ins_${p.id}`, label: `เบี้ยประกัน: ${p.planName || p.company || '-'}`, dueDate: p.nextDueDate, reminderDays: p.reminderDays, todayStr, remindersSent });
        if (result && result.shouldNotify) { pushLine(result.line); if (result.dedupKey) nextRemindersSent[result.dedupKey] = todayStr; }
      });

      nextRemindersSent = pruneRemindersSent(nextRemindersSent, todayStr);
      await ref.set({ remindersSent: nextRemindersSent }, { merge: true });
    }

    // ---------- ส่ง LINE ----------
    let totalSent = 0;
    for (const [groupKey, lines] of Object.entries(messagesByGroup)) {
      if (lines.length === 0) continue;
      const to = groupKey === 'DEFAULT' ? undefined : groupKey;
      await sendLineText(`🔔 รายการที่ใกล้ถึงกำหนด/เลยกำหนดวันนี้:\n\n${lines.join('\n')}`, to);
      totalSent += lines.length;
    }

    res.status(200).json({ ok: true, totalReminders: totalSent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ==================== เพิ่มใน vercel.json ====================
// เพิ่ม object นี้เข้าไปใน array "crons" ที่มีอยู่แล้ว (อย่าลบ entry เดิมของ cron-dividends) ตัวอย่างเช่น:
// {
//   "crons": [
//     { "path": "/api/cron-dividends", "schedule": "0 7 * * *" },
//     { "path": "/api/cron-reminders", "schedule": "0 8 * * *" }
//   ]
// }
