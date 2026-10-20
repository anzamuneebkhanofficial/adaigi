import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';
import { env } from './env.js';

const secretKey = new TextEncoder().encode(env.SESSION_SECRET || 'temporary-dev-session-secret-change-in-env-file-now!');

export function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || !a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function createSession(email) {
  return await new SignJWT({ sub: 'admin', email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secretKey);
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `16384$8$1$${salt}$${derivedKey.toString('base64')}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 5) return false;
  const [, , , salt, hash] = parts;
  const derivedKey = crypto.scryptSync(password, salt, 64);
  const targetBuffer = Buffer.from(hash, 'base64');
  return crypto.timingSafeEqual(derivedKey, targetBuffer);
}
