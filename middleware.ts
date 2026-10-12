import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith('/admin');
  const isLoginRoute = path === '/admin/login';
  const isAuthApiRoute = path.startsWith('/api/admin/auth');

  if (!isAdminRoute || isAuthApiRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('admin_session')?.value;

  // Si no hay cookie
  if (!sessionCookie) {
    if (!isLoginRoute) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Si hay cookie y está en login, redirigir al panel
  if (isLoginRoute) {
    const adminUrl = new URL('/admin', request.url);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
