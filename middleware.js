import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin/')) {
    const session = request.cookies.get('admin_session');

    // Sin sesión válida → redirigir al login
    if (session?.value !== process.env.ADMIN_SECRET) {
      const res = NextResponse.redirect(new URL('/admin', request.url));
      // Borrar cookie corrupta si existe
      res.cookies.delete('admin_session');
      return res;
    }

    // Con sesión válida → pasar pero impedir que el navegador cachee estas páginas
    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path+'],
};
