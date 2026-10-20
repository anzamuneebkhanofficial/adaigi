import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { connectDB } from '@/lib/db';
import { Payment } from '@/lib/models/Payment';
import { AuditLog } from '@/lib/models/Auxiliary';

export async function GET(req, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const payment = await Payment.findById(id).populate('matchedEmailId');

    if (!payment) {
      return NextResponse.json({ error: { message: 'Payment not found' } }, { status: 404 });
    }

    const auditLogs = await AuditLog.find({ paymentId: payment._id }).sort({ at: -1 });
    return NextResponse.json({ payment, auditLogs });
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
