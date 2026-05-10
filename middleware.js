import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protege todo /admin/* excepto el propio login (/admin)
  if (pathname.startsWith('/admin/')) {
    const session = request.cookies.get('admin_session');
    if (session?.value !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path+'],
};
