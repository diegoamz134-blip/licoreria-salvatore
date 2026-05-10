import { Raleway, Lato } from 'next/font/google';
import { CartProvider } from '@/lib/CartContext';
import PublicShell     from '@/components/PublicShell';
import './globals.css';

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'Licorería Salvatore — Licores de Élite',
  description: 'Los mejores licores con delivery en Ica.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1e1e1e',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${raleway.variable} ${lato.variable}`}>
      <body className="bg-[#242424] text-[#e8e8e8] antialiased selection:bg-[#c8c8c8] selection:text-black">
        <CartProvider>
          <div className="grain-overlay" aria-hidden="true" />
          <PublicShell />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
