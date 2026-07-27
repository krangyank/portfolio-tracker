export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { action, code, refreshToken, clientId } = req.body;
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);

    if (action === 'exchange') {
      params.append('code', code);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', 'postmessage');
    } else if (action === 'refresh') {
      params.append('refresh_token', refreshToken);
      params.append('grant_type', 'refresh_token');
    } else {
      res.status(400).json({ error: 'invalid action' });
      return;
    }

    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await r.json();
    if (data.error) {
      res.status(400).json({ error: data.error_description || data.error });
      return;
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
