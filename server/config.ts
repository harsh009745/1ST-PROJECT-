import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

let appletConfig: { projectId?: string } = {};
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    appletConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch {
  // ignore
}

export const ENV = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  MEETING_PROVIDER: process.env.MEETING_PROVIDER || 'secure-room',
  CUSTOM_MEETING_BASE_URL: process.env.CUSTOM_MEETING_BASE_URL || '',
  IS_CONFIGURED: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  // Firebase & Admin Authentication configuration
  FIREBASE_PROJECT_ID:
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    appletConfig.projectId ||
    '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : '',
  // Default admin emails (can be comma-separated in env var)
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || 'meetaryan027@gmail.com,admin@valenceaesthetics.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
};

if (!ENV.IS_CONFIGURED) {
  console.warn(
    '⚠️ [WARNING] Razorpay API credentials are not yet configured. Checkout will prompt for credentials in test mode.'
  );
}
