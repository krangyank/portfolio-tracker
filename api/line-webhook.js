export default async function handler(req, res) {
  // LINE ต้องได้ 200 กลับเสมอ ไม่งั้นจะ retry รัวๆ และอาจปิด webhook ให้อัตโนมัติ
  if (req.method !== 'POST') {
    res.status(200).json({ ok: true });
    return;
  }
  try {
    const events = (req.body && req.body.events) || [];
    events.forEach((e) => {
      console.log('LINE event:', JSON.stringify(e));
      if (e.source && e.source.groupId) console.log('>>> GROUP ID FOUND:', e.source.groupId);
      if (e.source && e.source.userId) console.log('>>> USER ID:', e.source.userId);
    });
  } catch (err) {
    console.error('line-webhook error', err);
  }
  res.status(200).json({ ok: true });
}
