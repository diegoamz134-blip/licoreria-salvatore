'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE  = 10;
const CATEGORIES = ['Pisco','Whisky','Vodka','Ron','Gin','Tequila','Champagne','Cognac','Licor','Vino'];
const EMPTY_FORM = { name:'', description:'', price:'', stock_quantity:'', category:'Pisco', image_url:'' };

/* ── Paginación ── */
function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  const btnCls = (active) =>
    `min-w-[30px] h-[30px] flex items-center justify-center text-[10px] border transition-all duration-150
     ${active
       ? 'bg-[#c8c8c8] text-black border-[#c8c8c8] font-bold'
       : 'bg-transparent border-white/[0.07] text-[#4a4a4a] hover:border-white/20 hover:text-[#8a8a8a]'
     }`;

  return (
    <div className="flex items-center justify-between mt-5 gap-4 flex-wrap">
      <p className="text-[#3a3a3a] text-[10px]" style={{ fontFamily: 'var(--font-body)' }}>
        Página {page} de {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className={`${btnCls(false)} ${page === 1 ? 'opacity-20 cursor-not-allowed' : ''}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        {pages.map((p, i) =>
          p === '…'
            ? <span key={`e${i}`} className="text-[#2e2e2e] text-[10px] px-1">…</span>
            : <button key={p} onClick={() => onPage(p)} className={btnCls(p === page)}
                style={{ fontFamily: 'var(--font-body)' }}>{p}</button>
        )}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          className={`${btnCls(false)} ${page === totalPages ? 'opacity-20 cursor-not-allowed' : ''}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Modal agregar / editar ── */
function ProductModal({ product, onClose, onSave }) {
  const [form,   setForm]   = useState(
    product
      ? { ...product, price: String(product.price), stock_quantity: String(product.stock_quantity) }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.stock_quantity) {
      setError('Nombre, precio y stock son obligatorios.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      name:           form.name.trim(),
      description:    form.description.trim(),
      price:          parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity),
      category:       form.category,
      image_url:      form.image_url.trim(),
    };
    const res = await fetch('/api/admin/products', {
      method:  product ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(product ? { id: product.id, ...payload } : payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Error al guardar. Revisa la service role key en .env.local');
    } else {
      onSave();
    }
    setSaving(false);
  };

  const inputCls = "w-full bg-[#1e1e1e] border border-white/[0.07] text-[#e8e8e8] text-sm px-3 py-2.5 placeholder:text-[#2a2a2a] focus:border-[#c8c8c8]/25 focus:outline-none transition-colors";
  const Field = ({ label, children }) => (
    <div>
      <label className="block text-[8.5px] tracking-[0.3em] uppercase text-[#3a3a3a] mb-1.5"
        style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#141414] border border-white/[0.07] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-[#e8e8e8] text-base" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="text-[#3a3a3a] hover:text-[#8a8a8a] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Field label="Nombre">
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Ej: Johnny Walker Black Label" className={inputCls}
              style={{ fontFamily: 'var(--font-body)' }} />
          </Field>
          <Field label="Descripción">
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Descripción del producto…" rows={3}
              className={`${inputCls} resize-none`} style={{ fontFamily: 'var(--font-body)' }} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio (S/)">
              <input type="number" min="0" step="0.01" value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="0.00" className={inputCls} style={{ fontFamily: 'var(--font-body)' }} />
            </Field>
            <Field label="Stock">
              <input type="number" min="0" value={form.stock_quantity}
                onChange={e => set('stock_quantity', e.target.value)}
                placeholder="0" className={inputCls} style={{ fontFamily: 'var(--font-body)' }} />
            </Field>
          </div>
          <Field label="Categoría">
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className={`${inputCls} cursor-pointer`} style={{ fontFamily: 'var(--font-body)' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="URL de imagen">
            <input value={form.image_url} onChange={e => set('image_url', e.target.value)}
              placeholder="https://…" className={inputCls} style={{ fontFamily: 'var(--font-body)' }} />
          </Field>
          {form.image_url && (
            <div className="border border-white/[0.06] overflow-hidden h-28">
              <img src={form.image_url} alt="preview" className="w-full h-full object-cover opacity-70" />
            </div>
          )}
          {error && (
            <p className="text-red-400 text-[10.5px] flex items-center gap-2" style={{ fontFamily: 'var(--font-body)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </p>
          )}
        </div>
        <div className="flex gap-2 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-[9.5px] tracking-[0.3em] uppercase text-[#4a4a4a]
              border border-white/[0.07] hover:border-white/15 hover:text-[#8a8a8a] transition-colors"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className={`flex-1 py-2.5 text-[9.5px] tracking-[0.3em] uppercase font-bold transition-all
              ${saving ? 'bg-[#c8c8c8]/30 text-black/30 cursor-wait' : 'bg-[#c8c8c8] text-black hover:bg-white'}`}
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
            {saving ? 'Guardando…' : product ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal eliminar ── */
function DeleteModal({ product, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const confirm = async () => { setDeleting(true); await onConfirm(); setDeleting(false); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#141414] border border-white/[0.07] w-full max-w-sm p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 flex items-center justify-center bg-red-950/30 border border-red-900/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <div>
            <h3 className="text-[#e8e8e8] text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              Eliminar producto
            </h3>
            <p className="text-[#4a4a4a] text-[10.5px]" style={{ fontFamily: 'var(--font-body)' }}>
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>
        <p className="text-[#5a5a5a] text-xs mb-5" style={{ fontFamily: 'var(--font-body)' }}>
          ¿Eliminar <span className="text-[#c8c8c8]">{product.name}</span>?
        </p>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-[9.5px] tracking-[0.3em] uppercase text-[#4a4a4a]
              border border-white/[0.07] hover:border-white/15 hover:text-[#8a8a8a] transition-colors"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
            Cancelar
          </button>
          <button onClick={confirm} disabled={deleting}
            className={`flex-1 py-2.5 text-[9.5px] tracking-[0.3em] uppercase font-bold transition-all
              ${deleting ? 'bg-red-900/30 cursor-wait text-red-400/40' : 'bg-red-900/40 text-red-400 hover:bg-red-900/60'}`}
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
            {deleting ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Página principal ── */
export default function ProductosPage() {
  const [products,   setProducts]   = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [query,      setQuery]      = useState('');
  const [catFilter,  setCatFilter]  = useState('Todos');
  const [modal,      setModal]      = useState(null);
  const [delTarget,  setDelTarget]  = useState(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const load = useCallback(async (pg = page, q = query, cat = catFilter) => {
    setLoading(true);
    const from = (pg - 1) * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;

    let req = supabase.from('products').select('*', { count: 'exact' });
    if (cat !== 'Todos')  req = req.eq('category', cat);
    if (q.trim())         req = req.ilike('name', `%${q.trim()}%`);
    req = req.order('created_at', { ascending: false }).range(from, to);

    const { data, count } = await req;
    setProducts(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [page, query, catFilter]);

  /* Carga inicial */
  useEffect(() => { load(1, '', 'Todos'); }, []);

  /* Debounce del buscador */
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1, query, catFilter); }, 380);
    return () => clearTimeout(t);
  }, [query]);

  /* Cambio de categoría o página inmediato */
  useEffect(() => { setPage(1); load(1, query, catFilter); }, [catFilter]);
  useEffect(() => { load(page, query, catFilter); }, [page]);

  const goPage = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  const handleDelete = async () => {
    await fetch('/api/admin/products', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: delTarget.id }),
    });
    setDelTarget(null);
    load(page, query, catFilter);
  };

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-[8px] tracking-[0.45em] uppercase text-[#3a3a3a] mb-0.5"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>Catálogo</p>
          <h1 className="text-[#e8e8e8] text-2xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Productos
          </h1>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-[#c8c8c8] text-black px-4 py-2.5
            text-[9.5px] tracking-[0.3em] uppercase font-bold hover:bg-white transition-colors"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo producto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a3a3a] pointer-events-none">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full bg-[#141414] border border-white/[0.07] text-[#e8e8e8] text-sm
              pl-9 pr-4 py-2.5 placeholder:text-[#2a2a2a] focus:border-[#c8c8c8]/20 focus:outline-none transition-colors"
            style={{ fontFamily: 'var(--font-body)' }} />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="bg-[#141414] border border-white/[0.07] text-[#5a5a5a] text-[10px] tracking-[0.2em] uppercase
            px-3 py-2.5 focus:outline-none focus:border-[#c8c8c8]/20 cursor-pointer transition-colors"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
          <option value="Todos">Todas las categorías</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Contador */}
      <p className="text-[#3a3a3a] text-[10px] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
        {loading ? '…' : `${totalCount} producto${totalCount !== 1 ? 's' : ''} · mostrando ${products.length}`}
      </p>

      {/* Tabla */}
      <div className="bg-[#141414] border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-3 text-[#3a3a3a] text-xs"
            style={{ fontFamily: 'var(--font-body)' }}>
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Cargando productos…
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-[#2a2a2a] text-xs" style={{ fontFamily: 'var(--font-body)' }}>
            No se encontraron productos
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ fontFamily: 'var(--font-body)' }}>
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Imagen','Nombre','Categoría','Precio','Stock','Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[8px] tracking-[0.3em] uppercase text-[#2e2e2e] font-bold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id}
                    className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${i%2===0?'':'bg-white/[0.01]'}`}>
                    <td className="px-4 py-3">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="w-10 h-12 object-cover opacity-80" />
                        : <div className="w-10 h-12 bg-[#1e1e1e] border border-white/[0.06]" />
                      }
                    </td>
                    <td className="px-4 py-3 text-[#c8c8c8] max-w-[200px]">
                      <p className="font-semibold leading-tight truncate">{p.name}</p>
                      {p.description && (
                        <p className="text-[#3a3a3a] text-[10px] leading-tight line-clamp-1 mt-0.5">{p.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[8.5px] tracking-[0.2em] uppercase text-[#5a5a5a] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-green-400 font-bold whitespace-nowrap">S/ {Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${p.stock_quantity === 0 ? 'text-red-400' : p.stock_quantity <= 5 ? 'text-yellow-400' : 'text-[#c8c8c8]'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModal(p)}
                          className="p-1.5 text-[#3a3a3a] hover:text-[#c8c8c8] hover:bg-white/[0.05] transition-all" title="Editar">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button onClick={() => setDelTarget(p)}
                          className="p-1.5 text-[#3a3a3a] hover:text-red-400 hover:bg-red-950/20 transition-all" title="Eliminar">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      <Pagination page={page} totalPages={totalPages} onPage={goPage} />

      {/* Modals */}
      {(modal === 'add' || (modal && modal.id)) && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(page, query, catFilter); }}
        />
      )}
      {delTarget && (
        <DeleteModal
          product={delTarget}
          onClose={() => setDelTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
