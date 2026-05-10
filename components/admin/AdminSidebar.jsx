'use client';
import Link      from 'next/link';
import Image     from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  {
    href:  '/admin/dashboard',
    label: 'Resumen',
    icon:  (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href:  '/admin/dashboard/productos',
    label: 'Productos',
    icon:  (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    href:  '/admin/dashboard/pedidos',
    label: 'Pedidos',
    icon:  (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    href:  '/admin/dashboard/ventas',
    label: 'Ventas',
    icon:  (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  {
    href:  '/admin/dashboard/categorias',
    label: 'Categorías',
    icon:  (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  return (
    <>
      {/* ─── Sidebar desktop ─── */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen
          bg-[#0a0a0a] border-r border-white/[0.05] z-20
          transition-[width] duration-300 overflow-hidden
          ${collapsed ? 'w-14' : 'w-56'}`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 flex-shrink-0 border-b border-white/[0.05]
          ${collapsed ? 'justify-center' : 'gap-3 px-5'}`}>
          <div
            className="relative flex-shrink-0"
            style={{
              width:    collapsed ? 30 : 32,
              height:   collapsed ? 30 : 32,
              clipPath: 'polygon(50% 0%,95% 25%,95% 75%,50% 100%,5% 75%,5% 25%)',
            }}>
            <Image src="/logo.jpg" alt="Salvatore" fill className="object-cover" />
          </div>
          {!collapsed && (
            <div className="leading-none">
              <p className="text-[7px] tracking-[0.4em] text-[#3a3a3a] uppercase whitespace-nowrap"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>Admin</p>
              <p className="text-[#c8c8c8] text-[13px] tracking-[0.1em] uppercase whitespace-nowrap"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Salvatore</p>
            </div>
          )}
        </div>

        {/* Botón toggle — en el borde derecho */}
        <button
          onClick={onToggle}
          title={collapsed ? 'Expandir' : 'Colapsar'}
          className="absolute top-[52px] -right-3 w-6 h-6
            bg-[#161616] border border-white/[0.08]
            flex items-center justify-center
            text-[#3a3a3a] hover:text-[#c8c8c8] transition-colors z-30">
          <svg
            width="10" height="10" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        {/* Navegación */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-hidden">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <div key={href} className="relative group">
                <Link
                  href={href}
                  className={`flex items-center h-10 transition-all duration-150
                    border-l-2
                    ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'}
                    ${active
                      ? 'bg-[#c8c8c8]/10 text-[#c8c8c8] border-[#c8c8c8]'
                      : 'text-[#4a4a4a] hover:text-[#8a8a8a] hover:bg-white/[0.03] border-transparent'
                    }`}>
                  <span className={`flex-shrink-0 ${active ? 'text-[#c8c8c8]' : 'text-[#3a3a3a]'}`}>
                    {icon}
                  </span>
                  {!collapsed && (
                    <span
                      className="text-[10px] tracking-[0.25em] uppercase font-bold whitespace-nowrap"
                      style={{ fontFamily: 'var(--font-body)' }}>
                      {label}
                    </span>
                  )}
                </Link>

                {/* Tooltip cuando está colapsado */}
                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3
                    px-2.5 py-1.5 bg-[#1a1a1a] border border-white/[0.1] shadow-xl
                    text-[10px] tracking-[0.2em] uppercase text-[#c8c8c8] whitespace-nowrap
                    opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
                    style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                    {label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Cerrar sesión */}
        <div className="border-t border-white/[0.05] py-3 px-2 flex-shrink-0">
          <div className="relative group">
            <button
              onClick={handleLogout}
              className={`flex items-center h-10 w-full transition-colors duration-150
                text-[#3a3a3a] hover:text-[#f87171] hover:bg-red-950/10
                ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="flex-shrink-0">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {!collapsed && (
                <span className="text-[10px] tracking-[0.25em] uppercase font-bold whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  Cerrar sesión
                </span>
              )}
            </button>
            {collapsed && (
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3
                px-2.5 py-1.5 bg-[#1a1a1a] border border-white/[0.1] shadow-xl
                text-[10px] tracking-[0.2em] uppercase text-[#f87171] whitespace-nowrap
                opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                Cerrar sesión
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Top bar móvil ─── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30
        bg-[#0a0a0a] border-b border-white/[0.05]
        flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 overflow-hidden flex-shrink-0"
            style={{ clipPath: 'polygon(50% 0%,95% 25%,95% 75%,50% 100%,5% 75%,5% 25%)' }}>
            <Image src="/logo.jpg" alt="Salvatore" fill className="object-cover" />
          </div>
          <p className="text-[#c8c8c8] text-sm tracking-[0.1em] uppercase"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Salvatore</p>
        </div>
        <div className="flex items-center gap-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} title={label}
                className={`p-2 transition-colors ${active ? 'text-[#c8c8c8]' : 'text-[#3a3a3a] hover:text-[#6a6a6a]'}`}>
                {icon}
              </Link>
            );
          })}
          <button onClick={handleLogout} title="Salir"
            className="p-2 text-[#3a3a3a] hover:text-[#f87171] transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Espacio para top bar en móvil */}
      <div className="lg:hidden h-14 flex-shrink-0" />
    </>
  );
}
