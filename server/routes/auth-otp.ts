import type { RequestHandler } from "express";
import nodemailer from "nodemailer";

const otpStore = new Map<string, { code: string; exp: number }>();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendMail(to: string, subject: string, html: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("MAIL_NOT_CONFIGURED");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  await transporter.sendMail({ from: user, to, subject, html });
}

export const sendCode: RequestHandler = async (req, res) => {
  try {
    const { email, name } = req.body as { email?: string; name?: string };
    if (!email) return res.status(400).json({ error: "Email required" });
    const code = generateCode();
    const exp = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(email.toLowerCase(), { code, exp });
    const title = "Your verification code";
    const html = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5">
        <h2>Verification code</h2>
        <p>Hello${name ? ` ${name}` : ""}, use this code to verify your email:</p>
        <p style="font-size:24px;font-weight:700;letter-spacing:6px">${code}</p>
        <p>This code expires in 10 minutes.</p>
      </div>`;
    await sendMail(email, title, html);
    res.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message || "MAIL_ERROR";
    const status = msg === "MAIL_NOT_CONFIGURED" ? 501 : 500;
    res.status(status).json({ error: msg });
  }
};

export const verifyCode: RequestHandler = async (req, res) => {
  const { email, code } = req.body as { email?: string; code?: string };
  if (!email || !code) return res.status(400).json({ error: "Missing fields" });
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return res.status(400).json({ error: "Code not found" });
  if (Date.now() > entry.exp) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ error: "Code expired" });
  }
  if (entry.code !== code)
    return res.status(400).json({ error: "Invalid code" });
  otpStore.delete(email.toLowerCase());
  res.json({ ok: true });
};
