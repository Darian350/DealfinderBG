import twilio from "twilio";

const allowOrigin = process.env.CORS_ALLOW_ORIGIN || "*";
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { phone, code } = req.body || {};
    if (!phone || !/^\+[1-9]\d{6,14}$/.test(String(phone))) {
      return res.status(400).json({ error: "INVALID_PHONE" });
    }
    if (!code || !/^\d{4,8}$/.test(String(code))) {
      return res.status(400).json({ error: "INVALID_CODE" });
    }

    const check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    if (check.status === "approved") {
      return res.status(200).json({ success: true, status: check.status });
    }
    return res.status(400).json({ error: "CODE_NOT_APPROVED", status: check.status });
  } catch (err) {
    console.error("Twilio check-code error:", err);
    return res.status(400).json({ error: "VERIFY_CHECK_FAILED", code: err.code, message: err.message });
  }
}
