import { NextResponse } from 'next/server';
import { createClient }  from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(req) {
  const { customer_name, customer_phone, delivery_address, payment_method, total_amount, items } = await req.json();

  if (!customer_name || !customer_phone || !items?.length) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  const sb = adminClient();

  /* 1. Insertar la orden */
  const { data: order, error: orderErr } = await sb
    .from('orders')
    .insert([{ customer_name, customer_phone, delivery_address, payment_method, total_amount, status: 'pending' }])
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

  return NextResponse.json({ ok: true, orderId: order.id });
}
