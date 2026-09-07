// รันอัตโนมัติทุกวัน 08:00 น. เวลาไทย (ตั้งเวลาไว้ใน vercel.json) — ไล่ดูนัดหมอ/นัดฉีดวัคซีนของลูกๆ ทุกตัว
// ถ้าวันนี้ตรงกับจำนวนวันล่วงหน้าที่ตั้งไว้ใน "reminderDays" ของนัดนั้นๆ (ค่า default [7,3,1]) จะยิงแจ้งเตือนเข้า LINE ให้
// ใช้ pattern เดียวกับ api/cron-dividends.js ทุกจุด (Firebase Admin, CRON_SECRET, sendLineNotify)
//
// สิ่งที่ต้องตั้งค่า: ใช้ Environment Variable ชุดเดียวกับ cron-dividends.js อยู่แล้ว (FIREBASE_SERVICE_ACCOUNT, CRON_SECRET, LINE_CHANNEL_ACCESS_TOKEN, LINE_GROUP_ID)
// ไม่ต้องตั้งอะไรเพิ่ม แค่อัปโหลดไฟล์นี้ + แก้ vercel.json เพิ่ม cron job ใหม่

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// dogs (นัดหมอ/appointments ของลูกๆ ทุกตัว) เก็บอยู่ในเอกสารกลาง (ใช้ร่วมกับภรรยา) ไม่ใช่เอกสารส่วนตัวของ Tommy
// ต้องตรงกับ SHARED_FIRESTORE_PATH ใน cron-dividends.js และตรงกับที่ updateDog() เขียนใน App.jsx (persistShared)
const SHARED_FIRESTORE_PATH = ['shared', 'krangya-family', 'data', 'main'];

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

// วันที่ "วันนี้" ตามเวลาไทย (ไม่ใช้ new Date() เฉยๆ เพราะ Vercel รันด้วย UTC เที่ยงคืน UTC ยังเป็นเช้าของอีกวันในไทยแล้ว)
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

export default async function handler(req, res) {
  // ป้องกันคนนอกยิง endpoint นี้เล่น — Vercel Cron จะส่ง header นี้มาเองอัตโนมัติถ้าตั้ง CRON_SECRET ไว้
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
    const state = snap.data();
    const dogs = state.dogs || [];
    const today = todayBangkokStr();

    let sentCount = 0;
    let dogsChanged = false;
    const pending = [];

    const nextDogs = dogs.map((d) => {
      const appts = d.appointments || [];
      let apptsChanged = false;
      const nextAppts = appts.map((appt) => {
        if (!appt.date || appt.date < today) return appt; // นัดที่ผ่านไปแล้วข้าม
        const daysLeft = daysBetween(today, appt.date);
        const reminderDays = (appt.reminderDays && appt.reminderDays.length > 0) ? appt.reminderDays : [7, 3, 1];
        if (!reminderDays.includes(daysLeft)) return appt;
        const remindersSent = appt.remindersSent || [];
        if (remindersSent.includes(daysLeft)) return appt; // กันแจ้งซ้ำถ้า cron รันมากกว่า 1 ครั้งในวันเดียว

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
      if (apptsChanged) { dogsChanged = true; return { ...d, appointments: nextAppts }; }
      return d;
    });

    await Promise.all(pending);

    if (dogsChanged) {
      await docRef.set({ dogs: nextDogs }, { merge: true });
    }

    res.status(200).json({ ok: true, checked: dogs.length, sent: sentCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
