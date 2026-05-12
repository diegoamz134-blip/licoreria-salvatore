'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/lib/CartContext';
import { createClient } from '@/lib/supabase/client';

const FIELDS = [
  { id: 'name',    label: 'Nombre completo',     type: 'text', placeholder: 'Juan García' },
  { id: 'phone',   label: 'WhatsApp',             type: 'tel',  placeholder: '+51 999 999 999' },
  { id: 'address', label: 'Dirección de entrega', type: 'text', placeholder: 'Av. Los Maestros 123, Ica' },
];

const PAYMENT_METHODS = [
  { id: 'yape', label: 'Yape / Plin', icon: '📱', desc: 'Pago instantáneo' },
  { id: 'card', label: 'Tarjeta',     icon: '💳', desc: 'Visa · Mastercard' },
];

export default function CheckoutForm() {
  const { items, total, clearCart, showCheckout, setShowCheckout } = useCart();

  const [form, setForm]           = useState({ name: '', phone: '', address: '', payment: '' });
  const [user, setUser]           = useState(null);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const supabase = createClient();

  // Cargar datos del usuario si está logueado
  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Intentar obtener el perfil para autocompletar
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setForm(prev => ({
            ...prev,
            name: profile.full_name || prev.name,
            phone: profile.phone || prev.phone,
            address: profile.address || prev.address
          }));
        }
      }
    }
    if (showCheckout) loadUser();
  }, [showCheckout]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Requerido';
    if (!form.phone.trim())   e.phone   = 'Requerido';
    if (!form.address.trim()) e.address = 'Requerido';
    if (!form.payment)        e.payment = 'Selecciona un método';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const currentOrder = {
        name:         form.name.trim(),
        phone:        form.phone.trim(),
        address:      form.address.trim(),
        payment:      form.payment,
        total:        total,
        items:        [...items]
      };

      const res = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:          user?.id,
          customer_name:    currentOrder.name,
          customer_phone:   currentOrder.phone,
          delivery_address: currentOrder.address,
          payment_method:   currentOrder.payment,
          total_amount:     currentOrder.total,
          items:            currentOrder.items,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar el pedido');
      }
      
      setOrderData(currentOrder);
      setSubmitted(true);
      clearCart();
    } catch (err) {
      setErrors(p => ({ ...p, general: `Fallo: ${err.message}` }));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setShowCheckout(false);
    setSubmitted(false);
    setOrderData(null);
    setForm({ name: '', phone: '', address: '', payment: '' });
    setErrors({});
  };

  const sendWhatsApp = () => {
    if (!orderData) return;
    const storePhone = "51912626940";
    
    const itemsList = orderData.items.map(i => `• ${i.quantity}x ${i.name} (S/ ${(i.price * i.quantity).toFixed(2)})`).join('\n');
    const paymentLabel = PAYMENT_METHODS.find(p => p.id === orderData.payment)?.label || orderData.payment;
    
    const message = `*NUEVO PEDIDO - LICORERÍA SALVATORE*\n\n` +
      `*Cliente:* ${orderData.name}\n` +
      `*Teléfono:* ${orderData.phone}\n` +
      `*Dirección:* ${orderData.address}\n` +
      `*Pago:* ${paymentLabel}\n\n` +
      `*Detalle:*\n${itemsList}\n\n` +
      `*TOTAL: S/ ${orderData.total.toFixed(2)}*\n\n` +
      `_Adjunto la captura de mi pago a continuación._`;

    window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`, '_blank');
    handleReset();
  };

  if (!showCheckout) return null;

  return (
    <div className="fixed inset-0 bg-[#1e1e1e] z-50 overflow-y-auto">
      <div className="min-h-full px-4 pt-6 pb-16 max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-[#e8e8e8] text-2xl"
            style={{ fontFamily: 'var(--font-display, "Raleway", sans-serif)', fontWeight: 700 }}
          >
            {submitted ? 'Pedido recibido' : 'Finalizar pedido'}
          </h1>
          {!submitted && (
            <button
              onClick={handleReset}
              className="text-[#5a5a5a] hover:text-[#e8e8e8] transition-colors text-xs tracking-[0.3em] uppercase"
              style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
            >
              ← Volver
            </button>
          )}
        </div>

        {submitted ? (
          <div className="flex flex-col items-center text-center py-12">
            <div className="w-20 h-20 border border-green-500/30 bg-green-500/5 flex items-center justify-center mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-[#e8e8e8] text-xl mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              ¡Pedido registrado!
            </h2>
            <p className="text-[#5a5a5a] text-[10px] tracking-[0.2em] uppercase mb-8 max-w-[280px]" style={{ fontFamily: 'var(--font-body)' }}>
              Para completar tu compra, por favor envía el resumen y tu captura de pago a nuestro WhatsApp.
            </p>

            <button
              onClick={sendWhatsApp}
              className="w-full bg-[#25D366] text-white py-4 px-6 flex items-center justify-center gap-3
                text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#128C7E] transition-all mb-4 shadow-xl shadow-green-900/10"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.63 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Enviar a WhatsApp
            </button>

            <button
              onClick={handleReset}
              className="text-[#3a3a3a] hover:text-[#8a8a8a] text-[9px] tracking-[0.3em] uppercase transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Volver a la tienda
            </button>
          </div>
        ) : (
          <>
            {/* Resumen */}
            <div className="bg-[#2e2e2e] border border-white/[0.07] p-4 mb-7">
              <p
                className="text-[#4a4a4a] text-[9px] tracking-[0.4em] uppercase mb-3"
                style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
              >
                Resumen del pedido
              </p>
              <div className="space-y-2 mb-3">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-baseline">
                    <span
                      className="text-[#8a8a8a] text-xs truncate flex-1 pr-4"
                      style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
                    >
                      {item.quantity}× {item.name}
                    </span>
                    <span
                      className="text-[#8a8a8a] text-xs flex-shrink-0"
                      style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
                    >
                      S/ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-white/[0.06]">
                <span
                  className="text-[#e8e8e8] text-xs tracking-[0.3em] uppercase"
                  style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)', fontWeight: 700 }}
                >
                  Total
                </span>
                <span
                  className="text-[#c8c8c8] text-xl font-bold"
                  style={{ fontFamily: 'var(--font-display, "Raleway", sans-serif)', fontWeight: 700 }}
                >
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {FIELDS.map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label
                    htmlFor={id}
                    className="block text-[#5a5a5a] text-[9px] tracking-[0.4em] uppercase mb-2"
                    style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)', fontWeight: 700 }}
                  >
                    {label}
                  </label>
                  <input
                    id={id}
                    type={type}
                    value={form[id]}
                    onChange={e => {
                      setForm(p => ({ ...p, [id]: e.target.value }));
                      if (errors[id]) setErrors(p => ({ ...p, [id]: undefined }));
                    }}
                    placeholder={placeholder}
                    className={`w-full bg-[#2e2e2e] border text-[#e8e8e8] text-sm px-4 py-3
                      placeholder:text-[#3a3a3a] outline-none transition-colors duration-150
                      ${errors[id] ? 'border-[#c8c8c8]/40' : 'border-white/[0.08] focus:border-[#c8c8c8]/30'}`}
                    style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
                  />
                  {errors[id] && (
                    <p
                      className="text-[#8a8a8a] text-[9px] tracking-wider mt-1"
                      style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
                    >
                      {errors[id]}
                    </p>
                  )}
                </div>
              ))}

              {/* Método de pago */}
              <div>
                <p
                  className="text-[#5a5a5a] text-[9px] tracking-[0.4em] uppercase mb-3"
                  style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)', fontWeight: 700 }}
                >
                  Método de pago
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {PAYMENT_METHODS.map(opt => {
                    const selected = form.payment === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setForm(p => ({ ...p, payment: opt.id }));
                          if (errors.payment) setErrors(p => ({ ...p, payment: undefined }));
                        }}
                        className={`border py-4 px-3 flex flex-col items-center gap-1.5 bg-[#2e2e2e] transition-all duration-150
                          ${selected
                            ? 'border-[#c8c8c8] text-[#e8e8e8]'
                            : 'border-white/[0.08] text-[#5a5a5a] hover:border-white/20 hover:text-[#8a8a8a]'
                          }`}
                      >
                        <span className="text-2xl leading-none">{opt.icon}</span>
                        <span
                          className="text-[9.5px] tracking-[0.2em] uppercase"
                          style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)', fontWeight: 700 }}
                        >
                          {opt.label}
                        </span>
                        <span
                          className="text-[8px] opacity-60"
                          style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
                        >
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.payment && (
                  <p
                    className="text-[#8a8a8a] text-[9px] tracking-wider mt-1.5"
                    style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
                  >
                    {errors.payment}
                  </p>
                )}
              </div>

              {/* Visualización del QR (Yape/Plin) */}
              {(form.payment === 'yape' || form.payment === 'plin') && (
                <div className="bg-[#242424] border border-[#c8c8c8]/20 p-5 rounded-lg flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <p className="text-[#c8c8c8] text-[9px] tracking-[0.3em] uppercase mb-4 font-bold text-center">
                    Escanea para pagar con {form.payment === 'yape' ? 'Yape' : 'Plin'}
                  </p>
                  <div className="relative w-48 h-48 bg-white p-2 rounded-xl shadow-2xl shadow-black/50">
                    <img 
                      src="/yape.jpeg" 
                      alt="Código QR Yape Salvatore" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="mt-5 p-3 border border-dashed border-white/10 rounded-md bg-white/[0.02] w-full">
                    <p className="text-[#8a8a8a] text-[8.5px] tracking-[0.1em] uppercase text-center leading-relaxed">
                      1. Escanea y realiza el pago<br/>
                      2. Confirma tu pedido aquí abajo<br/>
                      <span className="text-[#c8c8c8] font-bold">3. Envía la captura por WhatsApp al finalizar</span>
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 text-[11px] tracking-[0.3em] uppercase font-bold transition-all mt-4
                  ${loading ? 'bg-white/15 text-white/30 cursor-wait' : 'bg-[#c8c8c8] text-black hover:bg-white active:scale-[0.98]'}`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {loading ? 'Registrando pedido...' : `Confirmar pedido S/ ${total.toFixed(2)}`}
              </button>

              {errors.general && (
                <p className="text-red-400 text-[10px] text-center mt-4 bg-red-900/10 p-3 border border-red-900/20">
                  {errors.general}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
