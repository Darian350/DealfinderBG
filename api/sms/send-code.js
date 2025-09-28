import twilio from "twilio";

function cors(res) {
  const origin = process.env.CORS_ALLOW_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { phone } = req.body || {};
    if (!phone || !/^\+[1-9]\d{6,14}$/.test(String(phone))) {
      return res.status(400).json({ error: "Invalid or missing phone (E.164)" });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: "sms" });

    return res.status(200).json({ ok: true, sid: verification.sid });
  } catch (err) {
    console.error("Twilio send-code error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
