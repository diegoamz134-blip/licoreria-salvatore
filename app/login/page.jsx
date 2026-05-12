'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const supabase = createClient();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else window.location.href = '/tienda';
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-[#161616] border border-white/[0.06] p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 mb-4 overflow-hidden rounded-full border border-white/10">
             <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
          </div>
          <h1 className="text-[#e8e8e8] text-2xl font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--font-display)' }}>Inicia Sesión</h1>
          <p className="text-[#4a4a4a] text-[10px] uppercase tracking-[0.2em] mt-2">Bienvenido a Salvatore</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-[9px] uppercase tracking-widest text-[#5a5a5a] mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-white/[0.08] text-white p-3 text-sm focus:border-[#c8c8c8]/30 outline-none transition-all"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-widest text-[#5a5a5a] mb-2">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-white/[0.08] text-white p-3 text-sm focus:border-[#c8c8c8]/30 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-[10px] uppercase text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#e8e8e8] text-black font-bold py-3 text-[11px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-[9px] uppercase"><span className="bg-[#161616] px-2 text-[#3a3a3a] tracking-widest">O continúa con</span></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white/[0.03] border border-white/[0.08] text-[#e8e8e8] py-3 text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/[0.06] transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <p className="text-center mt-8 text-[10px] text-[#4a4a4a] uppercase tracking-widest">
          ¿No tienes cuenta? <Link href="/register" className="text-[#c8c8c8] hover:text-white transition-colors">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
