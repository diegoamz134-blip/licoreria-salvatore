'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/CartContext';
import ProductCard from '@/components/ProductCard';
import { TrustBadges, ShareButtons, ProductTabs } from '@/components/ProductExtras';

/* ── Scroll reveal hook para animaciones ── */
function useReveal(delay = 0) {
  const [el, setEl] = useState(null);
  const [visible, setVisible] = useState(false);
  
  const ref = useCallback((node) => {
    if (node !== null) {
      setEl(node);
    }
  }, []);

  useEffect(() => {
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { 
        if (e.isIntersecting) { 
          setTimeout(() => setVisible(true), delay); 
          obs.unobserve(el); 
        } 
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [el, delay]);
  
  return [ref, visible];
}

/* ── Componente wrapper para animar las tarjetas de recomendación ── */
function AnimatedRecCard({ product, delay }) {
  const [ref, visible] = useReveal(delay);
  return (
    <div 
      ref={ref} 
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}
    >
      <ProductCard product={product} />
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, active: false });

  // Refs para animaciones principales
  const [imgRef, imgVisible] = useReveal(0);
  const [infoRef, infoVisible] = useReveal(150);
  const [recTitleRef, recTitleVisible] = useReveal(0);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

        // 1. Obtener producto por slug o ID
        const query = supabase
          .from('products')
          .select('*, categories(name), brands(name)')
          .eq('is_active', true);

        if (isUuid) {
          query.eq('id', slug);
        } else {
          query.eq('slug', slug);
        }

        const { data, error: fetchError } = await query.single();

        if (fetchError || !data) {
          setError('Producto no encontrado');
          setLoading(false);
          return;
        }
        
        setProduct(data);

        // 2. Obtener recomendaciones (misma categoría, excluyendo el actual)
        let recs = [];
        if (data.category_id) {
          const { data: recData } = await supabase
            .from('products')
            .select('*, categories(name), brands(name)')
            .eq('is_active', true)
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .limit(4);
          recs = recData || [];
        }

        // Si hay menos de 4, completar con productos de otras categorías
        if (recs.length < 4) {
          const existingIds = [data.id, ...recs.map(r => r.id)];
          const { data: extraData } = await supabase
            .from('products')
            .select('*, categories(name), brands(name)')
            .eq('is_active', true)
            .not('id', 'in', `(${existingIds.join(',')})`)
            .limit(4 - recs.length);
          recs = [...recs, ...(extraData || [])];
        }
        setRecommendations(recs);

      } catch (err) {
        console.error(err);
        setError('Ocurrió un error inesperado');
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || product.stock_quantity === 0) return;
    setAdding(true);
    const finalPrice = product.sale_price || product.price;
    
    // Animación del botón
    for(let i=0; i<quantity; i++) {
        addItem({ ...product, price: finalPrice });
    }

    setTimeout(() => {
      setAdding(false);
      // Abrir el carrito
      document.getElementById('cart-btn')?.click();
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] pt-24 flex items-center justify-center">
        <div className="text-[#5a5a5a] text-xs uppercase tracking-[0.2em] flex items-center gap-3 animate-pulse">
          <div className="w-4 h-4 border-2 border-[#5a5a5a] border-t-transparent rounded-full animate-spin" />
          Preparando tu selección...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] pt-32 px-4 text-center">
        <div className="w-16 h-16 border border-white/[0.07] flex items-center justify-center mx-auto mb-6 text-[#3a3a3a]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 21l-4.35-4.35"/><circle cx="11" cy="11" r="8"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
        <h1 className="text-[#e8e8e8] text-2xl mb-4 uppercase tracking-[0.1em]" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          {error || 'Producto no encontrado'}
        </h1>
        <button onClick={() => router.push('/tienda')} className="text-[#c8c8c8] text-[9px] tracking-[0.3em] uppercase hover:text-white transition-colors border-b border-[#c8c8c8]/30 hover:border-white pb-1">
          Volver al catálogo
        </button>
      </div>
    );
  }

  const hasSale = product.sale_price && product.sale_price < product.price;
  const currentPrice = hasSale ? product.sale_price : product.price;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <main className="min-h-screen bg-[#1e1e1e] pt-24 pb-20 overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c8c8c8]/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#c8c8c8]/[0.015] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Breadcrumbs - Entrada suave */}
        <div className="flex items-center flex-wrap gap-2 text-[8.5px] tracking-[0.25em] uppercase mb-10 text-[#5a5a5a] animate-in fade-in slide-in-from-top-4 duration-700" style={{ fontFamily: 'var(--font-body)' }}>
          <Link href="/" className="hover:text-[#c8c8c8] transition-colors">Inicio</Link>
          <span className="opacity-50">/</span>
          <Link href="/tienda" className="hover:text-[#c8c8c8] transition-colors">Tienda</Link>
          <span className="opacity-50">/</span>
          <span className="text-[#c8c8c8] truncate">{product.name}</span>
        </div>

        {/* Producto Principal */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-14">
          
          {/* Imagen animada con zoom interactivo */}
          <div 
            ref={imgRef}
            className={`w-full md:w-1/2 lg:w-5/12 transition-all duration-1000 ease-out ${imgVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
          >
            <div 
              className="relative bg-[#1a1a1a] border border-white/[0.05] overflow-hidden group shadow-2xl cursor-crosshair" 
              style={{ aspectRatio: '3/4' }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomPos({ x, y, active: true });
              }}
              onMouseLeave={() => setZoomPos(prev => ({ ...prev, active: false }))}
            >
              <img 
                src={product.image_url || 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=900&q=80'} 
                alt={product.name}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500"
                style={zoomPos.active ? {
                  transform: 'scale(1.8)',
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transition: 'transform 0.15s ease-out'
                } : {
                  transform: 'scale(1)',
                  transition: 'transform 0.4s ease-out'
                }}
              />
              {/* Overlay sutil para darle profundidad */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${zoomPos.active ? 'opacity-0' : 'opacity-60'}`} />
              
              {hasSale && (
                <div className="absolute top-5 left-5 bg-red-600 text-white text-[9px] font-black px-3.5 py-1.5 tracking-[0.3em] uppercase shadow-lg shadow-red-900/50 animate-pulse">
                  Oferta
                </div>
              )}
            </div>
          </div>

          {/* Info animada */}
          <div 
            ref={infoRef}
            className={`w-full md:w-1/2 lg:w-7/12 flex flex-col justify-center transition-all duration-1000 delay-150 ease-out ${infoVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
          >
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                {product.categories?.name && (
                  <span className="text-[#c8c8c8] bg-white/[0.04] text-[8.5px] tracking-[0.3em] uppercase border border-white/[0.08] px-2.5 py-1" style={{ fontFamily: 'var(--font-body)' }}>
                    {product.categories.name}
                  </span>
                )}
                {product.brands?.name && (
                  <span className="text-[#5a5a5a] text-[8.5px] tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                    {product.brands.name}
                  </span>
                )}
              </div>
              <h1 className="text-[#eeeeee] text-3xl sm:text-4xl lg:text-5xl leading-tight mb-5 tracking-[0.02em]" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-[#c8c8c8] text-4xl sm:text-5xl font-black leading-none tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  S/ {Number(currentPrice).toFixed(2)}
                </span>
                {hasSale && (
                  <span className="text-[#5a5a5a] text-xl line-through mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                    S/ {Number(product.price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-white/[0.1] to-transparent mb-8" />

            <ProductTabs product={product} />

            {/* Acciones */}
            <div className="bg-[#141414] border border-white/[0.05] p-6 flex flex-col sm:flex-row items-center gap-5 mt-auto shadow-xl relative overflow-hidden">
              {/* Brillo en la caja de acciones */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c8c8c8]/10 to-transparent" />
              
              {!isOutOfStock ? (
                <>
                  <div className="flex items-center border border-white/[0.1] bg-[#1e1e1e] w-full sm:w-auto h-14">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-5 text-[#8a8a8a] hover:text-white transition-colors h-full flex items-center justify-center text-lg">−</button>
                    <span className="w-10 text-center text-[#e8e8e8] text-sm font-bold" style={{ fontFamily: 'var(--font-body)' }}>{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} className="px-5 text-[#8a8a8a] hover:text-white transition-colors h-full flex items-center justify-center text-lg">+</button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    disabled={adding}
                    className={`flex-1 w-full h-14 text-[10px] tracking-[0.3em] uppercase font-bold transition-all shadow-[0_0_20px_rgba(200,200,200,0.1)] hover:shadow-[0_0_40px_rgba(200,200,200,0.25)] relative overflow-hidden group
                      ${adding ? 'bg-[#e0e0e0] text-black scale-[0.98]' : 'bg-[#c8c8c8] text-black hover:bg-white active:scale-[0.98]'}`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative z-10">{adding ? 'Agregando...' : 'Añadir al carrito'}</span>
                  </button>
                </>
              ) : (
                <div className="flex-1 w-full text-center py-4 text-red-500 text-[10px] tracking-[0.3em] uppercase font-bold bg-red-900/10 border border-red-900/30" style={{ fontFamily: 'var(--font-body)' }}>
                  Agotado temporalmente
                </div>
              )}
            </div>

            {!isOutOfStock && (
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-4 text-[#5a5a5a] text-[8.5px] tracking-widest uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                <div className={`w-1.5 h-1.5 rounded-full ${product.stock_quantity <= 5 ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                {product.stock_quantity <= 5 ? `¡Últimas ${product.stock_quantity} unidades!` : 'Stock disponible para envío inmediato'}
              </div>
            )}

            {/* Trust Badges */}
            <TrustBadges />

            {/* Share Buttons */}
            <ShareButtons productName={product.name} />

          </div>
        </div>

        {/* Recomendaciones Animadas */}
        {recommendations.length > 0 && (
          <div className="mt-24 pt-14 border-t border-white/[0.05] relative">
            {/* Decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-[#c8c8c8]/[0.03] rounded-full blur-[80px] pointer-events-none" />
            
            <div 
              ref={recTitleRef}
              className={`flex flex-col items-center text-center mb-12 transition-all duration-700 ${recTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#c8c8c8]/30" />
                <p className="text-[#5a5a5a] text-[8px] tracking-[0.5em] uppercase font-bold" style={{ fontFamily: 'var(--font-body)' }}>También te puede gustar</p>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#c8c8c8]/30" />
              </div>
              <h2 className="text-[#e8e8e8] text-2xl sm:text-3xl uppercase tracking-[0.05em]" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                Productos Sugeridos
              </h2>
              <div className="h-px w-16 bg-[#c8c8c8]/30 mt-5" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-5">
              {recommendations.map((rec, idx) => (
                <AnimatedRecCard key={rec.id} product={rec} delay={idx * 150} />
              ))}
            </div>

            {/* CTA volver a tienda */}
            <div className="flex justify-center mt-10">
              <Link href="/tienda" className="group flex items-center gap-2 px-6 py-3 border border-white/[0.08] text-[#5a5a5a] hover:text-[#c8c8c8] hover:border-[#c8c8c8]/30 transition-all text-[9px] tracking-[0.3em] uppercase font-bold" style={{ fontFamily: 'var(--font-body)' }}>
                Ver todo el catálogo
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
