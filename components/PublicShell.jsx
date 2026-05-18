'use client';
import { usePathname } from 'next/navigation';
import Navbar         from '@/components/Navbar';
import CartDrawer     from '@/components/CartDrawer';
import CheckoutForm   from '@/components/CheckoutForm';
import WhatsAppButton from '@/components/WhatsAppButton';
import AgeVerification from '@/components/AgeVerification';

export default function PublicShell() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return (
    <>
      <AgeVerification />
      <Navbar />
      <CartDrawer />
      <CheckoutForm />
      <WhatsAppButton />
    </>
  );
}
