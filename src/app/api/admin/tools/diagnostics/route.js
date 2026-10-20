import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { env } from '@/lib/env';

export async function POST(req) {
  try {
    await requireAdmin();
    const { action, sampleText } = await req.json();

    if (action === 'test-parser') {
      const matchAmt = (sampleText || '').match(/(?:Rs\.?|PKR)\s*([\d,]+(?:\.\d{2})?)/i);
      const amtPaisa = matchAmt ? Math.round(parseFloat(matchAmt[1].replace(/,/g, '')) * 100) : null;
      const matchRef = (sampleText || '').match(/\b(AD-[A-Z0-9]{4,8})\b/i);
      const refFound = matchRef ? matchRef[1].toUpperCase() : null;

      return NextResponse.json({
        ok: !!amtPaisa,
        amountPaisa: amtPaisa,
        reference: refFound,
        sampleChecked: true,
      });
    }

    if (action === 'test-gmail') {
      const hasCreds = Boolean(env.GMAIL_ADDRESS && env.GMAIL_APP_PASSWORD);
      return NextResponse.json({
        ok: true,
        configured: hasCreds,
        address: env.GMAIL_ADDRESS || 'Not set',
        folder: env.GMAIL_FOLDER || 'INBOX',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
