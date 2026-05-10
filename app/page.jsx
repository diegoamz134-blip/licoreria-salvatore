'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';

const WA_LINK = 'https://wa.me/51907081065?text=Hola%20Licorería%20Salvatore%2C%20quisiera%20hacer%20un%20pedido%20%F0%9F%A5%83';

/* ─────────────── Scroll reveal hook ─────────────── */
function useReveal(delay = 0) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.unobserve(el); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return [ref, visible];
}

/* ─────────────── HERO ─────────────── */
function HeroSection() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 120); return () => clearTimeout(t); }, []);

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo */}
      <img
        src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1400&q=80"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-35"
      />
      {/* Gradientes */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e1e1e]/70 via-[#1e1e1e]/20 to-[#1e1e1e]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1e1e1e]/40 via-transparent to-[#1e1e1e]/40" />

      {/* Contenido */}
      <div className={`relative z-10 text-center px-5 max-w-lg mx-auto transition-all duration-1000
        ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

        {/* Logo */}
        <div className="w-32 h-32 mx-auto mb-7 overflow-hidden shadow-[0_12px_50px_rgba(0,0,0,0.7)] rounded-sm">
          <img src="/logo.jpg" alt="Licorería Salvatore" className="w-full h-full object-cover" />
        </div>

        {/* Texto */}
        <p
          className="text-[#8a8a8a] text-[10px] tracking-[0.55em] uppercase mb-2"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}
        >
          Licorería
        </p>
        <h1
          className="text-[#eeeeee] text-[3.8rem] leading-none tracking-[0.08em] uppercase mb-2"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}
        >
          Salvatore
        </h1>

        {/* Separador */}
        <div className="flex items-center gap-3 justify-center my-5">
          <div className="h-px w-12 bg-[#c8c8c8]/25" />
          <div className="w-1.5 h-1.5 bg-[#c8c8c8]/40 rotate-45" />
          <div className="h-px w-12 bg-[#c8c8c8]/25" />
        </div>

        <p
          className="text-[#8a8a8a] text-xs tracking-[0.3em] uppercase mb-9"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}
        >
          Licores de élite · Delivery en Ica
        </p>

        {/* CTA principal */}
        <Link
          href="/tienda"
          className="inline-flex items-center gap-3 bg-[#c8c8c8] text-black px-9 py-4
            text-xs tracking-[0.4em] uppercase font-bold
            hover:bg-[#e0e0e0] hover:shadow-[0_0_30px_rgba(200,200,200,0.2)]
            transition-all duration-300 active:scale-[0.97]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Ver Tienda
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Horario rápido */}
        <p
          className="mt-6 text-[#4a4a4a] text-[9px] tracking-[0.35em] uppercase"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}
        >
          Abierto todos los días · 8:00am – 9:00pm
        </p>
      </div>

      {/* Flecha scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8c8c8" strokeWidth="1.5">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}

/* ─────────────── PROMOCIONES ─────────────── */
const PROMOS = [
  {
    id: 1,
    tag: 'Oferta de la semana',
    name: 'Johnnie Walker Black Label',
    desc: 'Scotch whisky 12 años de maduración',
    originalPrice: 99.90,
    salePrice: 79.90,
    badge: '−20%',
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=900&q=80',
  },
  {
    id: 2,
    tag: 'Celebra esta semana',
    name: 'Moët & Chandon Imperial',
    desc: 'Champagne brut francés de alta gama',
    originalPrice: 250.00,
    salePrice: 199.90,
    badge: '−20%',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
  },
];

function PromoCard({ promo, delay }) {
  const [ref, visible] = useReveal(delay);
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden h-72 sm:h-80 group cursor-pointer
        transition-all duration-700
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <img
        src={promo.image} alt={promo.name}
        className="absolute inset-0 w-full h-full object-cover opacity-55
          group-hover:scale-105 group-hover:opacity-65 transition-all duration-700"
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* Badge descuento */}
      <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black
        px-2.5 py-1 tracking-[0.25em]"
        style={{ fontFamily: 'var(--font-body)' }}>
        {promo.badge}
      </div>

      {/* Contenido */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-[#c8c8c8]/60 text-[9px] tracking-[0.4em] uppercase mb-1"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
          {promo.tag}
        </p>
        <h3 className="text-[#eeeeee] text-xl leading-tight mb-1"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          {promo.name}
        </h3>
        <p className="text-[#5a5a5a] text-xs mb-4"
          style={{ fontFamily: 'var(--font-body)' }}>
          {promo.desc}
        </p>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[#5a5a5a] text-sm line-through"
              style={{ fontFamily: 'var(--font-body)' }}>
              S/ {promo.originalPrice.toFixed(2)}
            </span>
            <span className="text-[#c8c8c8] text-2xl font-black leading-none"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              S/ {promo.salePrice.toFixed(2)}
            </span>
          </div>
          <Link
            href="/tienda"
            className="flex-shrink-0 bg-[#c8c8c8] text-black text-[9px] tracking-[0.3em]
              uppercase px-4 py-2.5 font-bold hover:bg-[#e0e0e0] transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Comprar →
          </Link>
        </div>
      </div>
    </div>
  );
}

function PromotionsSection() {
  const [titleRef, titleVisible] = useReveal(0);
  return (
    <section className="px-3 py-16 max-w-6xl mx-auto">
      <div
        ref={titleRef}
        className={`text-center mb-10 transition-all duration-700
          ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <p className="text-[#c8c8c8]/40 text-[9px] tracking-[0.55em] uppercase mb-2"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
          Esta semana
        </p>
        <h2 className="text-[#e8e8e8] text-3xl sm:text-4xl"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Ofertas Especiales
        </h2>
        <div className="h-px w-16 bg-[#c8c8c8]/20 mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROMOS.map((promo, i) => (
          <PromoCard key={promo.id} promo={promo} delay={i * 130} />
        ))}
      </div>
    </section>
  );
}

