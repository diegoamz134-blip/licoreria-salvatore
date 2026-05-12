'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/* ── Utilidades ── */
function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
}

/* ── Config de estados ── */
const STATUSES = {
  pending:   { label: 'Nuevo',      color: 'text-yellow-400',  bg: 'bg-yellow-400/10  border-yellow-400/25' },
  packing:   { label: 'Empacando',  color: 'text-orange-400',  bg: 'bg-orange-400/10  border-orange-400/25' },
  shipped:   { label: 'Enviado',    color: 'text-blue-400',    bg: 'bg-blue-400/10    border-blue-400/25'   },
  completed: { label: 'Completado', color: 'text-green-400',   bg: 'bg-green-400/10   border-green-400/25'  },
  cancelled: { label: 'Cancelado',  color: 'text-red-400',     bg: 'bg-red-400/10     border-red-400/25'    },
};

const NEXT_STATUS = {
  pending:  'packing',
  packing:  'shipped',
  shipped:  'completed',
};

const TABS = [
  { key: 'all',       label: 'Todos'      },
  { key: 'pending',   label: 'Nuevos'     },
  { key: 'packing',   label: 'Empacando'  },
  { key: 'shipped',   label: 'Enviados'   },
  { key: 'completed', label: 'Completados'},
  { key: 'cancelled', label: 'Cancelados' },
];

