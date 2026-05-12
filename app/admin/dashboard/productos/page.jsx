'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';

const PAGE_SIZE  = 10;
const EMPTY_FORM = { 
  name: '', 
  description: '', 
  price: '', 
  sale_price: '',
  stock_quantity: '', 
  category_id: '', 
  brand_id: '', 
  image_url: '',
  slug: '',
  is_active: true,
  is_featured: false
};

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

const inputCls = "w-full bg-[#1e1e1e] border border-white/[0.07] text-[#e8e8e8] text-sm px-3 py-2.5 placeholder:text-[#2a2a2a] focus:border-[#c8c8c8]/25 focus:outline-none transition-colors";

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[8.5px] tracking-[0.3em] uppercase text-[#3a3a3a] mb-1.5"
      style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>{label}</label>
    {children}
  </div>
);

/* ── Modal agregar / editar ── */
function ProductModal({ product, categories, brands, onClose, onSave }) {
  const [form,   setForm]   = useState(
    product
      ? { 
          ...product, 
          price: String(product.price), 
          sale_price: product.sale_price ? String(product.sale_price) : '',
          stock_quantity: String(product.stock_quantity),
          category_id: product.category_id || '',
          brand_id: product.brand_id || '',
          slug: product.slug || ''
        }
      : { ...EMPTY_FORM, category_id: categories[0]?.id || '', brand_id: brands[0]?.id || '' }
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // 1. Compresión de imagen
      const options = {
        maxSizeMB: 0.8,          // Máximo 800KB
        maxWidthOrHeight: 1200,  // Redimensionar si es muy grande
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);

      // 2. Subir a Supabase Storage
      const fileExt    = file.name.split('.').pop();
      const fileName   = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath   = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      // 3. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      set('image_url', publicUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(`Error al subir: ${err.message || 'Asegúrate de tener el bucket "products" con políticas RLS para usuarios autenticados.'}`);
    } finally {
      setUploading(false);
    }
  };

  // Generador de slug automático (solo para productos nuevos)
  const handleNameChange = (e) => {
    const name = e.target.value;
    set('name', name);
    if (!product) {
      const slug = name.toLowerCase()
        .trim()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
      set('slug', slug);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.stock_quantity) {
      setError('Nombre, precio y stock son obligatorios.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      name:           form.name.trim(),
      slug:           form.slug.trim(),
      description:    form.description.trim(),
      price:          parseFloat(form.price),
      sale_price:     form.sale_price ? parseFloat(form.sale_price) : null,
      stock_quantity: parseInt(form.stock_quantity),
      category_id:    form.category_id ? parseInt(form.category_id) : null,
      brand_id:       form.brand_id ? parseInt(form.brand_id) : null,
      image_url:      form.image_url.trim(),
      is_active:      form.is_active,
      is_featured:    form.is_featured,
    };
    const res = await fetch('/api/admin/products', {
      method:  product ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(product ? { id: product.id, ...payload } : payload),
    });
    
    if (!res.ok) {
      const data = await res.json();
      const msg = data.error || 'Error desconocido al guardar';
      setError(msg);
      alert('Error al guardar en base de datos: ' + msg);
    } else {
      onSave();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#141414] border border-white/[0.07] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre">
              <input value={form.name} onChange={handleNameChange}
                placeholder="Ej: Johnny Walker Black Label" className={inputCls} />
            </Field>
            <Field label="URL Amigable (Slug)">
              <input value={form.slug} onChange={e => set('slug', e.target.value)}
                placeholder="johnny-walker-black" className={inputCls} />
            </Field>
          </div>

          <Field label="Descripción">
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Descripción del producto…" rows={2}
              className={`${inputCls} resize-none`} />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Precio Regular (S/)">
              <input type="number" step="0.01" value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="0.00" className={inputCls} />
            </Field>
            <Field label="Precio Oferta (S/)">
              <input type="number" step="0.01" value={form.sale_price}
                onChange={e => set('sale_price', e.target.value)}
                placeholder="Opcional" className={inputCls} />
            </Field>
            <Field label="Stock Actual">
              <input type="number" value={form.stock_quantity}
                onChange={e => set('stock_quantity', e.target.value)}
                placeholder="0" className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoría">
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)}
                className={`${inputCls} cursor-pointer`}>
                <option value="">Sin categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Marca">
              <select value={form.brand_id} onChange={e => set('brand_id', e.target.value)}
                className={`${inputCls} cursor-pointer`}>
                <option value="">Sin marca</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Imagen del Producto">
            <div className="space-y-3">
              <div className="flex gap-4 items-start">
                {form.image_url && (
                  <div className="w-20 h-20 border border-white/[0.07] bg-[#1e1e1e] relative overflow-hidden shrink-0">
                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <label className={`
                    flex flex-col items-center justify-center w-full h-20 
                    border border-dashed border-white/[0.1] bg-[#1e1e1e]
                    hover:border-white/20 hover:bg-[#242424] transition-all cursor-pointer
                    ${uploading ? 'opacity-50 cursor-wait' : ''}
                  `}>
                    <div className="flex flex-col items-center justify-center pt-2 pb-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5a5a5a" strokeWidth="2" className="mb-1">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <p className="text-[9px] tracking-[0.1em] text-[#5a5a5a] uppercase font-bold">
                        {uploading ? 'Procesando...' : 'Subir imagen'}
                      </p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  <p className="mt-1.5 text-[8px] text-[#3a3a3a] tracking-[0.05em] uppercase">
                    Formatos: JPG, PNG, WEBP. Se comprimirá automáticamente.
                  </p>
                </div>
              </div>
              <div className="relative">
                <input value={form.image_url} onChange={e => set('image_url', e.target.value)}
                  placeholder="O pega una URL externa..." className={`${inputCls} text-[10px] py-2`} />
              </div>
            </div>
          </Field>

          <div className="flex gap-6 py-2">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="hidden" />
              <div className={`w-8 h-4 rounded-full relative transition-colors ${form.is_active ? 'bg-green-500' : 'bg-[#2a2a2a]'}`}>
                <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${form.is_active ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#5a5a5a] group-hover:text-[#8a8a8a]">Producto Activo</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="hidden" />
              <div className={`w-8 h-4 rounded-full relative transition-colors ${form.is_featured ? 'bg-[#c8c8c8]' : 'bg-[#2a2a2a]'}`}>
                <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${form.is_featured ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#5a5a5a] group-hover:text-[#8a8a8a]">Destacado</span>
            </label>
          </div>

          {error && (
            <p className="text-red-400 text-[10.5px] flex items-center gap-2 bg-red-950/20 p-2 border border-red-900/30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
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
          <button onClick={handleSave} disabled={saving || uploading}
            className={`flex-1 py-2.5 text-[9.5px] tracking-[0.3em] uppercase font-bold transition-all
              ${saving || uploading ? 'bg-[#c8c8c8]/30 text-black/30 cursor-wait' : 'bg-[#c8c8c8] text-black hover:bg-white shadow-[0_0_20px_rgba(200,200,200,0.15)]'}`}
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
            {saving ? 'Guardando en BD…' : uploading ? 'Procesando imagen...' : product ? 'Actualizar Producto' : 'Crear Producto'}
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
  const [categories, setCategories] = useState([]);
  const [brands,     setBrands]     = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [query,      setQuery]      = useState('');
  const [catFilter,  setCatFilter]  = useState('Todos');
  const [modal,      setModal]      = useState(null);
  const [delTarget,  setDelTarget]  = useState(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const loadData = useCallback(async () => {
    // Cargar Categorías y Marcas una sola vez
    const [cRes, bRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('brands').select('*').order('name')
    ]);
    setCategories(cRes.data || []);
    setBrands(bRes.data || []);
  }, []);

  const loadProducts = useCallback(async (pg = page, q = query, cat = catFilter) => {
    setLoading(true);
    const from = (pg - 1) * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;

    // Usamos una consulta más explícita para las relaciones
    let req = supabase
      .from('products')
      .select(`
        *,
        categories:category_id (id, name),
        brands:brand_id (id, name)
      `, { count: 'exact' });

    if (cat !== 'Todos')  req = req.eq('category_id', cat);
    if (q.trim())         req = req.ilike('name', `%${q.trim()}%`);
    
    req = req.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await req;
    
    if (error) {
      console.error('Error cargando productos:', error);
    } else {
      setProducts(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [page, query, catFilter]);

  const refreshAll = () => {
    loadData();
    loadProducts(page, query, catFilter);
  };

  /* Carga inicial */
  useEffect(() => { 
    loadData(); 
    loadProducts(1, '', 'Todos'); 
  }, [loadData, loadProducts]);

  /* Debounce del buscador */
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); loadProducts(1, query, catFilter); }, 380);
    return () => clearTimeout(t);
  }, [query]);

  /* Cambio de categoría o página inmediato */
  useEffect(() => { setPage(1); loadProducts(1, query, catFilter); }, [catFilter]);
  useEffect(() => { loadProducts(page, query, catFilter); }, [page]);

  const goPage = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  const handleDelete = async () => {
    await fetch('/api/admin/products', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: delTarget.id }),
    });
    setDelTarget(null);
    loadProducts(page, query, catFilter);
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
        <div className="flex items-center gap-3">
          <button onClick={refreshAll} title="Refrescar datos"
            className="p-2.5 border border-white/[0.07] text-[#3a3a3a] hover:text-[#c8c8c8] hover:border-white/20 transition-all">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
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
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                  {['Imagen','Nombre','Marca','Categoría','Precio','Stock','Estado','Acciones'].map(h => (
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
                    <td className="px-4 py-3 text-[#c8c8c8] max-w-[180px]">
                      <p className="font-semibold leading-tight truncate">{p.name}</p>
                      <p className="text-[#2a2a2a] text-[9px] truncate mt-0.5">/{p.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-[#5a5a5a]">{p.brands?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-[8.5px] tracking-[0.2em] uppercase text-[#5a5a5a] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5">
                        {p.categories?.name || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`font-bold ${p.sale_price ? 'text-[#5a5a5a] line-through text-[10px]' : 'text-green-400'}`}>
                          S/ {Number(p.price).toFixed(2)}
                        </span>
                        {p.sale_price && (
                          <span className="text-green-400 font-bold">S/ {Number(p.sale_price).toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${p.stock_quantity === 0 ? 'text-red-400' : p.stock_quantity <= 5 ? 'text-yellow-400' : 'text-[#c8c8c8]'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[7.5px] tracking-widest uppercase px-1.5 py-0.5 border w-fit font-bold
                          ${p.is_active ? 'border-green-900/40 text-green-500/80' : 'border-red-900/40 text-red-500/80'}`}>
                          {p.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {p.is_featured && (
                          <span className="text-[7.5px] tracking-widest uppercase px-1.5 py-0.5 bg-[#c8c8c8] text-black w-fit font-bold">
                            Destacado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
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
          categories={categories}
          brands={brands}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); loadProducts(page, query, catFilter); }}
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
