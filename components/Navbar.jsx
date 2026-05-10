'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/CartContext';

export default function Navbar() {
  const { count, setIsOpen } = useCart();
  const pathname = usePathname();
  const isStore = pathname === '/tienda';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#1e1e1e]/95 backdrop-blur-md border-b border-white/[0.06]">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo + nombre */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative w-9 h-9 overflow-hidden rounded-sm flex-shrink-0">
            <Image src="/logo.jpg" alt="Licorería Salvatore" fill className="object-cover" priority />
          </div>
          <div className="leading-none">
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
              ${!isStore
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

      </nav>
    </header>
  );
}