/* ── Tarjeta de pedido ── */
function OrderCard({ order, onStatusChange }) {
  const [status,  setStatus]  = useState(order.status || 'pending');
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  const st        = STATUSES[status] || STATUSES.pending;
  const nextSt    = NEXT_STATUS[status];
  const isDone    = status === 'completed' || status === 'cancelled';

  const changeStatus = async (newStatus) => {
    setLoading(true);
    const res = await fetch('/api/admin/orders', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: order.id, status: newStatus }),
    });
    if (res.ok) { setStatus(newStatus); onStatusChange?.(); }
    setLoading(false);
  };

  const items = order.order_items || [];

  return (
    <div className={`bg-[#141414] border transition-colors duration-150
      ${status === 'pending' ? 'border-yellow-400/20' : 'border-white/[0.06]'}`}>

      {/* ── Cabecera de la tarjeta ── */}
      <div
        className="flex items-start justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setOpen(o => !o)}>

        {/* Info cliente */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="text-[#3a3a3a] font-mono text-[10px]">#{String(order.id).slice(-6)}</span>
            <span className={`text-[8.5px] tracking-[0.15em] uppercase px-2 py-0.5 border ${st.bg} ${st.color}`}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
              {st.label}
            </span>
            <span className="text-[#2e2e2e] text-[10px]">{timeAgo(order.created_at)}</span>
          </div>
          <p className="text-[#e8e8e8] font-semibold text-sm leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}>
            {order.customer_name}
          </p>
          <p className="text-[#4a4a4a] text-[10.5px] mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
            {order.customer_phone}
            {order.delivery_address && ` · ${order.delivery_address}`}
          </p>

          {/* Notas del cliente (V2) */}
          {order.notes && (
            <div className="mt-2 flex items-start gap-2 bg-yellow-400/5 border border-yellow-400/10 px-2 py-1.5 w-fit">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2.5" className="mt-0.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p className="text-[#ca8a04] text-[10px] leading-tight" style={{ fontFamily: 'var(--font-body)' }}>
                {order.notes}
              </p>
            </div>
          )}

          {/* Items resumen */}
          <p className="text-[#3a3a3a] text-[10px] mt-2 leading-relaxed line-clamp-1" style={{ fontFamily: 'var(--font-body)' }}>
            {items.length > 0
              ? items.map(i => `${i.product_name} ×${i.quantity}`).join('  ·  ')
              : 'Sin items'
            }
          </p>
        </div>

        {/* Total + flecha */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-[8px] tracking-[0.3em] uppercase text-[#3a3a3a]"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>Total</p>
            <p className="text-green-400 font-bold text-base" style={{ fontFamily: 'var(--font-display)' }}>
              S/ {Number(order.total_amount).toFixed(2)}
            </p>
            <p className="text-[#3a3a3a] text-[9px] capitalize" style={{ fontFamily: 'var(--font-body)' }}>
              {order.payment_method}
            </p>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="2"
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* ── Detalle expandible ── */}
      {open && (
        <div className="border-t border-white/[0.05] px-5 py-4">
          {items.length > 0 && (
            <div className="mb-4 overflow-hidden border border-white/[0.05]">
              <table className="w-full text-[10.5px]" style={{ fontFamily: 'var(--font-body)' }}>
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {['Producto','Cant.','Precio','Subtotal'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[8px] tracking-[0.25em] uppercase text-[#2a2a2a] font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-white/[0.03] last:border-0">
                      <td className="px-3 py-2.5 text-[#8a8a8a]">{item.product_name}</td>
                      <td className="px-3 py-2.5 text-[#5a5a5a]">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-[#5a5a5a]">S/ {Number(item.price_at_time ?? item.unit_price).toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-green-400 font-bold">
                        S/ {(item.quantity * Number(item.price_at_time ?? item.unit_price)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Botones de acción */}
          {!isDone && (
            <div className="flex items-center gap-2 flex-wrap">
              {nextSt && (
                <button
                  onClick={() => changeStatus(nextSt)}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 text-[9.5px] tracking-[0.25em] uppercase font-bold
                    transition-all duration-150
                    ${loading ? 'opacity-40 cursor-wait' : ''}
                    ${nextSt === 'packing'   ? 'bg-orange-400/15 text-orange-400 border border-orange-400/30 hover:bg-orange-400/25' : ''}
                    ${nextSt === 'shipped'   ? 'bg-blue-400/15   text-blue-400   border border-blue-400/30   hover:bg-blue-400/25'   : ''}
                    ${nextSt === 'completed' ? 'bg-green-400/15  text-green-400  border border-green-400/30  hover:bg-green-400/25'  : ''}
                  `}
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                  {loading
                    ? <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                    : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  }
                  Marcar como {STATUSES[nextSt]?.label}
                </button>
              )}
              <button
                onClick={() => changeStatus('cancelled')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-[9.5px] tracking-[0.25em] uppercase font-bold
                  bg-red-400/10 text-red-400 border border-red-400/25 hover:bg-red-400/20
                  transition-all duration-150 disabled:opacity-40 disabled:cursor-wait"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Cancelar pedido
              </button>
            </div>
          )}

          {isDone && (
            <div className={`flex items-center gap-2 text-[10.5px] ${st.color}`}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
              {status === 'completed'
                ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Pedido completado</>
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Pedido cancelado</>
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Página principal ── */
export default function PedidosPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  /* Conteo por estado */
  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const filtered = tab === 'all' ? orders : orders.filter(o => o.status === tab);

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-[8px] tracking-[0.45em] uppercase text-[#3a3a3a] mb-0.5"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>Gestión</p>
          <h1 className="text-[#e8e8e8] text-2xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Pedidos
          </h1>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 text-[#3a3a3a] hover:text-[#8a8a8a] transition-colors
            text-[9px] tracking-[0.3em] uppercase"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
          Actualizar
        </button>
      </div>

      {/* Tabs de estado */}
      <div className="flex gap-1 mb-6 overflow-x-auto no-scrollbar pb-0.5">
        {TABS.map(t => {
          const count  = t.key === 'all' ? orders.length : (counts[t.key] || 0);
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[9px] tracking-[0.25em] uppercase
                border transition-all duration-150 font-bold
                ${active
                  ? 'bg-[#c8c8c8] text-black border-[#c8c8c8]'
                  : 'border-white/[0.08] text-[#4a4a4a] hover:border-white/20 hover:text-[#8a8a8a]'
                }`}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
              {t.label}
              {count > 0 && (
                <span className={`text-[8px] px-1 min-w-[16px] text-center
                  ${active ? 'bg-black/20 text-black' : 'bg-white/[0.06] text-[#5a5a5a]'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de pedidos */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-[#3a3a3a] text-xs"
          style={{ fontFamily: 'var(--font-body)' }}>
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
          Cargando pedidos…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.25">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <p className="text-[#2a2a2a] text-xs" style={{ fontFamily: 'var(--font-body)' }}>
            {tab === 'all' ? 'Aún no hay pedidos' : `No hay pedidos con estado "${STATUSES[tab]?.label}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} onStatusChange={load} />
          ))}
        </div>
      )}

    </div>
  );
}
