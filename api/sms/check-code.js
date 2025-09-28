import twilio from "twilio";

function setCors(res, origin) {
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res, req.headers.origin);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { phone, code } = req.body || {};
  if (!phone || !code) return res.status(400).json({ error: "Phone and code are required" });

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    if (verificationCheck.status === "approved") {
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: "Invalid or expired code" });
  } catch (err) {
    console.error("Twilio check-code error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
