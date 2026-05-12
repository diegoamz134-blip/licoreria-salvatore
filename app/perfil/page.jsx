'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PerfilPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setForm({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          address: profile.address || ''
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [router, supabase]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name,
          phone: form.phone,
          address: form.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      setMessage('¡Perfil actualizado con éxito!');
    } catch (err) {
      setMessage(`Error al actualizar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center text-[#8a8a8a] text-xs uppercase tracking-widest">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-lg mx-auto">
      <div className="mb-8">
        <h1 
          className="text-[#e8e8e8] text-2xl"
          style={{ fontFamily: 'var(--font-display, "Raleway", sans-serif)', fontWeight: 700 }}
        >
          Mi Perfil
        </h1>
        <p 
          className="text-[#8a8a8a] text-[10px] tracking-[0.2em] uppercase mt-2"
          style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
        >
          Tus datos se usarán para autocompletar tus compras
        </p>
      </div>

      <div className="bg-[#1a1a1a] border border-white/[0.06] p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[#5a5a5a] text-[9px] tracking-[0.4em] uppercase mb-2 font-bold">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              value={user?.email || ''} 
              disabled 
              className="w-full bg-[#111] border border-white/[0.04] text-[#8a8a8a] text-sm px-4 py-3 cursor-not-allowed"
            />
            <p className="text-[#4a4a4a] text-[9px] mt-1">El correo no se puede cambiar.</p>
          </div>

          <div>
            <label htmlFor="full_name" className="block text-[#5a5a5a] text-[9px] tracking-[0.4em] uppercase mb-2 font-bold">
              Nombre Completo
            </label>
            <input 
              id="full_name"
              name="full_name"
              type="text" 
              value={form.full_name} 
              onChange={handleChange}
              placeholder="Ej. Juan García"
              className="w-full bg-[#2e2e2e] border border-white/[0.08] text-[#e8e8e8] text-sm px-4 py-3 outline-none focus:border-[#c8c8c8]/30 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-[#5a5a5a] text-[9px] tracking-[0.4em] uppercase mb-2 font-bold">
              WhatsApp
            </label>
            <input 
              id="phone"
              name="phone"
              type="tel" 
              value={form.phone} 
              onChange={handleChange}
              placeholder="Ej. +51 999 999 999"
              className="w-full bg-[#2e2e2e] border border-white/[0.08] text-[#e8e8e8] text-sm px-4 py-3 outline-none focus:border-[#c8c8c8]/30 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-[#5a5a5a] text-[9px] tracking-[0.4em] uppercase mb-2 font-bold">
              Dirección de Entrega
            </label>
            <input 
              id="address"
              name="address"
              type="text" 
              value={form.address} 
              onChange={handleChange}
              placeholder="Ej. Av. Los Maestros 123, Ica"
              className="w-full bg-[#2e2e2e] border border-white/[0.08] text-[#e8e8e8] text-sm px-4 py-3 outline-none focus:border-[#c8c8c8]/30 transition-colors"
            />
          </div>

          {message && (
            <div className={`p-3 text-[10px] uppercase tracking-wider text-center border ${message.includes('éxito') ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-4 mt-2 text-[11px] tracking-[0.3em] uppercase font-bold transition-all
              ${saving ? 'bg-white/15 text-white/30 cursor-wait' : 'bg-[#c8c8c8] text-black hover:bg-white active:scale-[0.98]'}`}
            style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
