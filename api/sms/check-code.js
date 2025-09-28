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

  const { phone, code } = req.body || {};
  if (!phone || !/^\+[1-9]\d{6,14}$/.test(String(phone)) || !code) {
    return res.status(400).json({ error: "Phone and code are required" });
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    if (check.status === "approved") {
      return res.status(200).json({ ok: true, status: "approved" });
    }
    return res.status(400).json({ ok: false, status: check.status || "denied" });
  } catch (err) {
    console.error("Twilio check-code error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