/* ─────────────── MÁS VENDIDOS ─────────────── */
const BEST_SELLERS = [
  { id: '1', name: 'Johnnie Walker Black',  price: 89.90,  category: 'Whisky',    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=80', description: 'Scotch whisky 12 años. Ahumado y profundo.',   stock_quantity: 15 },
  { id: '4', name: 'Bombay Sapphire',       price: 72.50,  category: 'Gin',       image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80', description: 'Gin con 10 botánicos. Floral y cítrico.',       stock_quantity: 18 },
  { id: '2', name: 'Absolut Vodka',         price: 49.90,  category: 'Vodka',     image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&q=80', description: 'Vodka sueco puro. Excepcionalmente suave.',      stock_quantity: 25 },
  { id: '3', name: 'Havana Club 7 Años',    price: 65.00,  category: 'Ron',       image: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=600&q=80', description: 'Ron cubano añejo. Notas de caña y madera.',   stock_quantity: 20 },
];

function BestSellerCard({ product, delay }) {
  const { addItem } = useCart();
  const [ref, visible] = useReveal(delay);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    addItem(product);
    setTimeout(() => setAdded(false), 900);
  };

  return (
    <div
      ref={ref}
      className={`group bg-[#2a2a2a] border border-white/[0.07] overflow-hidden
        transition-all duration-700 hover:-translate-y-1 hover:border-[#c8c8c8]/20
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      {/* Imagen */}
      <div className="relative overflow-hidden bg-[#1e1e1e]" style={{ aspectRatio: '4/3' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover opacity-80
            group-hover:scale-105 group-hover:opacity-95 transition-all duration-700"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-black/70 text-[#8a8a8a] text-[8px] tracking-[0.3em] uppercase px-2 py-1"
            style={{ fontFamily: 'var(--font-body)' }}>
            {product.category}
          </span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-[#e8e8e8] text-base font-semibold leading-tight mb-1"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          {product.name}
        </h3>
        <p className="text-[#4a4a4a] text-xs mb-4 leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}>
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[#c8c8c8] text-xl font-black"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            S/ {product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            className={`text-[9px] tracking-[0.3em] uppercase px-4 py-2.5 font-bold
              transition-all duration-200 active:scale-95
              ${added
                ? 'bg-[#c8c8c8]/20 text-[#8a8a8a]'
                : 'bg-[#c8c8c8] text-black hover:bg-[#e0e0e0]'
              }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {added ? '✓ Añadido' : '+ Añadir'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BestSellersSection() {
  const [titleRef, titleVisible] = useReveal(0);
  return (
    <section className="px-3 py-16 max-w-6xl mx-auto">
      <div
        ref={titleRef}
        className={`text-center mb-10 transition-all duration-700
          ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <p className="text-[#c8c8c8]/40 text-[9px] tracking-[0.55em] uppercase mb-2"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
          Lo que más piden
        </p>
        <h2 className="text-[#e8e8e8] text-3xl sm:text-4xl"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Los Favoritos
        </h2>
        <div className="h-px w-16 bg-[#c8c8c8]/20 mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {BEST_SELLERS.map((p, i) => (
          <BestSellerCard key={p.id} product={p} delay={i * 100} />
        ))}
      </div>

      <div className={`text-center mt-10 transition-all duration-700 delay-500`}>
        <Link
          href="/tienda"
          className="inline-flex items-center gap-2.5 border border-[#c8c8c8]/25 text-[#8a8a8a]
            hover:border-[#c8c8c8]/60 hover:text-[#c8c8c8]
            px-8 py-3 text-[9px] tracking-[0.4em] uppercase transition-all duration-200"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}
        >
          Ver catálogo completo →
        </Link>
      </div>
    </section>
  );
}

/* ─────────────── CÓMO FUNCIONA ─────────────── */
const StepIcons = {
  catalog: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <path d="M14 17h7M17 14v7"/>
    </svg>
  ),
  payment: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <line x1="6" y1="15" x2="10" y2="15"/>
    </svg>
  ),
  delivery: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
};

const STEPS = [
  { num: '01', title: 'Elige tu licor',        desc: 'Navega nuestro catálogo y selecciona tus tragos favoritos.', iconKey: 'catalog'  },
  { num: '02', title: 'Paga fácil y rápido',   desc: 'Acepta Yape, Plin y tarjetas. Seguro y sin complicaciones.', iconKey: 'payment'  },
  { num: '03', title: 'Recíbelo en tu puerta', desc: 'Hacemos delivery a tu dirección en Ica. Rápido y con cuidado.', iconKey: 'delivery' },
];

function StepCard({ step, delay }) {
  const [ref, visible] = useReveal(delay);
  return (
    <div
      ref={ref}
      className={`text-center px-4 py-2 transition-all duration-700
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {/* Icono en marco cuadrado */}
      <div className="w-14 h-14 border border-[#c8c8c8]/20 flex items-center justify-center
        mx-auto mb-5 text-[#c8c8c8]/60">
        {StepIcons[step.iconKey]}
      </div>
      <p className="text-[#c8c8c8]/20 text-[2.2rem] font-black leading-none mb-2"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
        {step.num}
      </p>
      <h3 className="text-[#e8e8e8] text-base font-bold mb-2"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
        {step.title}
      </h3>
      <p className="text-[#5a5a5a] text-xs leading-relaxed"
        style={{ fontFamily: 'var(--font-body)' }}>
        {step.desc}
      </p>
    </div>
  );
}

function HowItWorksSection() {
  const [titleRef, titleVisible] = useReveal(0);
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Fondo diferenciado */}
      <div className="absolute inset-0 bg-[#1a1a1a]" />
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(200,200,200,0.03) 0%, transparent 70%)' }} />

      {/* Líneas decorativas */}
      <div className="absolute left-0 right-0 top-0 h-px bg-white/[0.05]" />
      <div className="absolute left-0 right-0 bottom-0 h-px bg-white/[0.05]" />

      <div className="relative px-4 max-w-6xl mx-auto">
        <div
          ref={titleRef}
          className={`text-center mb-14 transition-all duration-700
            ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="text-[#c8c8c8]/40 text-[9px] tracking-[0.55em] uppercase mb-2"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
            Simple y rápido
          </p>
          <h2 className="text-[#e8e8e8] text-3xl sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            ¿Cómo Funciona?
          </h2>
          <div className="h-px w-16 bg-[#c8c8c8]/20 mx-auto mt-4" />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 relative">
          {/* Línea conectora — solo desktop */}
          <div className="hidden sm:block absolute top-[52px] left-[20%] right-[20%] h-px bg-[#c8c8c8]/10" />
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} delay={i * 150} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── HORARIO Y DELIVERY ─────────────── */
function ScheduleSection() {
  const [ref, visible] = useReveal(0);
  return (
    <section className="px-3 py-16 max-w-2xl mx-auto">
      <div
        ref={ref}
        className={`bg-[#242424] border border-white/[0.07] p-8 sm:p-10 text-center
          transition-all duration-700
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Icono */}
        <div className="w-14 h-14 border border-[#c8c8c8]/20 flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8c8c8" strokeWidth="1.25">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>

        <p className="text-[#c8c8c8]/40 text-[9px] tracking-[0.55em] uppercase mb-2"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
          Horario de atención
        </p>
        <h2 className="text-[#e8e8e8] text-3xl sm:text-4xl mb-2"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          8:00am – 9:00pm
        </h2>
        <p className="text-[#8a8a8a] text-sm mb-6"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}>
          Lunes a Domingo · Todos los días
        </p>

        <div className="h-px bg-white/[0.06] max-w-[120px] mx-auto mb-6" />

        {/* Cobertura */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="text-[#5a5a5a] text-xs tracking-widest"
            style={{ fontFamily: 'var(--font-body)' }}>
            Delivery en Ica, Perú
          </span>
        </div>

        {/* Botón WhatsApp */}
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-7 py-3.5
            text-xs tracking-[0.3em] uppercase font-bold
            hover:bg-[#20c05c] transition-all duration-200 active:scale-[0.97] rounded-sm"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Pedir por WhatsApp
        </a>
      </div>
    </section>
  );
}

/* ─────────────── FOOTER ─────────────── */
function LandingFooter() {
  const [ref, visible] = useReveal(0);
  return (
    <footer className="relative overflow-hidden">
      {/* Fondo con imagen muy oscura */}
      <img
        src="https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&q=60"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      />
      <div className="absolute inset-0 bg-[#111]" style={{ opacity: 0.85 }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />

      <div
        ref={ref}
        className={`relative z-10 px-4 py-16 text-center transition-all duration-700
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-5 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <img src="/logo.jpg" alt="Salvatore" className="w-full h-full object-cover" />
        </div>

        <p className="text-[#8a8a8a] text-[9px] tracking-[0.5em] uppercase mb-1"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}>
          Licorería
        </p>
        <h2 className="text-[#e8e8e8] text-2xl tracking-[0.15em] uppercase mb-2"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Salvatore
        </h2>
        <p className="text-[#4a4a4a] text-[9px] tracking-[0.3em] uppercase mb-10"
          style={{ fontFamily: 'var(--font-body)' }}>
          Ica, Perú · 8:00am – 9:00pm todos los días
        </p>

        {/* CTA grande */}
        <Link
          href="/tienda"
          className="inline-flex items-center gap-3 bg-[#c8c8c8] text-black
            px-10 py-4 text-xs tracking-[0.45em] uppercase font-black
            hover:bg-[#e0e0e0] hover:shadow-[0_0_40px_rgba(200,200,200,0.15)]
            transition-all duration-300 active:scale-[0.97] mb-12"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Ver Tienda Completa
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Links */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="text-[#4a4a4a] hover:text-[#8a8a8a] transition-colors text-[9px] tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-body)' }}>
            WhatsApp
          </a>
          <div className="w-px h-3 bg-white/10" />
          <Link href="/tienda" className="text-[#4a4a4a] hover:text-[#8a8a8a] transition-colors text-[9px] tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-body)' }}>
            Tienda
          </Link>
        </div>

        <p className="text-[8px] tracking-[0.4em] uppercase flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
          style={{ fontFamily: 'var(--font-body)' }}>
          <span className="text-[#2a2a2a]">© 2025 Licorería Salvatore · Todos los derechos reservados</span>
          <span className="text-[#7a7a7a]">· Desarrollado por SupraDev</span>
        </p>
      </div>
    </footer>
  );
}

/* ─────────────── PAGE ─────────────── */
export default function LandingPage() {
  return (
    <main className="bg-[#1e1e1e]">
      <HeroSection />
      <PromotionsSection />
      <BestSellersSection />
      <HowItWorksSection />
      <ScheduleSection />
      <LandingFooter />
    </main>
  );
}
