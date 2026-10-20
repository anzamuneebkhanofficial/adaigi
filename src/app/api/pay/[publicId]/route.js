import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payment } from '@/lib/models/Payment';
import { env } from '@/lib/env';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { publicId } = await params;
    const payment = await Payment.findOne({ publicId }).select('-__v');

    if (!payment) {
      return NextResponse.json({ error: { message: 'Payment not found' } }, { status: 404 });
    }

    return NextResponse.json({
      payment,
      merchantIban: env.MERCHANT_IBAN,
      sellerName: env.SELLER_NAME,
    });
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
