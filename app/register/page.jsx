'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) setError(error.message);
    else setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-4 text-center">
        <div className="max-w-[400px] p-8 bg-[#161616] border border-white/10">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 className="text-white text-xl font-bold uppercase tracking-widest mb-4">¡Registro Exitoso!</h2>
          <p className="text-[#8a8a8a] text-xs uppercase tracking-widest leading-loose">Hemos enviado un link de confirmación a tu correo. Por favor, revísalo para activar tu cuenta.</p>
          <Link href="/login" className="mt-8 block text-[10px] uppercase tracking-widest text-[#c8c8c8] hover:text-white">Ir al Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-[#161616] border border-white/[0.06] p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 mb-4 overflow-hidden rounded-full border border-white/10">
             <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
          </div>
          <h1 className="text-[#e8e8e8] text-2xl font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--font-display)' }}>Únete</h1>
          <p className="text-[#4a4a4a] text-[10px] uppercase tracking-[0.2em] mt-2">Crea tu cuenta en Salvatore</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[9px] uppercase tracking-widest text-[#5a5a5a] mb-2">Nombre Completo</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-white/[0.08] text-white p-3 text-sm focus:border-[#c8c8c8]/30 outline-none transition-all"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
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
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-500 text-[10px] uppercase text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#e8e8e8] text-black font-bold py-3 text-[11px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p className="text-center mt-8 text-[10px] text-[#4a4a4a] uppercase tracking-widest">
          ¿Ya tienes cuenta? <Link href="/login" className="text-[#c8c8c8] hover:text-white transition-colors">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}
