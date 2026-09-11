// รันอัตโนมัติทุกวัน 08:00 น. เวลาไทย (ตั้งเวลาไว้ใน vercel.json) — รวม 2 งานไว้ในไฟล์เดียว (เหลือ cron แค่ 2 ตัวรวมกับปันผล พอดีกับโควตาฟรีของ Vercel Hobby)
// 1) นัดหมอสัตว์เลี้ยง — เช็คทุกวัน (นัดหมอต้องแม่นยำเป๊ะ ใช้ reminderDays ตรงตัว)
// 2) รถยนต์ (ภาษี/พ.ร.บ./ประกันภัยชั้น 1) — เช็คแค่ "วันที่ 1 ของทุกเดือน" เท่านั้น (Tommy บอกว่าเดือนละครั้งพอ ไม่ต้องเป๊ะทุกวันเหมือนนัดหมอ)
//    ผลคือแจ้งเตือนแบบ "ใกล้หมดอายุภายใน X วัน" กว้างๆ แทนการจับวันตรงเป๊ะแบบนัดหมอ (X = ค่ามากสุดใน reminderDays ที่ตั้งไว้ต่อรายการ)
//
// ใช้ Environment Variable ชุดเดียวกับไฟล์ cron อื่นๆ อยู่แล้ว (FIREBASE_SERVICE_ACCOUNT, CRON_SECRET, LINE_CHANNEL_ACCESS_TOKEN, LINE_GROUP_ID)

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// dogs/vehicles (นัดหมอ/รถยนต์) เก็บอยู่ในเอกสารกลาง (ใช้ร่วมกับภรรยา)
const SHARED_FIRESTORE_PATH = ['shared', 'krangya-family', 'data', 'main'];
const VEHICLE_ITEM_LABELS = { tax: '🚙 ภาษีรถยนต์', compulsory: '📄 พ.ร.บ.', insurance: '🛡️ ประกันภัยชั้น 1' };

function getDb() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

async function sendLineNotify(message, to) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const groupId = to || process.env.LINE_GROUP_ID;
  if (!token || !groupId) return;
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: groupId, messages: [{ type: 'text', text: message }] }),
  });
}

