import { env } from '../config/env.js';

export async function sendPasswordResetEmail(to, link) {
  if (!env.resendApiKey) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Password reset requested but no email service is configured (RESEND_API_KEY).');
    } else {
      console.log(`\n[DEV] Password reset link for ${to}:\n${link}\n(Set RESEND_API_KEY to send real emails.)\n`);
    }
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.mailFrom,
      to,
      subject: 'Reset your SpendWise password',
      html: `<p>Someone asked to reset the password for your SpendWise account.</p>
             <p><a href="${link}">Choose a new password</a> (the link works for 30 minutes).</p>
             <p>If this wasn't you, you can ignore this email.</p>`,
    }),
  });
  if (!res.ok) console.error('Email provider rejected the message:', res.status);
}
