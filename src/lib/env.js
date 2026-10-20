import { z } from 'zod';

const envSchema = z.object({
  APP_URL: z.string().default('http://localhost:3000'),
  SELLER_NAME: z.string().default('Merchant Store'),
  MERCHANT_IBAN: z.string().default(''),
  MERCHANT_CITY: z.string().default('Karachi'),
  MAX_AMOUNT_RS: z.coerce.number().default(500000),
  PAYMENT_EXPIRY_MINUTES: z.coerce.number().default(15),
  MAX_OFFSET_PAISA: z.coerce.number().default(299),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/adaigi_dev'),
  ADMIN_EMAIL: z.string().default(''),
  ADMIN_PASSWORD: z.string().default(''),
  ADMIN_PASSWORD_HASH: z.string().default(''),
  SESSION_SECRET: z.string().default(''),
  GMAIL_ADDRESS: z.string().default(''),
  GMAIL_APP_PASSWORD: z.string().default(''),
  GMAIL_FOLDER: z.string().default('INBOX'),
  BANK_SENDER_ALLOWLIST: z.string().default(''),
  REQUIRE_EMAIL_AUTH: z.coerce.boolean().default(false),
  SYNC_LOOKBACK_HOURS: z.coerce.number().default(24),
  SYNC_MIN_INTERVAL_SECONDS: z.coerce.number().default(15),
  SYNC_WORKER_INTERVAL_SECONDS: z.coerce.number().default(15),
  LATE_GRACE_MINUTES: z.coerce.number().default(30),
  EMAIL_RETENTION_DAYS: z.coerce.number().default(60),
  CRON_SECRET: z.string().default(''),
});

export const env = envSchema.parse(process.env);
