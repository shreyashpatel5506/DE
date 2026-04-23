const appName = "CivicReport";

function baseTemplate({ title, subtitle, bodyHtml, ctaLabel, ctaUrl, footer }) {
  const cta =
    ctaLabel && ctaUrl
      ? `<a href="${ctaUrl}" style="display:inline-block;padding:12px 20px;background:linear-gradient(135deg,#3b82f6,#10b981);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;">${ctaLabel}</a>`
      : "";

  return `
  <div style="margin:0;padding:24px;background:#0b1220;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e2e8f0;">
    <div style="max-width:600px;margin:0 auto;background:#111827;border:1px solid rgba(59,130,246,0.2);border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.35);">
      <div style="padding:24px 28px;background:linear-gradient(135deg,#2563eb,#10b981);">
        <h1 style="margin:0;font-size:22px;line-height:1.2;color:#ffffff;">${title}</h1>
        <p style="margin:8px 0 0 0;font-size:13px;color:rgba(255,255,255,0.9);">${subtitle}</p>
      </div>
      <div style="padding:28px;">
        ${bodyHtml}
        ${cta ? `<div style="margin-top:24px;">${cta}</div>` : ""}
      </div>
      <div style="padding:14px 28px;border-top:1px solid rgba(148,163,184,0.2);font-size:12px;color:#94a3b8;">
        ${footer || `${appName} Security Mailer`}
      </div>
    </div>
  </div>`;
}

export function getOtpEmailTemplate({ otp, minutes = 10 }) {
  return baseTemplate({
    title: "Email Verification OTP",
    subtitle: `Secure sign-up verification for ${appName}`,
    bodyHtml: `
      <p style="margin:0 0 14px 0;font-size:15px;color:#cbd5e1;">Use this One-Time Password to complete your account registration:</p>
      <div style="margin:8px 0 14px 0;padding:16px;border-radius:12px;border:1px dashed rgba(96,165,250,0.7);background:rgba(37,99,235,0.08);text-align:center;">
        <span style="font-size:32px;letter-spacing:8px;font-weight:700;color:#ffffff;">${otp}</span>
      </div>
      <p style="margin:0;font-size:13px;color:#94a3b8;">This OTP will expire in ${minutes} minutes. If you did not request this, ignore this email.</p>
    `,
  });
}

export function getPasswordResetEmailTemplate({ resetUrl, minutes = 30 }) {
  return baseTemplate({
    title: "Reset Your Password",
    subtitle: `Password assistance for ${appName}`,
    bodyHtml: `
      <p style="margin:0 0 14px 0;font-size:15px;color:#cbd5e1;">We received a request to reset your password. Click the button below to continue.</p>
      <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;">This link expires in ${minutes} minutes.</p>
      <p style="margin:14px 0 0 0;font-size:12px;color:#64748b;word-break:break-all;">If the button doesn't work, copy this URL:<br/>${resetUrl}</p>
    `,
    ctaLabel: "Reset Password",
    ctaUrl: resetUrl,
    footer: `${appName} account security team`,
  });
}
