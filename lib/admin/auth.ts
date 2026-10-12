'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET = process.env.ADMIN_SESSION_SECRET || 'el-almacencito-admin-secure-auth-2026-secret-key';
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@elalmacencito.com.ar';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function createSessionToken(email: string): Promise<string> {
  const payload = {
    email,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 días
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<{ valid: boolean; email?: string }> {
  if (!token || typeof token !== 'string') return { valid: false };
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };

  const [data, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');

  if (signature !== expectedSig) return { valid: false };

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return { valid: false };
    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

export async function checkAdminCredentials(email: string, pass: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const configuredEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  if (cleanEmail === configuredEmail && pass === configuredPassword) {
    return true;
  }
  return false;
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  const { valid, email } = await verifySessionToken(sessionToken);

  if (!valid || !email) {
    redirect('/admin/login');
  }

  return {
    user: { email, id: 'admin-1' },
    usuario: { email, rol: 'admin' as const },
  };
}

export async function verifyAdminOrThrow(): Promise<string> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;
  const { valid, email } = await verifySessionToken(sessionToken);
  if (!valid || !email) {
    throw new Error('No autorizado: Se requiere sesión de administrador.');
  }
  return email;
}