function todayBangkokStr() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date())
    .reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function daysBetween(fromStr, toStr) {
  const a = new Date(fromStr + 'T00:00:00Z');
  const b = new Date(toStr + 'T00:00:00Z');
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}
function formatDateDMY(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// --- ส่วนที่ 1: นัดหมอสัตว์เลี้ยง (เช็คทุกวัน) ---
async function checkAppointments(sharedState, today) {
  const dogs = sharedState.dogs || [];
  let sentCount = 0;
  let changed = false;
  const pending = [];

  const nextDogs = dogs.map((d) => {
    const appts = d.appointments || [];
    let apptsChanged = false;
    const nextAppts = appts.map((appt) => {
      if (!appt.date || appt.date < today) return appt;
      const daysLeft = daysBetween(today, appt.date);
      const reminderDays = (appt.reminderDays && appt.reminderDays.length > 0) ? appt.reminderDays : [7, 3, 1];
      if (!reminderDays.includes(daysLeft)) return appt;
      const remindersSent = appt.remindersSent || [];
      if (remindersSent.includes(daysLeft)) return appt;

      const whenText = daysLeft === 0 ? 'วันนี้' : `อีก ${daysLeft} วัน`;
      const lines = [`📅 นัดหมอใกล้ถึงแล้ว! ${d.name} (${whenText})`, `วันนัด: ${formatDateDMY(appt.date)}${appt.time ? ' ' + appt.time + ' น.' : ''}`];
      if (appt.hospital) lines.push(`โรงพยาบาล: ${appt.hospital}`);
      if (appt.doctor) lines.push(`หมอ: ${appt.doctor}`);
      if (appt.purpose) lines.push(`เหตุผล: ${appt.purpose}`);
      pending.push(sendLineNotify(lines.join('\n'), d.lineGroupId).catch(() => {}));
      sentCount += 1;
      apptsChanged = true;
      return { ...appt, remindersSent: [...remindersSent, daysLeft] };
    });
    if (apptsChanged) { changed = true; return { ...d, appointments: nextAppts }; }
    return d;
  });

  await Promise.all(pending);
  return { nextDogs, changed, sentCount };
}

// --- ส่วนที่ 2: รถยนต์ (เช็คเฉพาะวันที่ 1 ของเดือน) ---
async function checkVehicles(sharedState, today) {
  const vehicles = sharedState.vehicles || [];
  let sentCount = 0;
  let changed = false;
  const pending = [];
  const itemKeys = ['tax', 'compulsory', 'insurance'];

  const nextVehicles = vehicles.map((v) => {
    let vChanged = false;
    const nextV = { ...v };
    itemKeys.forEach((key) => {
      const item = v[key];
      if (!item || !item.expiryDate) return;
      if (item.expiryDate < today) return; // หมดอายุไปแล้ว ไม่เตือนซ้ำ
      const daysLeft = daysBetween(today, item.expiryDate);
      const reminderDays = (item.reminderDays && item.reminderDays.length > 0) ? item.reminderDays : [30, 15, 7];
      const windowDays = Math.max(...reminderDays);
      if (daysLeft > windowDays) return; // ยังไม่เข้าเขตที่ต้องเตือน
      if (item.lastReminderExpiry === item.expiryDate) return; // เตือนไปแล้วรอบนี้ (จนกว่าจะเปลี่ยนวันหมดอายุตอนต่ออายุใหม่)

      const lines = [`${VEHICLE_ITEM_LABELS[key]} ใกล้หมดอายุแล้ว! ${v.name}${v.plate ? ` (${v.plate})` : ''} (อีก ${daysLeft} วัน)`, `วันหมดอายุ: ${formatDateDMY(item.expiryDate)}`];
      if (item.company) lines.push(`บริษัท: ${item.company}`);
      if (item.cost) lines.push(`ค่าใช้จ่ายรอบก่อน: ฿${Number(item.cost).toLocaleString('th-TH')}`);
      pending.push(sendLineNotify(lines.join('\n')).catch(() => {}));
      sentCount += 1;
      vChanged = true;
      nextV[key] = { ...item, lastReminderExpiry: item.expiryDate };
    });
    if (vChanged) { changed = true; return nextV; }
    return v;
  });

  await Promise.all(pending);
  return { nextVehicles, changed, sentCount };
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const db = getDb();
    const docRef = db.collection(SHARED_FIRESTORE_PATH[0]).doc(SHARED_FIRESTORE_PATH[1]).collection(SHARED_FIRESTORE_PATH[2]).doc(SHARED_FIRESTORE_PATH[3]);
    const snap = await docRef.get();
    if (!snap.exists) {
      res.status(404).json({ error: 'ไม่พบเอกสารข้อมูลกลาง ตรวจสอบ SHARED_FIRESTORE_PATH ในไฟล์นี้ว่าตรงกับ App.jsx ไหม' });
      return;
    }
    const sharedState = snap.data();
    const today = todayBangkokStr();
    const isFirstOfMonth = today.slice(8, 10) === '01';

    const apptResult = await checkAppointments(sharedState, today);
    const vehicleResult = isFirstOfMonth
      ? await checkVehicles(sharedState, today)
      : { nextVehicles: sharedState.vehicles || [], changed: false, sentCount: 0 };

    const patch = {};
    if (apptResult.changed) patch.dogs = apptResult.nextDogs;
    if (vehicleResult.changed) patch.vehicles = vehicleResult.nextVehicles;
    if (Object.keys(patch).length > 0) await docRef.set(patch, { merge: true });

    res.status(200).json({
      ok: true,
      appointments: { sent: apptResult.sentCount },
      vehicles: { checked: isFirstOfMonth, sent: vehicleResult.sentCount },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
