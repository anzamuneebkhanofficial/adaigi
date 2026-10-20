import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payment } from '@/lib/models/Payment';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { publicId } = await params;
    const payment = await Payment.findOne({ publicId });

    if (!payment) {
      return NextResponse.json({ error: { message: 'Payment not found' } }, { status: 404 });
    }

    if (payment.status === 'PENDING' || payment.status === 'CREATED') {
      payment.status = 'CANCELLED';
      await payment.save();
    }

    return NextResponse.json({ payment });
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
