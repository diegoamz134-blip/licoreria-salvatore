'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router   = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Error al ingresar');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Decoración de fondo ── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Destello central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[520px] h-[520px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #c8c8c8 0%, transparent 65%)' }} />
        {/* Rombos esquineros */}
        <div className="absolute -top-24 -left-24 w-80 h-80 border border-white/[0.025] rotate-45" />
        <div className="absolute -top-12 -left-12 w-80 h-80 border border-white/[0.015] rotate-45" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 border border-white/[0.025] rotate-45" />
        <div className="absolute -bottom-12 -right-12 w-80 h-80 border border-white/[0.015] rotate-45" />
        {/* Líneas decorativas horizontales */}
        <div className="absolute top-[18%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="absolute bottom-[18%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>

      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          mixBlendMode: 'overlay' }} />

      {/* ── Contenido ── */}
      <div className="relative w-full max-w-[360px]">

        {/* Logo + marca */}
        <div className="flex flex-col items-center mb-9">
          <div className="relative w-[72px] h-[72px] overflow-hidden mb-4"
            style={{ clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)' }}>
            <Image src="/logo.jpg" alt="Licorería Salvatore" fill className="object-cover" priority />
          </div>
          <p className="text-[#3a3a3a] text-[8px] tracking-[0.55em] uppercase mb-0.5"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
            Licorería
          </p>
          <h1 className="text-[#e8e8e8] text-[1.65rem] tracking-[0.18em] uppercase leading-none"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Salvatore
          </h1>
          <div className="flex items-center gap-3 mt-4">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-[#3a3a3a] text-[8.5px] tracking-[0.4em] uppercase"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
              Panel Administrativo
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/10" />
          </div>
        </div>

        {/* Tarjeta del formulario */}
        <div className="bg-[#161616] border border-white/[0.06] p-7
          shadow-[0_24px_60px_rgba(0,0,0,0.6)]">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-[8.5px] tracking-[0.35em] uppercase text-[#3a3a3a] mb-2"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a3a3a] pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@salvatore.com"
                  className="w-full bg-[#1e1e1e] border border-white/[0.07] text-[#e8e8e8] text-sm
                    pl-10 pr-4 py-3 placeholder:text-[#2a2a2a]
                    focus:border-[#c8c8c8]/25 focus:outline-none transition-colors duration-200"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-[8.5px] tracking-[0.35em] uppercase text-[#3a3a3a] mb-2"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a3a3a] pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-[#1e1e1e] border border-white/[0.07] text-[#e8e8e8] text-sm
                    pl-10 pr-11 py-3 placeholder:text-[#2a2a2a]
                    focus:border-[#c8c8c8]/25 focus:outline-none transition-colors duration-200"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#333] hover:text-[#666] transition-colors">
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-950/20 border border-red-900/25 px-3.5 py-3">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-red-400 text-[10.5px]" style={{ fontFamily: 'var(--font-body)' }}>
                  {error}
                </p>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 text-[10px] tracking-[0.4em] uppercase font-bold
                transition-all duration-200 mt-1
                ${loading
                  ? 'bg-[#c8c8c8]/40 text-black/40 cursor-wait'
                  : 'bg-[#c8c8c8] text-black hover:bg-white active:scale-[0.98] cursor-pointer'
                }`}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Verificando…
                  </span>
                : 'Ingresar al panel'
              }
            </button>

          </form>
        </div>

        {/* Pie */}
        <p className="text-center text-[#252525] text-[8px] tracking-[0.35em] uppercase mt-6"
          style={{ fontFamily: 'var(--font-body)' }}>
          Acceso restringido · Solo personal autorizado
        </p>

      </div>
    </div>
  );
}
