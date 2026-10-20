import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-guard';
import { env } from '@/lib/env';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  const iban = env.MERCHANT_IBAN || '';
  const maskedIban = iban ? `${iban.slice(0, 8)}•••••••••••${iban.slice(-4)}` : 'Not configured';

  return NextResponse.json({
    authenticated: true,
    email: session.email,
    sellerName: env.SELLER_NAME || 'Merchant Store',
    ibanTail: iban.slice(-4),
    maskedIban,
    paymentExpiryMinutes: env.PAYMENT_EXPIRY_MINUTES,
    maxOffsetPaisa: env.MAX_OFFSET_PAISA,
  });
}
