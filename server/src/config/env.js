import 'dotenv/config';

const required = ['MONGODB_URI', 'JWT_SECRET'];
export function assertEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`);
}

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigin,
  // Base URL used inside password-reset links
  appUrl: process.env.APP_URL || clientOrigin,
  // Optional: set to send real emails through resend.com
  resendApiKey: process.env.RESEND_API_KEY || '',
  mailFrom: process.env.MAIL_FROM || 'SpendWise <onboarding@resend.dev>',
};
