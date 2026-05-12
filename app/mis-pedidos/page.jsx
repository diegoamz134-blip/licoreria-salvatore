'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MisPedidosPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      fetchOrders(session.user.id);
    };

    checkUser();
  }, [router]);

  const fetchOrders = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching orders:', error);
    else setOrders(data || []);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':   return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'packing':   return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'shipped':   return 'text-purple-500 bg-blue-500/10 border-purple-500/20';
      case 'completed': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:          return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':   return 'Pendiente';
      case 'packing':   return 'Preparando';
      case 'shipped':   return 'En camino';
      case 'completed': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default:          return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] pt-32 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-white/5 animate-pulse rounded" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 w-full bg-white/5 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-10">
          <h1 className="text-[#e8e8e8] text-3xl font-bold tracking-tight uppercase mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Mis Pedidos
          </h1>
          <p className="text-[#5a5a5a] text-xs uppercase tracking-[0.2em]">Historial de tus compras en Salvatore</p>
        </header>

        {orders.length === 0 ? (
          <div className="bg-[#161616] border border-white/[0.06] p-12 text-center rounded-lg">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <p className="text-[#8a8a8a] text-sm uppercase tracking-widest mb-8">Aún no has realizado ningún pedido</p>
            <Link href="/tienda" className="bg-[#e8e8e8] text-black px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-all">
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-[#161616] border border-white/[0.06] overflow-hidden rounded-lg group hover:border-white/20 transition-all">
                {/* Header del pedido */}
                <div className="p-5 border-b border-white/[0.04] flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#5a5a5a] uppercase tracking-widest">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-[#8a8a8a] text-xs">{new Date(order.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-[9px] uppercase font-bold tracking-tighter border rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <p className="text-white font-bold tracking-tight text-lg">S/ {order.total_amount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Contenido (Items) */}
                <div className="p-5 bg-white/[0.01]">
                  <div className="space-y-4">
                    {order.order_items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#1e1e1e] border border-white/5 rounded flex-shrink-0 flex items-center justify-center">
                           <span className="text-[10px] text-[#5a5a5a]">{item.quantity}x</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#c8c8c8] text-xs font-medium">{item.product_name}</p>
                          <p className="text-[#4a4a4a] text-[10px]">S/ {item.price_at_time.toFixed(2)} c/u</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer del pedido */}
                <div className="px-5 py-4 bg-white/[0.02] flex items-center justify-between">
                   <p className="text-[9px] text-[#4a4a4a] uppercase tracking-widest">Pago: <span className="text-[#8a8a8a]">{order.payment_method?.toUpperCase()}</span></p>
                   {order.status === 'pending' && (
                     <button 
                       onClick={() => window.open(`https://wa.me/51912626940?text=Hola, quiero consultar por mi pedido #${order.id.slice(-6).toUpperCase()}`, '_blank')}
                       className="text-[9px] text-[#c8c8c8] uppercase tracking-widest border-b border-[#c8c8c8]/30 hover:border-white transition-all"
                     >
                       Consultar soporte
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
