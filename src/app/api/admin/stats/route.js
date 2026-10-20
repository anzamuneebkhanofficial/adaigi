import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { connectDB } from '@/lib/db';
import { Payment } from '@/lib/models/Payment';
import { EmailEvent, SyncState } from '@/lib/models/Auxiliary';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Use $sum aggregation instead of loading all docs into Node to reduce in JS
    const [todayAgg, pendingCount, reviewCount, unmatchedEmails, syncState] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'PAID', paidAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$payableAmountPaisa' }, count: { $sum: 1 } } },
      ]),
      Payment.countDocuments({ status: 'PENDING' }),
      Payment.countDocuments({ status: 'MANUAL_REVIEW' }),
      EmailEvent.countDocuments({ status: 'UNMATCHED' }),
      SyncState.findOne({ key: 'gmail' }).select('lastSuccessAt lastError lockedUntil').lean(),
    ]);

    const todayAmountPaisa = todayAgg[0]?.total ?? 0;
    const todayPaidCount = todayAgg[0]?.count ?? 0;

    return NextResponse.json({
      todayAmountPaisa,
      todayPaidCount,
      pendingCount,
      reviewCount,
      unmatchedEmailsCount: unmatchedEmails,
      syncState: syncState || { lastSuccessAt: null, lastError: null },
    });
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 401 });
  }
}

