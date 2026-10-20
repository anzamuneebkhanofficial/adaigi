import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payment } from '@/lib/models/Payment';
import { syncGmailInbox } from '@/lib/gmail-sync';
import { startBackgroundSyncWorker } from '@/lib/background-worker';

export const maxDuration = 30;

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { publicId } = await params;
    const payment = await Payment.findOne({ publicId });

    if (!payment) {
      return NextResponse.json({ error: { message: 'Payment not found' } }, { status: 404 });
    }

    const now = new Date();
    // Lazy expiry check
    if (payment.status === 'PENDING' && payment.expiresAt && payment.expiresAt <= now) {
      payment.status = 'EXPIRED';
      await payment.save();
    }

    // Trigger verification for pending checkouts
    if (payment.status === 'PENDING') {
      startBackgroundSyncWorker();
      // On Vercel serverless, run throttled sync inline so active customer gets instant confirmation
      await syncGmailInbox(false).catch(() => {});
      const refreshed = await Payment.findOne({ publicId }).select('status expiresAt paidAt').lean();
      if (refreshed) {
        return NextResponse.json({
          status: refreshed.status,
          expiresAt: refreshed.expiresAt,
          paidAt: refreshed.paidAt,
        });
      }
    }

    return NextResponse.json({
      status: payment.status,
      expiresAt: payment.expiresAt,
      paidAt: payment.paidAt,
    });
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
