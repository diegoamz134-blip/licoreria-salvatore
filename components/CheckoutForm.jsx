'use client';
import { useState } from 'react';
import { useCart } from '@/lib/CartContext';

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
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      const res = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name:    form.name.trim(),
          customer_phone:   form.phone.trim(),
          delivery_address: form.address.trim(),
          payment_method:   form.payment,
          total_amount:     total,
          items,
        }),
      });
      if (!res.ok) throw new Error('Error al guardar el pedido');
      setSubmitted(true);
      clearCart();
    } catch {
      setErrors(p => ({ ...p, general: 'Hubo un error al procesar el pedido. Intenta de nuevo.' }));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setShowCheckout(false);
    setSubmitted(false);
    setForm({ name: '', phone: '', address: '', payment: '' });
    setErrors({});
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
            <div className="w-16 h-16 border border-[#c8c8c8]/25 flex items-center justify-center mb-6">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8c8c8" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p
              className="text-[#5a5a5a] text-[9px] tracking-[0.4em] uppercase mb-2"
              style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
            >
              Confirmado
            </p>
            <p
              className="text-[#8a8a8a] text-sm mb-8"
              style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
            >
              Te contactaremos al <span className="text-[#c8c8c8] font-bold">{form.phone}</span>
            </p>
            <button
              onClick={handleReset}
              className="border border-[#c8c8c8]/20 text-[#5a5a5a] hover:border-[#c8c8c8]/40 hover:text-[#c8c8c8]
                px-8 py-3 text-xs tracking-[0.35em] uppercase transition-all"
              style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
            >
              Seguir comprando
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c8c8c8] text-black py-4 text-[10px] tracking-[0.4em] uppercase mt-1
                  hover:bg-[#d8d8d8] transition-all duration-200 active:scale-[0.99]
                  disabled:bg-white/15 disabled:cursor-not-allowed font-bold"
                style={{ fontFamily: 'var(--font-body, "Lato", sans-serif)' }}
              >
                {loading ? 'Procesando...' : 'Confirmar pedido'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
