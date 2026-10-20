import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payment } from '@/lib/models/Payment';
import { generateRaastQR } from '@/lib/raast/qr';
import { paisaToRupees } from '@/lib/money';
import { env } from '@/lib/env';

import { startBackgroundSyncWorker } from '@/lib/background-worker';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { publicId } = await params;
    const payment = await Payment.findOne({ publicId });

    if (!payment) {
      return NextResponse.json({ error: { message: 'Payment not found' } }, { status: 404 });
    }

    if (payment.status === 'PAID') {
      return NextResponse.json({ payment });
    }

    const now = new Date();
    // If already pending and not expired, return as idempotent
    if (payment.status === 'PENDING' && payment.expiresAt && payment.expiresAt > now) {
      startBackgroundSyncWorker();
      return NextResponse.json({ payment });
    }

    // Allocate next available unique paisa offset
    let chosenOffset = 1;
    const maxOffset = env.MAX_OFFSET_PAISA || 299;
    const activePayments = await Payment.find({
      status: 'PENDING',
      baseAmountPaisa: payment.baseAmountPaisa,
      expiresAt: { $gt: now },
      _id: { $ne: payment._id },
    }).select('offsetPaisa');

    const usedOffsets = new Set(activePayments.map((p) => p.offsetPaisa));
    while (usedOffsets.has(chosenOffset) && chosenOffset <= maxOffset) {
      chosenOffset++;
    }

    if (chosenOffset > maxOffset) {
      return NextResponse.json(
        { error: { message: 'High payment traffic for this exact amount. Please retry in 1 minute.' } },
        { status: 429 }
      );
    }

    payment.offsetPaisa = chosenOffset;
    payment.payableAmountPaisa = payment.baseAmountPaisa + chosenOffset;
    payment.status = 'PENDING';
    payment.startedAt = now;
    payment.expiresAt = new Date(now.getTime() + (env.PAYMENT_EXPIRY_MINUTES || 15) * 60 * 1000);

    // Generate Raast payload
    payment.qrPayload = generateRaastQR({
      iban: env.MERCHANT_IBAN,
      amount: paisaToRupees(payment.payableAmountPaisa),
      merchantName: env.SELLER_NAME,
      merchantCity: env.MERCHANT_CITY,
      reference: payment.reference,
    });

    await payment.save();
    startBackgroundSyncWorker();
    return NextResponse.json({ payment });
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
