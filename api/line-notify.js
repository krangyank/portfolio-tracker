export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { message, to, flex } = req.body;
    const target = to || process.env.LINE_GROUP_ID;
    if (!target) {
      res.status(400).json({ error: 'ไม่มี LINE Group ID ตั้งค่าไว้ (LINE_GROUP_ID) — ต้องดึงจาก webhook log ก่อน' });
      return;
    }
    // รองรับ 2 แบบ: ข้อความล้วน (message) แบบเดิม หรือการ์ด Flex Message (flex: { altText, contents })
    // altText คือข้อความสำรองที่โชว์ในหน้าแจ้งเตือน/รายการแชท ตอนที่มองไม่เห็นการ์ดจริง (เช่น บนนาฬิกา หรือมือถือรุ่นเก่า)
    let messages;
    if (flex && flex.contents) {
      if (!flex.altText) { res.status(400).json({ error: 'flex.altText จำเป็นต้องมี' }); return; }
      messages = [{ type: 'flex', altText: flex.altText, contents: flex.contents }];
    } else if (message) {
      messages = [{ type: 'text', text: message }];
    } else {
      res.status(400).json({ error: 'ไม่มีข้อความหรือการ์ดที่จะส่ง' });
      return;
    }
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ to: target, messages }),
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
