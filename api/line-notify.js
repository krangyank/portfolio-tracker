export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { message, to } = req.body;
    const target = to || process.env.LINE_GROUP_ID;
    if (!target) {
      res.status(400).json({ error: 'ไม่มี LINE Group ID ตั้งค่าไว้ (LINE_GROUP_ID) — ต้องดึงจาก webhook log ก่อน' });
      return;
    }
    if (!message) {
      res.status(400).json({ error: 'ไม่มีข้อความที่จะส่ง' });
      return;
    }
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ to: target, messages: [{ type: 'text', text: message }] }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      res.status(200).json({ error: (data && data.message) || `LINE API error (status ${response.status})` });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
