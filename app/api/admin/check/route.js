import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const session = cookies().get('admin_session');
  if (session?.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
