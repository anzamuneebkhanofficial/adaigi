import { cookies } from 'next/headers';
import { verifySession } from './auth.js';

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('adaigi_session')?.value;
  if (!token) return null;
  return await verifySession(token);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
