const nodemailer = require('nodemailer');
let transporter;
function getTransport() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  )
    return null;
  if (!transporter)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE) === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  return transporter;
}
async function sendEmail({ to, subject, text, html }) {
  const transport = getTransport();
  if (!transport) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV EMAIL] to=${to} subject=${subject}\n${text || ""}`);
      return { previewOnly: true };
    }
    throw new Error("Email provider is not configured");
  }
  return transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

module.exports = sendEmail;
