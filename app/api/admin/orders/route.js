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

export async function PATCH(req) {
  if (!(await authorized())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  const { id, status: newStatus } = await req.json();
  const sb = adminClient();

  // 1. Obtener estado actual e items antes de actualizar
  const { data: oldOrder, error: fetchErr } = await sb
    .from('orders')
    .select('status, order_items(*)')
    .eq('id', id)
    .single();

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  // 2. Actualizar el estado del pedido
  const { error: updateErr } = await sb.from('orders').update({ status: newStatus }).eq('id', id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // 3. Lógica de Inventario Inteligente
  const items = oldOrder.order_items || [];

  // SI PASA A CANCELADO: Devolver stock
  if (newStatus === 'cancelled' && oldOrder.status !== 'cancelled') {
    for (const item of items) {
      if (!item.product_id) continue;
      
      // Incrementar stock en tabla products
      const { data: prod } = await sb.from('products').select('stock_quantity').eq('id', item.product_id).single();
      if (prod) {
        await sb.from('products').update({ 
          stock_quantity: prod.stock_quantity + item.quantity 
        }).eq('id', item.product_id);

        // Registrar en Kardex
        await sb.from('stock_movements').insert([{
          product_id: item.product_id,
          quantity: item.quantity,
          reason: 'return',
          notes: `Devolución por pedido #${String(id).slice(-6)} cancelado`
        }]);
      }
    }
  } 
  
  // SI SALE DE CANCELADO A OTRO ESTADO: Restar stock de nuevo
  else if (oldOrder.status === 'cancelled' && newStatus !== 'cancelled') {
    for (const item of items) {
      if (!item.product_id) continue;

      const { data: prod } = await sb.from('products').select('stock_quantity').eq('id', item.product_id).single();
      if (prod) {
        await sb.from('products').update({ 
          stock_quantity: Math.max(0, prod.stock_quantity - item.quantity) 
        }).eq('id', item.product_id);

        // Registrar en Kardex
        await sb.from('stock_movements').insert([{
          product_id: item.product_id,
          quantity: -item.quantity,
          reason: 'sale',
          notes: `Re-activación de pedido #${String(id).slice(-6)}`
        }]);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
