'use client';
import { useEffect, useState } from 'react';

export default function CategoriasPage() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [newName,    setNewName]    = useState('');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [deleting,   setDeleting]   = useState(null);

  const load = async () => {
    setLoading(true);
    const res  = await fetch('/api/admin/categories');
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/categories', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName('');
      load();
    } else {
      const data = await res.json();
      setError(data.error?.includes('unique') ? 'Esa categoría ya existe.' : (data.error || 'Error al agregar'));
    }
    setSaving(false);
  };

  const handleDelete = async (cat) => {
    setDeleting(cat.id);
    await fetch('/api/admin/categories', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: cat.id }),
    });
    setDeleting(null);
    load();
  };

  return (
    <div className="p-6 lg:p-12 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-7">
        <p className="text-[8px] tracking-[0.45em] uppercase text-[#3a3a3a] mb-0.5"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>Gestión</p>
        <h1 className="text-[#e8e8e8] text-2xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Categorías
        </h1>
      </div>

      <div className="space-y-5">

        {/* Agregar nueva */}
        <div className="bg-[#141414] border border-white/[0.06] p-5">
          <p className="text-[8.5px] tracking-[0.35em] uppercase text-[#3a3a3a] mb-3"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
            Nueva categoría
          </p>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              value={newName}
              onChange={e => { setNewName(e.target.value); setError(''); }}
              placeholder="Ej: Mezcal, Sidra, Aperitivo…"
              className="flex-1 bg-[#1e1e1e] border border-white/[0.07] text-[#e8e8e8] text-sm
                px-3 py-2.5 placeholder:text-[#2a2a2a]
                focus:border-[#c8c8c8]/25 focus:outline-none transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            />
            <button
              type="submit"
              disabled={saving || !newName.trim()}
              className={`px-4 py-2.5 text-[9.5px] tracking-[0.3em] uppercase font-bold flex-shrink-0
                transition-all duration-150
                ${saving || !newName.trim()
                  ? 'bg-[#c8c8c8]/20 text-[#4a4a4a] cursor-not-allowed'
                  : 'bg-[#c8c8c8] text-black hover:bg-white cursor-pointer'
                }`}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
              {saving ? (
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Agregar
                </span>
              )}
            </button>
          </form>
          {error && (
            <p className="text-red-400 text-[10.5px] mt-2 flex items-center gap-1.5"
              style={{ fontFamily: 'var(--font-body)' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* Lista */}
        <div className="bg-[#141414] border border-white/[0.06] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
            <p className="text-[8.5px] tracking-[0.35em] uppercase text-[#3a3a3a]"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
              Categorías actuales
            </p>
            <span className="text-[#2e2e2e] text-[10px]" style={{ fontFamily: 'var(--font-body)' }}>
              {loading ? '…' : categories.length}
            </span>
          </div>

          {loading ? (
            <div className="px-5 py-8 flex items-center gap-3 text-[#3a3a3a] text-xs"
              style={{ fontFamily: 'var(--font-body)' }}>
              <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              Cargando…
            </div>
          ) : categories.length === 0 ? (
            <div className="px-5 py-8 text-[#2a2a2a] text-xs" style={{ fontFamily: 'var(--font-body)' }}>
              Sin categorías. Corre el SQL en Supabase primero.
            </div>
          ) : (
            <ul>
              {categories.map((cat, i) => (
                <li key={cat.id}
                  className={`flex items-center justify-between px-5 py-3
                    border-b border-white/[0.03] last:border-0
                    hover:bg-white/[0.02] transition-colors
                    ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-[#c8c8c8]/30 rotate-45 flex-shrink-0" />
                    <span className="text-[#c8c8c8] text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                      {cat.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(cat)}
                    disabled={deleting === cat.id}
                    title="Eliminar categoría"
                    className={`p-1.5 transition-colors flex-shrink-0
                      ${deleting === cat.id
                        ? 'text-[#2a2a2a] cursor-wait'
                        : 'text-[#2e2e2e] hover:text-red-400 hover:bg-red-950/20'
                      }`}>
                    {deleting === cat.id ? (
                      <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Nota */}
        <div className="flex items-start gap-2.5 px-4 py-3 bg-[#141414] border border-white/[0.04]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5a5a5a" strokeWidth="1.75" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[#3a3a3a] text-[10px] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            Las categorías nuevas aparecen automáticamente en los filtros de la tienda y en el formulario de productos.
          </p>
        </div>

      </div>
    </div>
  );
}
