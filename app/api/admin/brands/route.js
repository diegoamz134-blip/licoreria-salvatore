import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function authorized() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

function adminClient() {
  return createAdminClient();
}

/* ── Listar marcas ── */
export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { data, error } = await adminClient().from('brands').select('*').order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/* ── Crear marca ── */
export async function POST(req) {
  if (!(await authorized())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { name } = await req.json();
  const { error } = await adminClient().from('brands').insert([{ name }]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/* ── Eliminar marca ── */
export async function DELETE(req) {
  if (!(await authorized())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await req.json();
  const { error } = await adminClient().from('brands').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
