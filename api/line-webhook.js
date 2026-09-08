// รับข้อความ/รูปจากกลุ่ม LINE แล้วให้ AI อ่านเป็นรายจ่าย บันทึกเข้า Firestore ให้อัตโนมัติ พร้อมตอบกลับในกลุ่มว่าบันทึกสำเร็จหรือไม่
//
// สิ่งที่ต้องตั้งค่าไว้แล้ว (ถ้าตั้ง cron-dividends.js ไปแล้วจะมีครบอยู่แล้ว):
// - FIREBASE_SERVICE_ACCOUNT
// - ANTHROPIC_API_KEY
// - LINE_CHANNEL_ACCESS_TOKEN
// เพิ่มใหม่ (ไม่บังคับ แต่แนะนำ กันคนนอกยิงเข้ามาปนหรือมือถือเปลี่ยนกลุ่ม):
// - LINE_GROUP_ID  (ถ้าตั้งไว้ จะประมวลผลเฉพาะข้อความจากกลุ่มนี้เท่านั้น ข้อความจากที่อื่นจะถูกข้าม)
//
// แยกเจ้าของรายจ่ายด้วย "ปุ่ม Quick Reply" แทน LINE userId เพราะ Tommy กับภรรยาใช้บัญชี LINE เดียวกัน
// (ตรวจสอบแล้วหลายรอบ 8 ก.ย. 2026 — userId ออกมาเหมือนกันทุกครั้งไม่ว่าใครพิมพ์ ไม่สามารถแยกได้)
// ทุกข้อความบันทึกเข้าบัญชี Tommy เป็นค่าเริ่มต้นเสมอ แล้วแนบปุ่ม "ย้ายเป็นของภรรยา" มาด้วย
// ถ้ากดปุ่มนั้น ระบบจะย้ายรายการนั้นจากบัญชี Tommy ไปบัญชีภรรยาให้อัตโนมัติ

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// รายจ่าย (expenses) เก็บอยู่ในเอกสารส่วนตัวของแต่ละคน (users/{uid}/data/portfolio) ไม่ใช่เอกสารกลาง shared/krangya-family
// UID ของ Tommy: krangyank11@gmail.com — UID ของภรรยา: หาได้จาก Firebase Console > Authentication > Users
// ถ้าเปลี่ยนบัญชีในอนาคตต้องมาแก้ตรงนี้ด้วย
const OWNERS = {
  tommy: { label: '', path: ['users', '7XDNF2jiEVOXXxtnt5tVvUoSgKV2', 'data', 'portfolio'] },
  wife: { label: 'ภรรยา', path: ['users', 'bHbdGCk6G0OK9EXHVdjTfNqJuYr2', 'data', 'portfolio'] },
};

function getDb() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function ownerDocRef(db, ownerKey) {
  const owner = OWNERS[ownerKey] || OWNERS.tommy;
  return db.collection(owner.path[0]).doc(owner.path[1]).collection(owner.path[2]).doc(owner.path[3]);
}

