'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const STATUS_LABEL = {
  pending:    { text: 'Pendiente',  color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  confirmed:  { text: 'Confirmado', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  delivered:  { text: 'Entregado',  color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  cancelled:  { text: 'Cancelado',  color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="bg-[#141414] border border-white/[0.06] p-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-[8.5px] tracking-[0.35em] uppercase text-[#3a3a3a] mb-2"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>{label}</p>
        <p className={`text-2xl font-bold leading-none mb-1 ${accent || 'text-[#e8e8e8]'}`}
          style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
        {sub && <p className="text-[10px] text-[#3a3a3a]" style={{ fontFamily: 'var(--font-body)' }}>{sub}</p>}
      </div>
      <div className="text-[#2a2a2a] mt-0.5 flex-shrink-0">{icon}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats,   setStats]   = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        { count: totalProducts },
        { count: totalOrders },
        { count: pendingOrders },
        { data: orderData },
        { data: revenueData },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('id,customer_name,total_amount,status,payment_method,created_at')
          .order('created_at', { ascending: false }).limit(8),
        supabase.from('orders').select('total_amount').eq('status', 'completed'),
      ]);

      const revenue = (revenueData || []).reduce((s, o) => s + Number(o.total_amount || 0), 0);

      setStats({
        totalProducts: totalProducts || 0,
        totalOrders:   totalOrders   || 0,
        pendingOrders: pendingOrders || 0,
        revenue,
      });
      setOrders(orderData || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="p-6 lg:p-8 animate-pulse space-y-6">
      <div className="h-7 w-48 bg-[#1a1a1a] rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-[#141414] border border-white/[0.04]" />)}
      </div>
      <div className="h-64 bg-[#141414] border border-white/[0.04]" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-7">

      {/* Header */}
      <div>
        <p className="text-[8px] tracking-[0.45em] uppercase text-[#3a3a3a] mb-0.5"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>Panel</p>
        <h1 className="text-[#e8e8e8] text-2xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Resumen
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Productos"
          value={stats.totalProducts}
          sub="en catálogo"
          accent="text-[#c8c8c8]"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>}
        />
        <StatCard
          label="Pedidos totales"
          value={stats.totalOrders}
          sub="acumulados"
          accent="text-blue-400"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
        />
        <StatCard
          label="Ingresos"
          value={`S/ ${stats.revenue.toFixed(2)}`}
          sub="pedidos completados"
          accent="text-green-400"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
        />
        <StatCard
          label="Pendientes"
          value={stats.pendingOrders}
          sub="por confirmar"
          accent={stats.pendingOrders > 0 ? 'text-yellow-400' : 'text-[#e8e8e8]'}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
      </div>

      {/* Pedidos recientes */}
      <div className="bg-[#141414] border border-white/[0.06]">
        <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
          <h2 className="text-[#c8c8c8] text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            Pedidos recientes
          </h2>
          <a href="/admin/dashboard/ventas"
            className="text-[8.5px] tracking-[0.3em] uppercase text-[#3a3a3a] hover:text-[#8a8a8a] transition-colors"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
            Ver todos →
          </a>
        </div>

        {orders.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#2a2a2a] text-xs"
            style={{ fontFamily: 'var(--font-body)' }}>
            Aún no hay pedidos registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ fontFamily: 'var(--font-body)' }}>
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {['#', 'Cliente', 'Total', 'Pago', 'Estado', 'Fecha'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[8px] tracking-[0.3em] uppercase text-[#2e2e2e] font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => {
                  const st = STATUS_LABEL[o.status] || STATUS_LABEL.pending;
                  return (
                    <tr key={o.id}
                      className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                      <td className="px-5 py-3.5 text-[#3a3a3a] font-mono text-[10px]">#{String(o.id).slice(-5)}</td>
                      <td className="px-5 py-3.5 text-[#c8c8c8]">{o.customer_name}</td>
                      <td className="px-5 py-3.5 text-green-400 font-bold">S/ {Number(o.total_amount).toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-[#5a5a5a] capitalize">{o.payment_method}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[8.5px] tracking-[0.2em] uppercase px-2 py-0.5 border ${st.color}`}>
                          {st.text}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#3a3a3a]">
                        {new Date(o.created_at).toLocaleDateString('es-PE', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
