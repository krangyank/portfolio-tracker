// ฟีเจอร์ BB: รีเฟรชราคาหุ้นไทย (SET) แบบฟรี ผ่าน Yahoo Finance (สัญลักษณ์ต่อท้าย .BK)
// เป็น endpoint ที่ไม่เป็นทางการ (unofficial) — ข้อมูลดีเลย์ประมาณ 15 นาที และ Yahoo อาจเปลี่ยน/ปิดได้โดยไม่แจ้งล่วงหน้า
// ต้องเรียกผ่านเซิร์ฟเวอร์นี้เพราะ Yahoo ไม่อนุญาตให้เบราว์เซอร์เรียกตรงๆ (ติด CORS)
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { symbol } = req.query;
    if (!symbol) {
      res.status(400).json({ error: 'missing symbol' });
      return;
    }
    const yahooSymbol = `${String(symbol).toUpperCase()}.BK`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioTrackerBot/1.0)' },
    });
    if (!r.ok) {
      res.status(502).json({ error: `Yahoo Finance ตอบกลับผิดพลาด (HTTP ${r.status})` });
      return;
    }
    const data = await r.json();
    const result = data && data.chart && data.chart.result && data.chart.result[0];
    const price = result && result.meta && result.meta.regularMarketPrice;
    if (!price) {
      res.status(404).json({ error: `ไม่พบราคาสำหรับสัญลักษณ์ "${symbol}"` });
      return;
    }
    res.status(200).json({ price, currency: (result.meta && result.meta.currency) || 'THB', delayed: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
