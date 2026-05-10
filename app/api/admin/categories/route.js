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

/* GET — listar categorías */
export async function GET() {
  const { data, error } = await adminClient()
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/* POST — crear categoría */
export async function POST(req) {
  if (!authorized()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
  const { error } = await adminClient()
    .from('categories')
    .insert([{ name: name.trim() }]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/* DELETE — eliminar categoría */
export async function DELETE(req) {
  if (!authorized()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await req.json();
  const { error } = await adminClient()
    .from('categories')
    .delete()
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
