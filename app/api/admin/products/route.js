import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function authorized() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

// Usamos el Admin Client que tiene bypass de RLS para operaciones del panel
function adminClient() {
  return createAdminClient();
}

/* ── Crear producto ── */
export async function POST(req) {
  if (!(await authorized())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const payload = await req.json();
  const sb = adminClient();
  
  // 1. Insertar producto
  const { data: product, error } = await sb.from('products').insert([payload]).select().single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 2. Registrar stock inicial si es > 0
  if (product.stock_quantity > 0) {
    await sb.from('stock_movements').insert([{
      product_id: product.id,
      quantity: product.stock_quantity,
      reason: 'restock',
      notes: 'Stock inicial al crear producto'
    }]);
  }

  return NextResponse.json({ ok: true });
}

/* ── Actualizar producto ── */
export async function PATCH(req) {
  if (!(await authorized())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id, ...payload } = await req.json();
  const sb = adminClient();

  // 1. Obtener stock actual para calcular movimiento
  const { data: oldProduct } = await sb.from('products').select('stock_quantity').eq('id', id).single();
  
  // 2. Actualizar producto
  const { error } = await sb.from('products').update(payload).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 3. Registrar movimiento de stock si cambió
  if (oldProduct && payload.stock_quantity !== undefined && payload.stock_quantity !== oldProduct.stock_quantity) {
    const diff = payload.stock_quantity - oldProduct.stock_quantity;
    await sb.from('stock_movements').insert([{
      product_id: id,
      quantity: diff,
      reason: diff > 0 ? 'restock' : 'adjustment',
      notes: 'Ajuste manual desde el panel'
    }]);
  }

  return NextResponse.json({ ok: true });
}

/* ── Eliminar producto ── */
export async function DELETE(req) {
  if (!(await authorized())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await req.json();
  const { error } = await adminClient().from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
