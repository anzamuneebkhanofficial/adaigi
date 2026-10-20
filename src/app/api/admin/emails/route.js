import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { connectDB } from '@/lib/db';
import { EmailEvent } from '@/lib/models/Auxiliary';

const PAGE_SIZE = 20;

export async function GET(req) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * PAGE_SIZE;

    const [total, emails] = await Promise.all([
      EmailEvent.countDocuments(query),
      EmailEvent.find(query)
        .select('from subject amountPaisa reference receivedAt status paymentId parseOk expireAt')
        .sort({ receivedAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
    ]);

    return NextResponse.json({
      emails,
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 401 });
  }
}
