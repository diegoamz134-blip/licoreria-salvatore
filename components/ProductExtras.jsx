'use client';
import { useState } from 'react';

/* ── Trust Badges ── */
export function TrustBadges() {
  const badges = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
      title: 'Envío a todo Ica',
      desc: 'Delivery rápido'
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      ),
      title: 'Pago seguro',
      desc: '100% protegido'
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
        </svg>
      ),
      title: 'Original garantizado',
      desc: 'Producto auténtico'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mt-6">
      {badges.map((b, i) => (
        <div key={i} className="flex flex-col items-center text-center gap-1.5 py-3 px-2 border border-white/[0.05] bg-[#141414]/50 hover:border-white/[0.1] transition-colors group">
          <div className="text-[#5a5a5a] group-hover:text-[#8a8a8a] transition-colors">{b.icon}</div>
          <span className="text-[#8a8a8a] text-[8px] tracking-[0.2em] uppercase font-bold" style={{ fontFamily: 'var(--font-body)' }}>{b.title}</span>
          <span className="text-[#4a4a4a] text-[7.5px] tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>{b.desc}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Share Buttons ── */
export function ShareButtons({ productName }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`¡Mira este producto! ${productName} - ${window.location.href}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="flex items-center gap-2 mt-5">
      <span className="text-[#3a3a3a] text-[8px] tracking-[0.3em] uppercase mr-1" style={{ fontFamily: 'var(--font-body)' }}>Compartir</span>
      <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.08] text-[#5a5a5a] hover:text-[#c8c8c8] hover:border-white/20 transition-all text-[8px] tracking-widest uppercase" style={{ fontFamily: 'var(--font-body)' }}>
        {copied ? (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Copiado
          </>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            Link
          </>
        )}
      </button>
      <button onClick={shareWhatsApp} className="flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.08] text-[#5a5a5a] hover:text-[#25d366] hover:border-[#25d366]/30 transition-all text-[8px] tracking-widest uppercase" style={{ fontFamily: 'var(--font-body)' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.506 3.934 1.395 5.608L0 24l6.559-1.361A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.86 0-3.63-.502-5.168-1.392l-.37-.22-3.836.796.832-3.72-.24-.383A9.723 9.723 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/></svg>
        WhatsApp
      </button>
    </div>
  );
}

/* ── Product Tabs ── */
export function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('descripcion');

  const tabs = [
    { id: 'descripcion', label: 'Descripción' },
    { id: 'detalles', label: 'Detalles' },
    { id: 'maridaje', label: 'Maridaje' },
  ];

  return (
    <div className="mb-8">
      {/* Tab headers */}
      <div className="flex border-b border-white/[0.06] mb-5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-3 text-[9px] tracking-[0.3em] uppercase font-bold transition-colors
              ${activeTab === tab.id ? 'text-[#e8e8e8]' : 'text-[#4a4a4a] hover:text-[#8a8a8a]'}`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c8c8c8]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[100px] animate-in fade-in duration-300">
        {activeTab === 'descripcion' && (
          <p className="text-[#8a8a8a] text-sm leading-relaxed whitespace-pre-wrap font-light" style={{ fontFamily: 'var(--font-body)' }}>
            {product.description || 'Una excelente elección de nuestro catálogo. Contacta con nosotros para más detalles.'}
          </p>
        )}

        {activeTab === 'detalles' && (
          <div className="space-y-3">
            {[
              { label: 'Categoría', value: product.categories?.name },
              { label: 'Marca', value: product.brands?.name },
              { label: 'Contenido', value: '750 ml' },
              { label: 'País de origen', value: 'Perú' },
              { label: 'Stock disponible', value: `${product.stock_quantity} unidades` },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="text-[#5a5a5a] text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>{item.label}</span>
                <span className="text-[#b0b0b0] text-sm" style={{ fontFamily: 'var(--font-body)' }}>{item.value || '—'}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'maridaje' && (
          <div className="space-y-4">
            <p className="text-[#8a8a8a] text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Perfecto para disfrutar en reuniones especiales y celebraciones. Sugerencias de acompañamiento:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['Quesos maduros', 'Chocolate amargo', 'Frutos secos', 'Embutidos finos'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-2 px-3 border border-white/[0.05] bg-white/[0.02]">
                  <div className="w-1 h-1 bg-[#c8c8c8]/40 rotate-45 flex-shrink-0" />
                  <span className="text-[#8a8a8a] text-xs" style={{ fontFamily: 'var(--font-body)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
