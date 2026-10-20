import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payment } from '@/lib/models/Payment';
import { syncGmailInbox } from '@/lib/gmail-sync';
import { env } from '@/lib/env';

export const maxDuration = 30;

export async function GET(req) {
  try {
    // Validate Vercel Cron Secret if configured
    if (env.CRON_SECRET) {
      const authHeader = req.headers.get('authorization');
      if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return NextResponse.json({ error: { message: 'Unauthorized cron request' } }, { status: 401 });
      }
    }

    await connectDB();
    const now = new Date();
    const graceMs = (env.LATE_GRACE_MINUTES || 30) * 60 * 1000;
    const graceStart = new Date(now.getTime() - graceMs);

    // Fast indexed check: Only touch Gmail if active pending or recently expired payments exist
    const hasActivePayments = await Payment.exists({
      $or: [
        { status: 'PENDING' },
        { status: 'EXPIRED', expiresAt: { $gte: graceStart } },
      ],
    });

    if (!hasActivePayments) {
      return NextResponse.json({
        ok: true,
        syncedCount: 0,
        skipped: true,
        reason: 'Idle: No pending or grace-period payments to verify',
      });
    }

    const result = await syncGmailInbox(false);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
