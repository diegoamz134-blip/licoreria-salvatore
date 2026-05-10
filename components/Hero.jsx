import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative pt-16 overflow-hidden bg-[#1e1e1e]">
      {/* Radial glow plateado sutil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 45% at 50% 55%, rgba(200,200,200,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative px-4 pt-10 pb-10 text-center max-w-2xl mx-auto">

        {/* Logo grande en el hero */}
        <div className="relative w-36 h-36 mx-auto mb-6 rounded-lg overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <Image
            src="/logo.jpg"
            alt="Licorería Salvatore"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Separador */}
        <div className="flex items-center gap-4 justify-center mb-5">
          <div className="h-px flex-1 max-w-[50px] bg-gradient-to-r from-transparent to-[#c8c8c8]/20" />
          <div className="w-1.5 h-1.5 bg-[#c8c8c8]/30 rotate-45" />
          <div className="h-px flex-1 max-w-[50px] bg-gradient-to-l from-transparent to-[#c8c8c8]/20" />
        </div>

        {/* Heading */}
        <h1 className="leading-tight mb-3">
          <span
            className="block text-[#8a8a8a] text-sm tracking-[0.5em] uppercase mb-1"
            style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)', fontWeight: 300 }}
          >
            Licorería
          </span>
          <span
            className="block text-[#eeeeee] text-5xl tracking-[0.08em] uppercase"
            style={{ fontFamily: 'var(--font-display, "Raleway", sans-serif)', fontWeight: 800 }}
          >
            Salvatore
          </span>
        </h1>

        {/* Subtítulo */}
        <p
          className="text-[#5a5a5a] text-xs tracking-[0.4em] uppercase mt-4"
          style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)', fontWeight: 400 }}
        >
          Delivery nocturno · Ica, Perú
        </p>

        <div className="mt-8 h-px bg-white/[0.05] max-w-xs mx-auto" />
      </div>
    </section>
  );
}
