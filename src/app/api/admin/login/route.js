import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { createSession, verifyPassword, safeCompare } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: { message: 'Email and password are required' } }, { status: 400 });
    }

    // Verify email strictly against configured admin email in ENV
    const configuredEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!configuredEmail) {
      return NextResponse.json({ error: { message: 'Admin email is not configured in environment variables' } }, { status: 500 });
    }

    const normalizedInputEmail = email.trim().toLowerCase();
    if (normalizedInputEmail !== configuredEmail) {
      return NextResponse.json({ error: { message: 'Invalid email or password' } }, { status: 401 });
    }

    // Verify password strictly against configured password in ENV (zero hardcoded fallbacks)
    let passwordValid = false;
    if (env.ADMIN_PASSWORD) {
      passwordValid = safeCompare(password, env.ADMIN_PASSWORD);
    } else if (env.ADMIN_PASSWORD_HASH) {
      passwordValid = verifyPassword(password, env.ADMIN_PASSWORD_HASH);
    }

    if (!passwordValid) {
      return NextResponse.json({ error: { message: 'Invalid email or password' } }, { status: 401 });
    }

    const token = await createSession(configuredEmail);
    const response = NextResponse.json({ ok: true, email: configuredEmail });

    // Set secure httpOnly cookie
    response.cookies.set('adaigi_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: { message: err.message || 'Authentication error' } }, { status: 500 });
  }
}
