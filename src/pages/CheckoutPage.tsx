import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../contexts/OrdersContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../lib/utils';
import type { OrderItem } from '../types';

export function CheckoutPage() {
  const { state, clearCart, totalAmount } = useCart();
  const { addOrder } = useOrders();
  const { user } = useAuth();

  // Address State (prefilled from user profile if available)
  const [street, setStreet] = useState(user?.addressDetails?.street || '');
  const [city, setCity] = useState(user?.addressDetails?.city || '');
  const [stateRegion, setStateRegion] = useState(user?.addressDetails?.stateRegion || '');
  const [zip, setZip] = useState(user?.addressDetails?.zip || '');
  const [country, setCountry] = useState(user?.addressDetails?.country || '');
  const [phone, setPhone] = useState(user?.addressDetails?.phone || '');

  
  useEffect(() => {
    if (user?.addressDetails) {
      setStreet(user.addressDetails.street || '');
      setCity(user.addressDetails.city || '');
      setStateRegion(user.addressDetails.stateRegion || '');
      setZip(user.addressDetails.zip || '');
      setCountry(user.addressDetails.country || '');
      setPhone(user.addressDetails.phone || '');
    }
  }, [user]);

  // Payment State (Simulated)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const fullAddress = `${street}, ${city}, ${stateRegion} ${zip}, ${country}. Tel: ${phone}`;
  
  const isAddressValid = street.trim().length > 0 && city.trim().length > 0 && phone.trim().length > 0 && country.trim().length > 0;
  const isPaymentValid = cardNumber.trim().length >= 15 && cardName.trim().length > 0 && cardExpiry.trim().length >= 4 && cardCvv.trim().length >= 3;
  const canSubmit = state.items.length > 0 && isAddressValid && isPaymentValid && !processing;

  const handleCheckout = async () => {
    if (!canSubmit || !user) return;

    setProcessing(true);

    // Simulate payment processing delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const orderItems: OrderItem[] = state.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    await addOrder(orderItems, totalAmount, fullAddress, user.uid);
    setProcessing(false);
    setDone(true);
    clearCart();
  };

  if (processing) {
    return (
      <div
        className="animate-in"
        style={{
          maxWidth: 500,
          margin: '3rem auto',
          textAlign: 'center',
        }}
      >
        <div className="card card-xl" style={{ padding: '4rem 2rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem auto', width: '3rem', height: '3rem', borderTopColor: 'var(--primary)' }}></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
            Su pago está siendo procesado...
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Por favor no cierre esta ventana, estamos validando la transacción con su banco.
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div
        className="animate-in"
        style={{
          maxWidth: 500,
          margin: '3rem auto',
          textAlign: 'center',
        }}
      >
        <div className="card card-xl" style={{ padding: '3rem 2rem' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--success)',
              letterSpacing: '-0.03em',
              marginBottom: '0.75rem',
            }}
          >
            ¡Pago exitoso!
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Su transacción fue aprobada. La orden ha sido registrada y su estado actual es <strong style={{color: 'var(--warning)'}}>Pendiente</strong> de envío.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/orders" className="btn btn-primary btn-lg">
              Ver mis órdenes
            </Link>
            <Link to="/" className="btn btn-ghost btn-lg">
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Confirma tu pedido y dirección de entrega</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr minmax(0, 360px)',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Forms Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Shipping form */}
          <div className="card card-lg" style={{ padding: '2rem' }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              1. Dirección de envío
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Calle y Número</label>
                <input
                  className="input"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ej. Av. Reforma 123, Int. 4"
                />
              </div>
              
              <div className="form-group">
                <label className="label">Ciudad</label>
                <input
                  className="input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej. Ciudad de México"
                />
              </div>
              
              <div className="form-group">
                <label className="label">Estado / Provincia</label>
                <input
                  className="input"
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  placeholder="Ej. CDMX"
                />
              </div>
              
              <div className="form-group">
                <label className="label">Código Postal</label>
                <input
                  className="input"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="Ej. 06000"
                />
              </div>
              
              <div className="form-group">
                <label className="label">País</label>
                <input
                  className="input"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Ej. México"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Teléfono de contacto</label>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. +52 55 1234 5678"
                  type="tel"
                />
              </div>
            </div>
          </div>

          {/* Payment form */}
          <div className="card card-lg" style={{ padding: '2rem' }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              2. Método de Pago (Simulación)
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Nombre en la tarjeta</label>
                <input
                  className="input"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Número de tarjeta</label>
                <input
                  className="input"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                  placeholder="Ej. 4111 1111 1111 1111"
                  type="text"
                />
              </div>
              
              <div className="form-group">
                <label className="label">Fecha de vencimiento</label>
                <input
                  className="input"
                  value={cardExpiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                    if (val.length >= 3) {
                      val = val.substring(0, 2) + '/' + val.substring(2, 4);
                    }
                    setCardExpiry(val);
                  }}
                  placeholder="MM/AA"
                />
              </div>
              
              <div className="form-group">
                <label className="label">CVV</label>
                <input
                  className="input"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                  placeholder="Ej. 123"
                  type="password"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Order summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '2rem' }}>
          <div className="card card-lg" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '1rem', fontSize: '1.1rem' }}>
              Resumen del pedido
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {state.items.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>
                    {item.name}{' '}
                    <span style={{ color: 'var(--text-subtle)' }}>×{item.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text)', flexShrink: 0 }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <hr className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>Total a Pagar</span>
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: 'var(--text)',
                  letterSpacing: '-0.03em',
                }}
              >
                {formatPrice(totalAmount)}
              </span>
            </div>
            <button
              className="btn btn-primary btn-lg btn-block"
              style={{ marginTop: '1.5rem', borderRadius: 'var(--radius-sm)' }}
              onClick={handleCheckout}
              disabled={!canSubmit}
            >
              {canSubmit ? 'Pagar y confirmar' : 'Completa todos los campos'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

