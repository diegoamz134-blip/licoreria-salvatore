'use client';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

const PAGE_SIZE = 10;

const CATEGORIES = ['Todos', 'Pisco', 'Whisky', 'Vodka', 'Ron', 'Gin', 'Tequila', 'Champagne', 'Cognac', 'Licor', 'Vino'];

const SORT_OPTIONS = [
  { value: 'default',    label: 'Relevancia' },
  { value: 'price_asc',  label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc',   label: 'Nombre: A → Z' },
];

const CATEGORY_ICONS = {
  Todos:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Pisco:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 3h6v3l2 4v11H7V10l2-4V3z"/><line x1="7" y1="10" x2="17" y2="10"/><line x1="12" y1="3" x2="12" y2="6"/></svg>,
  Whisky:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 3h8l1 7H7L8 3zM7 10c0 5 2 8 5 9s5-4 5-9"/></svg>,
  Vodka:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 3h6l2 7v11H7V10L9 3z"/><line x1="7" y1="10" x2="17" y2="10"/></svg>,
  Ron:       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 3h8l1 7H7L8 3z"/><path d="M7 10v8a2 2 0 002 2h6a2 2 0 002-2v-8"/></svg>,
  Gin:       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="12" cy="13" rx="5" ry="7"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="9" y1="4" x2="15" y2="4"/></svg>,
  Tequila:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2c-1 2-3 3-3 6h6c0-3-2-4-3-6z"/><path d="M9 8v13h6V8"/><line x1="9" y1="13" x2="15" y2="13"/></svg>,
  Champagne: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v4M8 4l1.5 3M16 4l-1.5 3"/><path d="M9 7h6l1 5H8L9 7z"/><path d="M8 12v6a2 2 0 002 2h4a2 2 0 002-2v-6"/></svg>,
  Cognac:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 3h8l2 6H6L8 3z"/><path d="M6 9c0 6 2 9 6 10s6-4 6-10"/><line x1="12" y1="19" x2="12" y2="22"/></svg>,
  Licor:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v5l3 4v9H9v-9l3-4V3"/><line x1="9" y1="12" x2="15" y2="12"/></svg>,
  Vino:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 3h8l1 8a5 5 0 01-10 0L8 3z"/><line x1="12" y1="16" x2="12" y2="21"/><line x1="9" y1="21" x2="15" y2="21"/></svg>,
};

/* ── Skeleton card mientras carga ── */
function SkeletonCard() {
  return (
    <div className="bg-[#2e2e2e] border border-white/[0.07] overflow-hidden animate-pulse">
      <div className="bg-[#3a3a3a]" style={{ aspectRatio: '3/4' }} />
      <div className="p-3.5 space-y-2.5">
        <div className="h-4 bg-[#3a3a3a] rounded w-3/4" />
        <div className="h-3 bg-[#333] rounded w-full" />
        <div className="h-3 bg-[#333] rounded w-2/3" />
        <div className="h-8 bg-[#3a3a3a] rounded mt-3" />
      </div>
    </div>
  );
}

export default function TiendaPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [query, setQuery]             = useState('');
  const [activeCategory, setCategory] = useState('Todos');
  const [sortBy, setSortBy]           = useState('default');
  const [page, setPage]               = useState(1);

  const catsRef   = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = catsRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scrollCats = (dir) => {
    const el = catsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 180, behavior: 'smooth' });
  };

  /* ── Fetch desde Supabase ── */
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError('No se pudieron cargar los productos. Intenta de nuevo.');
      } else {
        setAllProducts(data || []);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  /* ── Flechas de categorías ── */
  useEffect(() => {
    const el = catsRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect(); };
  }, [updateArrows]);

  /* ── Reset página cuando cambian filtros ── */
  useEffect(() => { setPage(1); }, [query, activeCategory, sortBy]);

  /* ── Filtrado + ordenamiento ── */
  const allFiltered = useMemo(() => {
    let list = [...allProducts];

    if (activeCategory !== 'Todos') {
      list = list.filter(p => p.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'price_asc':  list.sort((a, b) => a.price - b.price);                  break;
      case 'price_desc': list.sort((a, b) => b.price - a.price);                  break;
      case 'name_asc':   list.sort((a, b) => a.name.localeCompare(b.name, 'es')); break;
    }
    return list;
  }, [allProducts, query, activeCategory, sortBy]);

  const totalPages = Math.max(1, Math.ceil(allFiltered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const results    = allFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasFilters = query.trim() || activeCategory !== 'Todos';
  const clearAll   = () => { setQuery(''); setCategory('Todos'); setSortBy('default'); };

  const goTo = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#1e1e1e] pt-16">

      {/* ── Cabecera ── */}
      <div className="border-b border-white/[0.06] bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-4 py-5">

          {/* Título */}
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="text-[#5a5a5a] text-[8.5px] tracking-[0.5em] uppercase mb-0.5"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                Licorería Salvatore
              </p>
              <h1 className="text-[#e8e8e8] text-2xl sm:text-3xl leading-none"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                Catálogo
              </h1>
            </div>
            <span className="text-[#4a4a4a] text-xs"
              style={{ fontFamily: 'var(--font-body)' }}>
              {loading ? '…' : `${allFiltered.length} producto${allFiltered.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Buscador */}
          <div className="relative mb-4">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a4a4a] pointer-events-none">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nombre, categoría…"
              className="w-full bg-[#242424] border border-white/[0.08] text-[#e8e8e8] text-sm
                pl-10 pr-10 py-3 placeholder:text-[#3a3a3a]
                focus:border-[#c8c8c8]/30 focus:outline-none transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#8a8a8a] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Categorías + Ordenar */}
          <div className="flex items-center gap-3">

            {/* Flecha izquierda */}
            <button
              onClick={() => scrollCats(-1)}
              aria-label="Anterior"
              className={`flex-shrink-0 flex items-center justify-center w-6 h-6 border
                transition-all duration-150
                ${canLeft
                  ? 'border-white/20 text-[#8a8a8a] hover:border-[#c8c8c8]/50 hover:text-[#c8c8c8]'
                  : 'border-white/[0.04] text-[#2e2e2e] pointer-events-none'
                }`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            {/* Scroll de categorías */}
            <div ref={catsRef} className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1 pb-0.5">
              {CATEGORIES.map(cat => {
                const active = activeCategory === cat;
                return (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`flex-shrink-0 flex items-center gap-1.5 text-[9px] tracking-[0.25em]
                      uppercase px-3 py-1.5 border transition-all duration-150 font-bold
                      ${active
                        ? 'border-[#c8c8c8] text-black bg-[#c8c8c8]'
                        : 'border-white/[0.08] text-[#5a5a5a] hover:border-white/20 hover:text-[#8a8a8a]'
                      }`}
                    style={{ fontFamily: 'var(--font-body)' }}>
                    <span className={active ? 'text-black' : 'text-[#4a4a4a]'}>
                      {CATEGORY_ICONS[cat]}
                    </span>
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Flecha derecha */}
            <button
              onClick={() => scrollCats(1)}
              aria-label="Siguiente"
              className={`flex-shrink-0 flex items-center justify-center w-6 h-6 border
                transition-all duration-150
                ${canRight
                  ? 'border-white/20 text-[#8a8a8a] hover:border-[#c8c8c8]/50 hover:text-[#c8c8c8]'
                  : 'border-white/[0.04] text-[#2e2e2e] pointer-events-none'
                }`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            {/* Sort dropdown */}
            <div className="relative flex-shrink-0">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-[#242424] border border-white/[0.08] text-[#5a5a5a]
                  text-[9px] tracking-[0.2em] uppercase pl-3 pr-7 py-1.5
                  focus:outline-none focus:border-white/20 cursor-pointer transition-colors
                  hover:border-white/15 hover:text-[#8a8a8a]"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#4a4a4a]">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

          </div>

          {/* Chips filtros activos */}
          {hasFilters && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.05]">
              <span className="text-[#4a4a4a] text-[8.5px] tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-body)' }}>Filtros:</span>
              {query.trim() && (
                <span className="flex items-center gap-1.5 bg-[#2e2e2e] border border-white/[0.08]
                  text-[#8a8a8a] text-[8.5px] px-2 py-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                  "{query}"
                  <button onClick={() => setQuery('')} className="text-[#5a5a5a] hover:text-[#c8c8c8]">×</button>
                </span>
              )}
              {activeCategory !== 'Todos' && (
                <span className="flex items-center gap-1.5 bg-[#2e2e2e] border border-white/[0.08]
                  text-[#8a8a8a] text-[8.5px] px-2 py-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                  {activeCategory}
                  <button onClick={() => setCategory('Todos')} className="text-[#5a5a5a] hover:text-[#c8c8c8]">×</button>
                </span>
              )}
              <button onClick={clearAll}
                className="text-[#4a4a4a] hover:text-[#8a8a8a] text-[8.5px] tracking-widest uppercase
                  underline underline-offset-2 transition-colors ml-1"
                style={{ fontFamily: 'var(--font-body)' }}>
                Limpiar todo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Contenido ── */}
      <section className="max-w-6xl mx-auto px-3 py-6 pb-28">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-[#2e2e2e] border border-red-900/40 px-4 py-3 mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-red-400 text-xs" style={{ fontFamily: 'var(--font-body)' }}>{error}</p>
          </div>
        )}

        {/* Skeletons mientras carga */}
        {loading && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Productos */}
        {!loading && results.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              {query.trim() ? (
                <p className="text-[#4a4a4a] text-xs" style={{ fontFamily: 'var(--font-body)' }}>
                  {allFiltered.length} resultado{allFiltered.length !== 1 ? 's' : ''} para{' '}
                  <span className="text-[#8a8a8a]">"{query}"</span>
                </p>
              ) : (
                <p className="text-[#3a3a3a] text-[9px] tracking-widest uppercase"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  Página {safePage} de {totalPages}
                </p>
              )}
              <p className="text-[#3a3a3a] text-[9px]" style={{ fontFamily: 'var(--font-body)' }}>
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, allFiltered.length)} de {allFiltered.length}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {results.map(product => <ProductCard key={product.id} product={product} />)}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10">
                <button onClick={() => goTo(safePage - 1)} disabled={safePage === 1}
                  className="flex items-center gap-1.5 px-4 py-2 border border-white/[0.08]
                    text-[#5a5a5a] text-[9px] tracking-[0.25em] uppercase font-bold
                    hover:border-white/20 hover:text-[#8a8a8a] transition-all
                    disabled:opacity-25 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => {
                    const isActive = n === safePage;
                    const show = n === 1 || n === totalPages || Math.abs(n - safePage) <= 1;
                    const showDot = (n === 2 && safePage > 3) || (n === totalPages - 1 && safePage < totalPages - 2);
                    if (!show && !showDot) return null;
                    if (showDot) return (
                      <span key={n} className="w-8 text-center text-[#3a3a3a] text-xs"
                        style={{ fontFamily: 'var(--font-body)' }}>…</span>
                    );
                    return (
                      <button key={n} onClick={() => goTo(n)}
                        className={`w-9 h-9 text-xs font-bold border transition-all duration-150
                          ${isActive
                            ? 'bg-[#c8c8c8] text-black border-[#c8c8c8]'
                            : 'border-white/[0.08] text-[#5a5a5a] hover:border-white/20 hover:text-[#8a8a8a]'
                          }`}
                        style={{ fontFamily: 'var(--font-body)' }}>
                        {n}
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 border border-white/[0.08]
                    text-[#5a5a5a] text-[9px] tracking-[0.25em] uppercase font-bold
                    hover:border-white/20 hover:text-[#8a8a8a] transition-all
                    disabled:opacity-25 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  Siguiente
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {/* Sin resultados */}
        {!loading && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 border border-white/[0.07] flex items-center justify-center mb-5 text-[#3a3a3a]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </div>
            <p className="text-[#4a4a4a] text-sm mb-1"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Sin resultados</p>
            <p className="text-[#3a3a3a] text-xs mb-6" style={{ fontFamily: 'var(--font-body)' }}>
              No encontramos productos para{query ? ` "${query}"` : ' esta categoría'}.
            </p>
            <button onClick={clearAll}
              className="bg-[#c8c8c8] text-black text-[9px] tracking-[0.3em] uppercase
                px-6 py-2.5 font-bold hover:bg-[#e0e0e0] transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}>
              Ver todos los productos
            </button>
          </div>
        )}
      </section>

      <footer className="border-t border-white/[0.05] px-4 py-8 text-center">
        <p className="text-[#2e2e2e] text-[8.5px] tracking-[0.4em] uppercase"
          style={{ fontFamily: 'var(--font-body)' }}>
          © 2024 Licorería Salvatore · Ica, Perú
        </p>
      </footer>
    </main>
  );
}
