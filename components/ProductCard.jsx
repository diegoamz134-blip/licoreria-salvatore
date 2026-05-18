'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';

/* ── Inyecta los keyframes solo la primera vez ── */
function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('fly-cart-styles')) return;
  const s = document.createElement('style');
  s.id = 'fly-cart-styles';
  s.textContent = `
    @keyframes toastIn  { from { opacity:0; transform:translateY(-10px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes toastOut { from { opacity:1; transform:translateY(0) scale(1); }         to { opacity:0; transform:translateY(-10px) scale(0.95); } }
  `;
  document.head.appendChild(s);
}

/* ── Círculo que vuela hacia el carrito ── */
function flyToCart(fromRect) {
  const cartBtn = document.getElementById('cart-btn');
  if (!cartBtn) return;

  const to = cartBtn.getBoundingClientRect();
  const sx = fromRect.left + fromRect.width  / 2;
  const sy = fromRect.top  + fromRect.height / 2;
  const ex = to.left + to.width  / 2;
  const ey = to.top  + to.height / 2;
  const ax = (sx + ex) / 2;
  const ay = Math.min(sy, ey) - 90;

  const name = `fly${Date.now()}`;
  const dot  = document.createElement('div');
  dot.style.cssText = `
    position:fixed;z-index:9999;pointer-events:none;
    width:36px;height:36px;border-radius:50%;
    background:#c8c8c8;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 16px rgba(0,0,0,0.45);
    left:${sx - 18}px;top:${sy - 18}px;
  `;
  dot.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>`;

  const kf = document.createElement('style');
  kf.textContent = `@keyframes ${name}{
    0%  {left:${sx-18}px;top:${sy-18}px;transform:scale(1);opacity:1}
    45% {left:${ax-18}px;top:${ay-18}px;transform:scale(0.82);opacity:0.95}
    100%{left:${ex-18}px;top:${ey-18}px;transform:scale(0.1);opacity:0}
  }`;
  document.head.appendChild(kf);
  dot.style.animation = `${name} 1.1s cubic-bezier(.3,.1,.2,1) forwards`;
  document.body.appendChild(dot);

  /* Bounce en el ícono del carrito */
  setTimeout(() => {
    cartBtn.animate(
      [{ transform:'scale(1)' },{ transform:'scale(1.4)' },{ transform:'scale(0.88)' },{ transform:'scale(1)' }],
      { duration: 380, easing: 'ease-out' }
    );
  }, 1000);

  setTimeout(() => { dot.remove(); kf.remove(); }, 1250);
}

/* ── Toast flotante ── */
function showToast(productName) {
  ensureStyles();
  const prev = document.getElementById('cart-toast');
  if (prev) prev.remove();

  const toast = document.createElement('div');
  toast.id = 'cart-toast';
  toast.style.cssText = `
    position:fixed;top:68px;right:14px;z-index:9998;
    background:#242424;border:1px solid rgba(200,200,200,0.18);
    color:#c8c8c8;font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;
    padding:10px 15px;display:flex;align-items:center;gap:9px;
    box-shadow:0 8px 28px rgba(0,0,0,0.55);
    font-family:var(--font-body,"Lato",sans-serif);
    animation:toastIn 0.28s ease forwards;
  `;
  toast.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    Añadido al carrito
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.28s ease forwards';
    setTimeout(() => toast.remove(), 320);
  }, 1900);
}

/* ─────────────────────────────────── */

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const cardRef = useRef(null);

  const handleAdd = () => {
    if (product.stock_quantity === 0 || added) return;

    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) flyToCart(rect);
    showToast(product.name);

    // Usar el precio de oferta si existe
    const finalPrice = product.sale_price || product.price;
    addItem({ ...product, price: finalPrice });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isOutOfStock = product.stock_quantity === 0;
  const hasSale      = product.sale_price && product.sale_price < product.price;

  return (
    <article
      ref={cardRef}
      className="group relative bg-[#2e2e2e] border border-white/[0.07] overflow-hidden flex flex-col card-shimmer
        transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c8c8c8]/20 hover:shadow-[0_6px_24px_rgba(0,0,0,0.35)]"
    >
      {/* ── Imagen ── */}
      <Link href={`/tienda/${product.slug || product.id}`} className="relative overflow-hidden bg-[#242424] block" style={{ aspectRatio: '3/4' }}>
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06] opacity-85 group-hover:opacity-95"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.categories?.name && (
            <span
              className="bg-black/60 backdrop-blur-sm text-[#8a8a8a] text-[8.5px] tracking-[0.3em] uppercase px-2 py-1 w-fit"
              style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)', fontWeight: 400 }}
            >
              {product.categories.name}
            </span>
          )}
          {hasSale && (
            <span
              className="bg-green-600 text-white text-[8.5px] tracking-[0.2em] uppercase px-2 py-1 font-bold w-fit shadow-lg"
              style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
            >
              Oferta
            </span>
          )}
        </div>

        {/* Out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span
              className="text-[#8a8a8a] text-[9px] tracking-[0.4em] uppercase border border-[#5a5a5a]/40 px-3 py-1.5"
              style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
            >
              Agotado
            </span>
          </div>
        )}
      </Link>

      {/* ── Info ── */}
      <div className="p-3.5 flex flex-col flex-1">
        <div className="mb-1.5">
          {product.brands?.name && (
            <p className="text-[#4a4a4a] text-[8px] tracking-[0.3em] uppercase font-bold"
              style={{ fontFamily: 'var(--font-body)' }}>
              {product.brands.name}
            </p>
          )}
          <Link href={`/tienda/${product.slug || product.id}`}>
            <h3
              className="text-[#e8e8e8] text-base leading-tight font-semibold hover:text-[#c8c8c8] transition-colors"
              style={{ fontFamily: 'var(--font-display, "Raleway", sans-serif)', fontWeight: 600 }}
            >
              {product.name}
            </h3>
          </Link>
        </div>

        <p
          className="text-[#5a5a5a] text-xs leading-relaxed mb-3 flex-1 line-clamp-2"
          style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)', fontWeight: 400 }}
        >
          {product.description}
        </p>

        {/* Price + Stock */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            {hasSale && (
              <span className="text-[#4a4a4a] text-[10px] line-through decoration-red-900/50"
                style={{ fontFamily: 'var(--font-body)' }}>
                S/ {Number(product.price).toFixed(2)}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span
                className="text-[#5a5a5a] text-[10px]"
                style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
              >
                S/
              </span>
              <span
                className="text-[#c8c8c8] text-xl"
                style={{ fontFamily: 'var(--font-display, "Raleway", sans-serif)', fontWeight: 700 }}
              >
                {Number(hasSale ? product.sale_price : product.price).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Stock */}
          {!isOutOfStock && (
            <span
              className={`text-[8.5px] tracking-[0.15em] uppercase px-1.5 py-0.5 border
                ${product.stock_quantity <= 5
                  ? 'text-yellow-500 border-yellow-500/25 bg-yellow-500/[0.07]'
                  : 'text-[#4a4a4a] border-white/[0.07]'
                }`}
              style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)', fontWeight: 700 }}
            >
              {product.stock_quantity <= 5 ? `${product.stock_quantity} left` : `Stock: ${product.stock_quantity}`}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`w-full py-2.5 text-[10px] tracking-[0.3em] uppercase transition-all duration-200 font-semibold
            ${added
              ? 'bg-[#c8c8c8]/15 text-[#8a8a8a] cursor-default'
              : isOutOfStock
                ? 'bg-white/[0.03] text-[#5a5a5a] cursor-not-allowed border border-white/5'
                : 'bg-[#c8c8c8] text-black hover:bg-[#d8d8d8] active:scale-[0.98]'
            }`}
          style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
        >
          {added ? '✓ Añadido' : isOutOfStock ? 'Sin stock' : 'Añadir al carrito'}
        </button>
      </div>
    </article>
  );
}
