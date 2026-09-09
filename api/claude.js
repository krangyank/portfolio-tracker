export const config = {
  maxDuration: 60,
};

// Haiku ถูกกว่า Sonnet มาก เหมาะกับงานอ่านตัวเลข/ฟิลด์ง่ายๆ จากภาพเดียว (ยอดบัตร, น้ำหนัก, ฉลากยา ฯลฯ)
// client จะส่ง fast:true มาสำหรับงานพวกนี้ (ดู askServer ใน App.jsx) — งานที่ต้องตีความซับซ้อนกว่า
// (กรมธรรม์หลายหน้า, ตารางออเดอร์ที่ต้องกรองสถานะ, web search) ยังใช้ Sonnet ตามเดิมเป็นค่า default
const FAST_MODEL = 'claude-haiku-4-5-20251001';
const DEFAULT_MODEL = 'claude-sonnet-5';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { prompt, imageBase64, mediaType, webSearch, fast } = req.body;
    const content = [];
    if (imageBase64) {
      content.push({ type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } });
    }
    content.push({ type: 'text', text: prompt });

    const body = {
      model: fast && !webSearch ? FAST_MODEL : DEFAULT_MODEL,
      max_tokens: 8192,
      messages: [{ role: 'user', content }],
    };
    if (webSearch) {
      body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }];
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Anthropic ตอบ error กลับมาแบบ { type: "error", error: { type, message } } — เดิมโค้ดนี้เงียบไว้ ทำให้ client เห็นแค่ "ไม่พบ JSON" โดยไม่รู้สาเหตุจริง
    if (data.type === 'error' || data.error) {
      const msg = (data.error && data.error.message) || 'Anthropic API error (ไม่ทราบรายละเอียด)';
      res.status(200).json({ error: msg });
      return;
    }

    const text = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');

    // ถ้าเปิด web search แต่ไม่มีข้อความตอบกลับเลย (เช่น ยังไม่ได้เปิดใช้ Web search ใน Anthropic Console ขององค์กร) ให้แจ้งสาเหตุที่เป็นไปได้แทนการส่งค่าว่างเงียบๆ
    if (!text && webSearch) {
      res.status(200).json({ error: 'AI ไม่ได้ตอบข้อความกลับมา (ถ้าเพิ่งเปิดใช้ฟีเจอร์ค้นเว็บ ให้เช็คว่าเปิด "Web search" ใน Anthropic Console ขององค์กรแล้วหรือยัง — Settings > ฟีเจอร์นี้ปิดอยู่โดย default)' });
      return;
    }

    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
