import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { connectDB } from '@/lib/db';
import { Payment } from '@/lib/models/Payment';
import { rupeesToPaisa } from '@/lib/money';
import { nanoid } from 'nanoid';

const PAGE_SIZE = 20;

export async function GET(req) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

    // Build filter
    const query = {};
    if (status) query.status = status;
    if (search) {
      // Server-side regex search across reference, title, and orderRef
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ reference: rx }, { title: rx }, { orderRef: rx }];
    }

    const skip = (page - 1) * PAGE_SIZE;

    // Run count and data fetch in parallel for efficiency
    const [total, payments] = await Promise.all([
      Payment.countDocuments(query),
      Payment.find(query)
        .select('publicId reference title orderRef baseAmountPaisa offsetPaisa payableAmountPaisa status createdAt paidAt paidVia')
        .sort({ _id: -1 }) // _id is a free monotonic index — equivalent to createdAt desc
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
    ]);

    return NextResponse.json({
      payments,
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { title, baseAmountRs, customerNote, orderRef, returnUrl } = body;

    if (!title || !baseAmountRs) {
      return NextResponse.json({ error: { message: 'Title and amount are required' } }, { status: 400 });
    }

    const publicId = nanoid(12);
    // Create reference format AD-XXXX safe characters
    const safeChars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let randomSuffix = '';
    for (let i = 0; i < 4; i++) {
      randomSuffix += safeChars[Math.floor(Math.random() * safeChars.length)];
    }
    const reference = `AD-${randomSuffix}`;

    const payment = await Payment.create({
      publicId,
      reference,
      title,
      customerNote,
      orderRef,
      returnUrl,
      baseAmountPaisa: rupeesToPaisa(baseAmountRs),
      status: 'CREATED',
    });

    return NextResponse.json({ payment });
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