// ดาวน์โหลดรูปที่ส่งเข้ากลุ่ม LINE มาเป็น base64 (ใช้ LINE Content API ต้องมี channel access token)
async function getLineImageBase64(messageId) {
  const res = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`ดึงรูปจาก LINE ไม่สำเร็จ: HTTP ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

// ส่งข้อความ/รูปให้ Claude อ่านแล้วแยกแยะเป็นรายจ่าย (หมวดหมู่ + จำนวนเงิน + โน้ต)
async function extractExpense({ text, imageBase64 }) {
  const content = [];
  if (imageBase64) content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } });
  const prompt = imageBase64
    ? `นี่คือภาพใบเสร็จหรือสลิปโอนเงินที่ส่งเข้ากลุ่ม LINE ครอบครัว อ่านแล้วสรุปเป็นรายจ่าย 1 รายการ (รวมยอดทั้งใบเป็นก้อนเดียว ถ้ามีหลายรายการในใบเดียว) เลือกหมวดหมู่ที่ใกล้เคียงที่สุดจาก: อาหาร, เดินทาง, ที่พัก/น้ำไฟ, ช้อปปิ้ง, สุขภาพ, บันเทิง, การศึกษา, อื่นๆ
ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่นก่อน/หลัง รูปแบบ: {"amount": ตัวเลขไม่มีคอมมา หรือ null ถ้าอ่านยอดไม่ได้, "category": "หมวดหมู่ภาษาไทย", "note": "รายละเอียดสั้นๆ เช่น ชื่อร้าน"}`
    : `นี่คือข้อความที่พิมพ์แจ้งรายจ่ายเข้ากลุ่ม LINE ครอบครัว (ภาษาไทย อาจสั้นๆ ไม่เป็นทางการ เช่น "ค่าข้าว 150" หรือ "ซื้อของ 7-11 320") ข้อความ: "${text}"
แยกแยะเป็นรายจ่าย 1 รายการ เลือกหมวดหมู่ที่ใกล้เคียงที่สุดจาก: อาหาร, เดินทาง, ที่พัก/น้ำไฟ, ช้อปปิ้ง, สุขภาพ, บันเทิง, การศึกษา, อื่นๆ
ถ้าข้อความนี้ไม่ได้พูดถึงรายจ่ายเลย (เช่นคุยเล่นทั่วไป ไม่มีตัวเลขเงิน) ให้ตอบ {"amount": null}
ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่นก่อน/หลัง รูปแบบ: {"amount": ตัวเลขไม่มีคอมมา หรือ null, "category": "หมวดหมู่ภาษาไทย", "note": "รายละเอียดสั้นๆ"}`;
  content.push({ type: 'text', text: prompt });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content }],
    }),
  });
  const data = await response.json();
  if (data.type === 'error' || data.error) throw new Error((data.error && data.error.message) || 'Anthropic API error');
  const rawText = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI ไม่ได้ตอบเป็น JSON');
  return JSON.parse(match[0]);
}

async function replyToLine(replyToken, text, quickReplyItems) {
  if (!replyToken) return;
  const message = { type: 'text', text };
  if (quickReplyItems && quickReplyItems.length > 0) {
    message.quickReply = { items: quickReplyItems };
  }
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages: [message] }),
  });
}

async function handleMessageEvent(event, db) {
  const msg = event.message;
  const replyToken = event.replyToken;
  const groupId = event.source && event.source.groupId;

  // กันข้อความจากนอกกลุ่มที่ตั้งใจไว้ (ถ้าตั้งค่า LINE_GROUP_ID ไว้)
  if (process.env.LINE_GROUP_ID && groupId && groupId !== process.env.LINE_GROUP_ID) return;

  let extracted;
  try {
    if (msg.type === 'image') {
      const imageBase64 = await getLineImageBase64(msg.id);
      extracted = await extractExpense({ imageBase64 });
    } else if (msg.type === 'text') {
      extracted = await extractExpense({ text: msg.text });
    } else {
      return; // สติกเกอร์/วิดีโอ/อื่นๆ ไม่ประมวลผล
    }
  } catch (err) {
    console.error('extractExpense error', err);
    await replyToLine(replyToken, `อ่านรายจ่ายไม่สำเร็จ: ${err.message}`);
    return;
  }

  if (!extracted || extracted.amount === null || extracted.amount === undefined || Number(extracted.amount) <= 0) {
    // ข้อความนี้ไม่ได้พูดถึงรายจ่าย (เช่นคุยเล่น) — เงียบไว้ ไม่ต้องตอบกลับกวนกลุ่ม
    return;
  }

  const record = {
    id: uid(),
    date: new Date().toISOString().slice(0, 10),
    amount: Number(extracted.amount),
    category: extracted.category || 'อื่นๆ',
    note: extracted.note || '',
    source: 'line',
  };

  // ทุกข้อความบันทึกเข้าบัญชี Tommy เป็นค่าเริ่มต้นเสมอ (แยกด้วย userId ไม่ได้ — ดูหมายเหตุบนสุดของไฟล์)
  const docRef = ownerDocRef(db, 'tommy');
  const snap = await docRef.get();
  if (!snap.exists) {
    await replyToLine(replyToken, 'บันทึกไม่สำเร็จ: ไม่พบข้อมูลบัญชี (ตรวจสอบ path Firestore)');
    return;
  }
  const state = snap.data();
  const expenses = [record, ...(state.expenses || [])];
  await docRef.set({ expenses }, { merge: true });

  const quickReply = [
    {
      type: 'action',
      action: {
        type: 'postback',
        label: 'ย้ายเป็นของภรรยา',
        data: `move:${record.id}`,
        displayText: 'ย้ายเป็นของภรรยา',
      },
    },
  ];
  await replyToLine(
    replyToken,
    `บันทึกแล้ว ✓ ${record.category} ฿${record.amount.toLocaleString('th-TH')}${record.note ? ` (${record.note})` : ''}`,
    quickReply
  );
}

async function handlePostbackEvent(event, db) {
  const replyToken = event.replyToken;
  const data = (event.postback && event.postback.data) || '';
  const match = data.match(/^move:(.+)$/);
  if (!match) return;
  const recordId = match[1];

  const fromRef = ownerDocRef(db, 'tommy');
  const toRef = ownerDocRef(db, 'wife');

  const fromSnap = await fromRef.get();
  if (!fromSnap.exists) {
    await replyToLine(replyToken, 'ย้ายไม่สำเร็จ: ไม่พบข้อมูลบัญชี Tommy');
    return;
  }
  const fromState = fromSnap.data();
  const fromExpenses = fromState.expenses || [];
  const record = fromExpenses.find((e) => e.id === recordId);
  if (!record) {
    await replyToLine(replyToken, 'ไม่พบรายการนี้แล้ว (อาจถูกย้ายไปแล้ว หรือมีรายการใหม่มาแทนที่)');
    return;
  }

  const remainingExpenses = fromExpenses.filter((e) => e.id !== recordId);
  await fromRef.set({ expenses: remainingExpenses }, { merge: true });

  const toSnap = await toRef.get();
  if (!toSnap.exists) {
    // เอากลับเข้าบัญชี Tommy เหมือนเดิม ถ้าบัญชีภรรยาไม่มีอยู่จริง กันข้อมูลหาย
    await fromRef.set({ expenses: fromExpenses }, { merge: true });
    await replyToLine(replyToken, 'ย้ายไม่สำเร็จ: ไม่พบบัญชีภรรยา (ตรวจสอบ path Firestore) — รายการยังอยู่ที่บัญชีคุณเหมือนเดิม');
    return;
  }
  const toState = toSnap.data();
  const toExpenses = [record, ...(toState.expenses || [])];
  await toRef.set({ expenses: toExpenses }, { merge: true });

  await replyToLine(replyToken, `ย้ายแล้ว ✓ ${record.category} ฿${Number(record.amount).toLocaleString('th-TH')}${record.note ? ` (${record.note})` : ''} → บัญชีภรรยา`);
}

export default async function handler(req, res) {
  // LINE ต้องได้ 200 กลับเสมอ ไม่งั้นจะ retry รัวๆ และอาจปิด webhook ให้อัตโนมัติ
  if (req.method !== 'POST') {
    res.status(200).json({ ok: true });
    return;
  }
  try {
    const events = (req.body && req.body.events) || [];
    const db = getDb();
    // ประมวลผลทีละ event ให้เสร็จก่อนตอบ LINE (ถ้ามีหลาย event พร้อมกันในคำขอเดียว)
    for (const e of events) {
      console.log('LINE event:', JSON.stringify(e));
      if (e.source && e.source.groupId) console.log('>>> GROUP ID FOUND:', e.source.groupId);
      if (e.source && e.source.userId) console.log('>>> USER ID:', e.source.userId);
      if (e.type === 'message') {
        try { await handleMessageEvent(e, db); }
        catch (err) { console.error('handleMessageEvent error', err); }
      } else if (e.type === 'postback') {
        try { await handlePostbackEvent(e, db); }
        catch (err) { console.error('handlePostbackEvent error', err); }
      }
    }
  } catch (err) {
    console.error('line-webhook error', err);
  }
  res.status(200).json({ ok: true });
}
