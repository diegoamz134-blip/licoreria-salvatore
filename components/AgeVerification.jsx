'use client';
import { useEffect, useState } from 'react';

export default function AgeVerification() {
  const [isVerified, setIsVerified] = useState(true); // Asumimos true inicialmente para evitar un flashazo
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Al montar el componente, verificamos si ya aceptó
    const verified = localStorage.getItem('salvatore_age_verified');
    if (!verified) {
      setIsVerified(false);
      setShowModal(true);
      // Ocultar el scroll del body mientras está el modal
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleYes = () => {
    localStorage.setItem('salvatore_age_verified', 'true');
    setIsVerified(true);
    setShowModal(false);
    document.body.style.overflow = ''; // Restaurar scroll
  };

  const handleNo = () => {
    // Redirigir a Peppa Pig en YouTube
    window.location.href = 'https://www.youtube.com/watch?v=bwtTZVUmV94'; // Episodios de Peppa Pig
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#141414] border border-white/[0.07] max-w-md w-full p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#c8c8c8]" />
        
        <div className="w-20 h-20 mx-auto mb-6 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.6)] rounded-sm">
          <img src="/logo.jpg" alt="Licorería Salvatore" className="w-full h-full object-cover" />
        </div>

        <h2 className="text-[#e8e8e8] text-2xl uppercase tracking-[0.1em] mb-3"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          ¿Eres mayor de edad?
        </h2>
        
        <p className="text-[#8a8a8a] text-xs leading-relaxed mb-8"
          style={{ fontFamily: 'var(--font-body)' }}>
          Para ingresar a la Licorería Salvatore y realizar pedidos debes tener 18 años o más. Al hacer clic en "Sí", confirmas que cumples con la edad legal requerida.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleYes}
            className="w-full bg-[#c8c8c8] text-black px-6 py-3.5 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(200,200,200,0.15)] active:scale-[0.98]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Sí, tengo 18 años o más
          </button>
          <button
            onClick={handleNo}
            className="w-full bg-transparent border border-white/[0.08] text-[#5a5a5a] px-6 py-3 text-[10px] tracking-[0.3em] uppercase font-bold hover:border-white/20 hover:text-[#8a8a8a] transition-all active:scale-[0.98]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            No, soy menor de edad
          </button>
        </div>

        <p className="mt-6 text-[#4a4a4a] text-[8px] tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-body)' }}>
          El consumo excesivo de alcohol es dañino.
        </p>
      </div>
    </div>
  );
}
