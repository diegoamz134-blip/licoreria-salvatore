import { NextResponse } from 'next/server';

export async function POST(request) {
  const { email, password } = await request.json();

  if (
    email    === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_session', process.env.ADMIN_SECRET, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });
    return res;
  }

  return NextResponse.json(
    { error: 'Correo o contraseña incorrectos' },
    { status: 401 }
  );
}
