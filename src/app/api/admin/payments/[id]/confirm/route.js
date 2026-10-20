import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { connectDB } from '@/lib/db';
import { Payment } from '@/lib/models/Payment';
import { AuditLog } from '@/lib/models/Auxiliary';

export async function POST(req, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const { note } = await req.json();

    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ error: { message: 'Payment not found' } }, { status: 404 });
    }

    const previousStatus = payment.status;
    payment.status = 'PAID';
    payment.paidAt = new Date();
    payment.paidVia = 'MANUAL_ADMIN';
    payment.manualNote = note || 'Manually settled by admin';
    await payment.save();

    await AuditLog.create({
      actor: 'ADMIN',
      action: 'MANUAL_CONFIRM',
      paymentId: payment._id,
      from: previousStatus,
      to: 'PAID',
      note: payment.manualNote,
    });

    return NextResponse.json({ payment });
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
