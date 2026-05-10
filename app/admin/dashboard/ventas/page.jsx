'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Nuevo',      color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  { value: 'packing',   label: 'Empacando',  color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  { value: 'shipped',   label: 'Enviado',    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  { value: 'completed', label: 'Completado', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  { value: 'cancelled', label: 'Cancelado',  color: 'text-red-400 bg-red-400/10 border-red-400/20' },
];

const statusOf = v => STATUS_OPTIONS.find(s => s.value === v) || STATUS_OPTIONS[0];

function OrderRow({ order, onStatusChange }) {
  const [open,    setOpen]    = useState(false);
  const [status,  setStatus]  = useState(order.status || 'pending');
  const [saving,  setSaving]  = useState(false);
  const st = statusOf(status);

  const updateStatus = async (val) => {
    setSaving(true);
    const res = await fetch('/api/admin/orders', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: order.id, status: val }),
    });
    if (res.ok) { setStatus(val); onStatusChange?.(); }
    setSaving(false);
  };

  return (
    <>
      <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer"
        onClick={() => setOpen(o => !o)}>
        <td className="px-5 py-4 text-[#3a3a3a] font-mono text-[10px]">#{String(order.id).slice(-6)}</td>
        <td className="px-5 py-4">
          <p className="text-[#c8c8c8] font-semibold text-[11px]">{order.customer_name}</p>
          <p className="text-[#3a3a3a] text-[10px]">{order.customer_phone}</p>
        </td>
        <td className="px-5 py-4 text-[#5a5a5a] text-[11px] max-w-[160px] truncate hidden md:table-cell">
          {order.delivery_address}
        </td>
        <td className="px-5 py-4 text-green-400 font-bold text-[11px] whitespace-nowrap">
          S/ {Number(order.total_amount).toFixed(2)}
        </td>
        <td className="px-5 py-4 text-[#5a5a5a] capitalize text-[11px] hidden sm:table-cell">
          {order.payment_method}
        </td>
        <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
          <select
            value={status}
            onChange={e => updateStatus(e.target.value)}
            disabled={saving}
            className={`text-[8.5px] tracking-[0.15em] uppercase px-2 py-1 border cursor-pointer
              bg-transparent focus:outline-none transition-colors ${st.color}
              ${saving ? 'opacity-50 cursor-wait' : ''}`}
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value} className="bg-[#1e1e1e] text-[#e8e8e8]">{s.label}</option>
            ))}
          </select>
        </td>
        <td className="px-5 py-4 text-[#3a3a3a] text-[10px] whitespace-nowrap hidden lg:table-cell">
          {new Date(order.created_at).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' })}
          <span className="block text-[9px]">
            {new Date(order.created_at).toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit' })}
          </span>
        </td>
        <td className="px-5 py-4 text-[#3a3a3a]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </td>
      </tr>

      {/* Detalle de items */}
      {open && (
        <tr className="bg-[#0e0e0e]">
          <td colSpan={8} className="px-5 py-4">
            <div className="border border-white/[0.05] overflow-hidden">
              {(order.order_items || []).length === 0 ? (
                <p className="text-[#2a2a2a] text-[10px] px-4 py-3" style={{ fontFamily: 'var(--font-body)' }}>
                  Sin items registrados
                </p>
              ) : (
                <table className="w-full text-[10.5px]" style={{ fontFamily: 'var(--font-body)' }}>
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {['Producto','Cantidad','Precio unit.','Subtotal'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[8px] tracking-[0.25em] uppercase text-[#2a2a2a] font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items.map((item, i) => (
                      <tr key={i} className="border-b border-white/[0.03]">
                        <td className="px-4 py-2.5 text-[#8a8a8a]">{item.product_name}</td>
                        <td className="px-4 py-2.5 text-[#5a5a5a]">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-[#5a5a5a]">S/ {Number(item.price_at_time ?? item.unit_price).toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-green-400 font-bold">
                          S/ {(item.quantity * Number(item.price_at_time ?? item.unit_price)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function VentasPage() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [query,      setQuery]      = useState('');
  const [statusFlt,  setStatusFlt]  = useState('all');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFlt !== 'all') list = list.filter(o => o.status === statusFlt);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(o =>
        o.customer_name.toLowerCase().includes(q) ||
        (o.customer_phone || '').includes(q)
      );
    }
    return list;
  }, [orders, query, statusFlt]);

  const totalRevenue = filtered.reduce((s, o) => s + Number(o.total_amount || 0), 0);

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-[8px] tracking-[0.45em] uppercase text-[#3a3a3a] mb-0.5"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>Gestión</p>
          <h1 className="text-[#e8e8e8] text-2xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Ventas
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[8px] tracking-[0.35em] uppercase text-[#3a3a3a] mb-0.5"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>Ingresos filtrados</p>
          <p className="text-green-400 text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            S/ {totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a3a3a] pointer-events-none">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por cliente o teléfono…"
            className="w-full bg-[#141414] border border-white/[0.07] text-[#e8e8e8] text-sm
              pl-9 pr-4 py-2.5 placeholder:text-[#2a2a2a] focus:border-[#c8c8c8]/20 focus:outline-none transition-colors"
            style={{ fontFamily: 'var(--font-body)' }} />
        </div>
        <select value={statusFlt} onChange={e => setStatusFlt(e.target.value)}
          className="bg-[#141414] border border-white/[0.07] text-[#5a5a5a] text-[10px] tracking-[0.2em] uppercase
            px-3 py-2.5 focus:outline-none focus:border-[#c8c8c8]/20 cursor-pointer"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
          <option value="all">Todos los estados</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Contador */}
      <p className="text-[#3a3a3a] text-[10px] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
        {loading ? '…' : `${filtered.length} pedido${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {/* Tabla */}
      <div className="bg-[#141414] border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-3 text-[#3a3a3a] text-xs"
            style={{ fontFamily: 'var(--font-body)' }}>
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Cargando pedidos…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-[#2a2a2a] text-xs" style={{ fontFamily: 'var(--font-body)' }}>
            No se encontraron pedidos
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ fontFamily: 'var(--font-body)' }}>
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['#','Cliente','Dirección','Total','Pago','Estado','Fecha',''].map((h,i) => (
                    <th key={i} className="px-5 py-3 text-left text-[8px] tracking-[0.3em] uppercase text-[#2e2e2e] font-bold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <OrderRow key={order.id} order={order} onStatusChange={load} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
