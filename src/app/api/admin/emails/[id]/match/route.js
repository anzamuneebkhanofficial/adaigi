import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { connectDB } from '@/lib/db';
import { EmailEvent } from '@/lib/models/Auxiliary';
import { Payment } from '@/lib/models/Payment';

export async function POST(req, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const { paymentId } = await req.json();

    const email = await EmailEvent.findById(id);
    const payment = await Payment.findById(paymentId);

    if (!email || !payment) {
      return NextResponse.json({ error: { message: 'Email or Payment record not found' } }, { status: 404 });
    }

    email.status = 'MATCHED';
    email.paymentId = payment._id;
    await email.save();

    payment.status = 'PAID';
    payment.paidAt = new Date();
    payment.matchedEmailId = email._id;
    payment.paidVia = 'AUTO_EMAIL';
    await payment.save();

    return NextResponse.json({ ok: true, payment, email });
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
