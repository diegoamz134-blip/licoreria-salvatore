'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const { count, setIsOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const isStore = pathname === '/tienda';

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    // Escuchar cambios en la sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#1e1e1e]/95 backdrop-blur-md border-b border-white/[0.06]">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo + nombre */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative w-9 h-9 overflow-hidden rounded-sm flex-shrink-0">
            <Image src="/logo.jpg" alt="Licorería Salvatore" fill className="object-cover" priority />
          </div>
          <div className="hidden sm:block leading-none">
            <span className="block text-[8px] tracking-[0.35em] text-[#5a5a5a] uppercase"
              style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)', fontWeight: 300 }}>
              Licorería
            </span>
            <span className="block text-white text-[1rem] tracking-[0.1em] uppercase leading-tight"
              style={{ fontFamily: 'var(--font-display, "Raleway", sans-serif)', fontWeight: 700 }}>
              Salvatore
            </span>
          </div>
        </Link>

        {/* Navegación central */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className={`text-[9px] tracking-[0.3em] uppercase px-3 py-1.5 transition-colors duration-150
              ${pathname === '/'
                ? 'text-[#c8c8c8] border-b border-[#c8c8c8]/40'
                : 'text-[#4a4a4a] hover:text-[#8a8a8a]'
              }`}
            style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)', fontWeight: 700 }}
          >
            Inicio
          </Link>
          <Link
            href="/tienda"
            className={`text-[9px] tracking-[0.3em] uppercase px-3 py-1.5 transition-colors duration-150
              ${isStore
                ? 'text-[#c8c8c8] border-b border-[#c8c8c8]/40'
                : 'text-[#4a4a4a] hover:text-[#8a8a8a]'
              }`}
            style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)', fontWeight: 700 }}
          >
            Tienda
          </Link>
        </div>

        {/* Acciones Derecha */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Usuario / Login */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 p-1 pl-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
              >
                <span className="hidden md:block text-[10px] text-[#8a8a8a] uppercase tracking-widest px-1">
                  {profile?.full_name?.split(' ')[0] || 'Mi Cuenta'}
                </span>
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/20">
                  {user.user_metadata?.avatar_url || profile?.avatar_url ? (
                    <img src={user.user_metadata?.avatar_url || profile?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#333] flex items-center justify-center text-[10px] text-white">
                      {user.email[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </button>

              {/* Menú Desplegable */}
              {showMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-[#1a1a1a] border border-white/10 shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-white text-[10px] font-bold truncate">{profile?.full_name || user.email}</p>
                    <p className="text-[#5a5a5a] text-[8px] uppercase tracking-tighter">{profile?.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                  </div>
                  {profile?.role === 'admin' && (
                    <Link href="/admin/dashboard" onClick={() => setShowMenu(false)} className="block px-4 py-2 text-[#8a8a8a] text-[9px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">
                      Panel Admin
                    </Link>
                  )}
                  <Link href="/perfil" onClick={() => setShowMenu(false)} className="block px-4 py-2 text-[#8a8a8a] text-[9px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">
                    Mi Perfil
                  </Link>
                  <Link href="/mis-pedidos" onClick={() => setShowMenu(false)} className="block px-4 py-2 text-[#8a8a8a] text-[9px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">
                    Mis Pedidos
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-500/80 text-[9px] uppercase tracking-widest hover:bg-red-500/5 hover:text-red-500 transition-all"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/login"
              className="text-[#8a8a8a] hover:text-white text-[9px] uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full transition-all"
            >
              Entrar
            </Link>
          )}

          {/* Carrito */}
          <button
            id="cart-btn"
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-[#5a5a5a] hover:text-[#e8e8e8] transition-colors duration-200 group flex-shrink-0"
            aria-label={`Abrir carrito (${count} productos)`}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25"
              className="transition-transform duration-200 group-hover:scale-110">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#c8c8c8] text-black
                text-[10px] font-black rounded-full flex items-center justify-center px-1"
                style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}>
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
        </div>

      </nav>
      
      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {showMenu && <div className="fixed inset-0 z-[-1]" onClick={() => setShowMenu(false)} />}
    </header>
  );
}
