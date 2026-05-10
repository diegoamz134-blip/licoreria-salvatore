'use client';
import { useEffect } from 'react';
import { useCart } from '@/lib/CartContext';

export default function CartDrawer() {
  const {
    items, removeItem, updateQuantity,
    total, count,
    isOpen, setIsOpen,
    setShowCheckout,
  } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCheckout = () => {
    setIsOpen(false);
    setShowCheckout(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-[340px] bg-[#1e1e1e] border-l border-white/[0.06]
          z-50 flex flex-col transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <div>
            <p
              className="text-[#5a5a5a] text-[9px] tracking-[0.4em] uppercase mb-0.5"
              style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)', fontWeight: 300 }}
            >
              Tu pedido
            </p>
            <h2
              className="text-[#e8e8e8] text-2xl leading-none"
              style={{ fontFamily: 'var(--font-display, "Raleway", sans-serif)', fontWeight: 700 }}
            >
              Carrito
              {count > 0 && (
                <span className="text-[#5a5a5a] ml-2 text-lg font-normal">({count})</span>
              )}
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-[#5a5a5a] hover:text-[#e8e8e8] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <svg
                width="36" height="36" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="0.75"
                className="text-white/10 mb-4"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p
                className="text-[#4a4a4a] text-[9px] tracking-[0.4em] uppercase"
                style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
              >
                Carrito vacío
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 pb-4 border-b border-white/[0.05] last:border-0">
                <div className="w-[58px] h-[74px] flex-shrink-0 overflow-hidden bg-[#2e2e2e]">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover opacity-80" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-[#e8e8e8] text-sm leading-tight mb-1 truncate font-semibold"
                    style={{ fontFamily: 'var(--font-display, "Raleway", sans-serif)' }}
                  >
                    {item.name}
                  </h4>
                  <p
                    className="text-[#5a5a5a] text-[10px] mb-2.5"
                    style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
                  >
                    S/ {Number(item.price).toFixed(2)} c/u
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-white/[0.1]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#5a5a5a] hover:text-[#e8e8e8] transition-colors text-base"
                      >−</button>
                      <span
                        className="w-7 text-center text-[#e8e8e8] text-xs"
                        style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
                      >{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#5a5a5a] hover:text-[#e8e8e8] transition-colors text-base"
                      >+</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[#c8c8c8] text-[11px] font-semibold"
                        style={{ fontFamily: 'var(--font-display, "Raleway", sans-serif)' }}
                      >
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#4a4a4a] hover:text-[#8a8a8a] transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className="px-5 pb-8 pt-4 border-t border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <span
                className="text-[#5a5a5a] text-[9px] tracking-[0.4em] uppercase"
                style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
              >
                Total a pagar
              </span>
              <span
                className="text-[#c8c8c8] text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display, "Raleway", sans-serif)', fontWeight: 700 }}
              >
                S/ {total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-[#c8c8c8] text-black py-4 text-[10px] tracking-[0.35em] uppercase
                hover:bg-[#d8d8d8] transition-all duration-200 active:scale-[0.99] font-bold"
              style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
            >
              Ir a pagar →
            </button>
            <p
              className="text-center text-[#4a4a4a] text-[8.5px] tracking-[0.25em]"
              style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
            >
              Yape · Plin · Tarjeta
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
