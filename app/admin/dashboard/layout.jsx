'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  // Verificar sesión cada vez que el layout monta o el usuario vuelve con las flechas
  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch('/api/admin/check', { cache: 'no-store' });
        if (!res.ok) {
          router.replace('/admin');
          return;
        }
      } catch {
        router.replace('/admin');
        return;
      }
      setReady(true);
    };

    verify();

    // También verificar cuando la pestaña vuelve al foco
    const onFocus = () => verify();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar');
    if (saved !== null) setCollapsed(saved === '1');
  }, []);

  const toggle = () => setCollapsed(c => {
    localStorage.setItem('admin_sidebar', !c ? '1' : '0');
    return !c;
  });

  // No mostrar nada hasta confirmar sesión válida
  if (!ready) return null;

  return (
    <div className="flex min-h-screen bg-[#0e0e0e]">
      <AdminSidebar collapsed={collapsed} onToggle={toggle} />
      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto pt-8">
        {children}
      </main>
    </div>
  );
}
