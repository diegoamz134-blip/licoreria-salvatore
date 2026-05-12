import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req) {
  const { user_id, customer_name, customer_phone, delivery_address, payment_method, total_amount, items, evidence_url } = await req.json();

  if (!customer_name || !customer_phone || !items?.length) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  const sb = createAdminClient();

  /* 1. Insertar la orden */
  const { data: order, error: orderErr } = await sb
    .from('orders')
    .insert([{ 
      user_id,
      customer_name, 
      customer_phone, 
      delivery_address, 
      payment_method, 
      total_amount, 
      evidence_url, // Guardar la foto del Yape/Plin
      status: 'pending' 
    }])
    .select()
    .single();

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });

  /* 2. Insertar los items */
  const orderItems = items.map(i => ({
    order_id:       order.id,
    product_id:     i.id,
    product_name:   i.name,
    quantity:       i.quantity,
    price_at_time:  i.price,
  }));

  const { error: itemsErr } = await sb.from('order_items').insert(orderItems);

  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });

  /* 3. Descontar Stock y registrar movimientos */
  for (const item of items) {
    if (!item.id) continue;

    // Obtener stock actual
    const { data: prod } = await sb
      .from('products')
      .select('stock_quantity')
      .eq('id', item.id)
      .single();

    if (prod) {
      const newStock = Math.max(0, prod.stock_quantity - item.quantity);
      
      // Actualizar stock
      await sb
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.id);

      // Registrar en Kardex (stock_movements)
      await sb.from('stock_movements').insert([{
        product_id: item.id,
        quantity: -item.quantity,
        reason: 'sale',
        notes: `Venta web - Pedido #${order.id.slice(-6)}`
      }]);
    }
  }

  return NextResponse.json({ ok: true, orderId: order.id });
}
