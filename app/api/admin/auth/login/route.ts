import { NextResponse, type NextRequest } from 'next/server';
import { checkAdminCredentials, createSessionToken } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Ingresá tu email y contraseña.' }, { status: 400 });
    }

    const isValid = await checkAdminCredentials(email, password);

    if (!isValid) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos.' }, { status: 401 });
    }

    const token = await createSessionToken(email);

    const response = NextResponse.json({ success: true, email });
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 días
    });

    return response;
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error del servidor al iniciar sesión.' }, { status: 500 });
  }
}
