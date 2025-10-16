import twilio from 'twilio';
export default async function handler(req, res) {
  // --- CORS freischalten ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Wenn der Browser zuerst "OPTIONS" sendet (normal bei CORS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // --- ab hier bleibt dein bisheriger Code ---

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Verify-Debug-Id, X-Client');
}

export default async function handler(req, res) {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) return res.status(400).json({ error: 'Phone and code are required' });

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    if (check.status === 'approved') {
      return res.status(200).json({ ok: true, status: check.status, sid: check.sid });
    }
    return res.status(400).json({ error: 'Invalid or expired code', status: check.status });
  } catch (err) {
    console.error('Twilio check-code error:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
