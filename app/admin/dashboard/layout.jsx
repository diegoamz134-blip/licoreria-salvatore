'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar');
    if (saved !== null) setCollapsed(saved === '1');
  }, []);

  const toggle = () => setCollapsed(c => {
    localStorage.setItem('admin_sidebar', !c ? '1' : '0');
    return !c;
  });

  return (
    <div className="flex min-h-screen bg-[#0e0e0e]">
      {/* Sidebar */}
      <AdminSidebar collapsed={collapsed} onToggle={toggle} />

      {/* Contenido principal */}
      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto pt-8">
        {children}
      </main>
    </div>
  );
}
