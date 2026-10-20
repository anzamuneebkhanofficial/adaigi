import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { syncGmailInbox } from '@/lib/gmail-sync';

export const maxDuration = 30;

export async function POST() {
  try {
    await requireAdmin();
    const result = await syncGmailInbox(true);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
