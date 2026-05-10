import { NextResponse } from 'next/server';
import { createClient }  from '@supabase/supabase-js';
import { cookies }       from 'next/headers';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function authorized() {
  const session = cookies().get('admin_session');
  return session?.value === process.env.ADMIN_SECRET;
}

/* ── Crear producto ── */
export async function POST(req) {
  if (!authorized()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const payload = await req.json();
  const { error } = await adminClient().from('products').insert([payload]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/* ── Actualizar producto ── */
export async function PATCH(req) {
  if (!authorized()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id, ...payload } = await req.json();
  const { error } = await adminClient().from('products').update(payload).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/* ── Eliminar producto ── */
export async function DELETE(req) {
  if (!authorized()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await req.json();
  const { error } = await adminClient().from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
