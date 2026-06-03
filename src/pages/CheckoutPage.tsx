import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements, AddressElement } from '@stripe/react-stripe-js';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_123');

const BASE_PRICE = 15.99;

function getDiscount(totalQty: number): number {
  if (totalQty >= 4) return 0.25;
  if (totalQty === 3) return 0.20;
  if (totalQty === 2) return 0.15;
  return 0;
}

function getCartFromURL() {
  const params = new URLSearchParams(window.location.search);
  let qtyTurchese = Math.max(0, parseInt(params.get('turchese') || '0', 10));
  let qtyRosa = Math.max(0, parseInt(params.get('rosa') || '0', 10));
  // Fallback: se nessun parametro è presente, default a 1 Turchese
  if (qtyTurchese === 0 && qtyRosa === 0) qtyTurchese = 1;
  const totalQty = qtyTurchese + qtyRosa;
  const discount = getDiscount(totalQty);
  const subtotal = totalQty * BASE_PRICE;
  const totalAmount = subtotal * (1 - discount);
  return { qtyTurchese, qtyRosa, totalQty, discount, subtotal, totalAmount };
}

function CheckoutForm({ totalAmount }: { totalAmount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { qtyTurchese, qtyRosa } = getCartFromURL();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      console.error('Errore Stripe:', error);
      setMessage(error.message || 'An unexpected error occurred.');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      const addressElement = elements.getElement('address');
      let shippingData = null;
      if (addressElement) {
        const { value } = await addressElement.getValue();
        shippingData = {
          name: value.name,
          address: value.address
        };
      }

      const variantParts = [];
      if (qtyTurchese > 0) variantParts.push(`${qtyTurchese}x Turchese`);
      if (qtyRosa > 0) variantParts.push(`${qtyRosa}x Rosa Steel`);

      try {
        await fetch('/api/save-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            shipping: shippingData,
            variant: variantParts.join(' + ')
          })
        });
      } catch (err) {
        console.error('Failed to sync order to DB', err);
      }
      
      navigate('/checkout/success', { replace: true });
    }
    
    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="w-full max-w-md mx-auto mt-8">
      <div className="mb-8">
        <h3 className="text-sm font-bold text-charcoal-deep mb-4">Shipping & Billing Details</h3>
        <AddressElement options={{ 
          mode: 'shipping', 
          allowedCountries: ['IT'],
        }} />
      </div>
      
      <h3 className="text-sm font-bold text-charcoal-deep mb-4">Metodo di Pagamento</h3>
      <PaymentElement id="payment-element" />
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="mt-6 w-full rounded-pill bg-brand-turquoise text-charcoal-deep font-bold px-6 py-3 hover:bg-[#20b2a6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span id="button-text">
          {isLoading ? <div className="spinner">Processing...</div> : `Pay Now: €${totalAmount.toFixed(2)}`}
        </span>
      </button>
      {message && <div id="payment-message" className="mt-4 text-center text-sm font-medium text-red-500">{message}</div>}
    </form>
  );
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('');
  const [loadingContext, setLoadingContext] = useState(false);
  const navigate = useNavigate();

  const { qtyTurchese, qtyRosa, totalQty, discount, subtotal, totalAmount } = getCartFromURL();

  useEffect(() => {
    const createIntent = async () => {
      setLoadingContext(true);
      try {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            qtyTurchese, 
            qtyRosa,
            email: 'test@example.com' 
          }),
        });
        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          console.error('Server error:', data);
        }
      } catch (err) {
        console.error('Connection error:', err);
      } finally {
        setLoadingContext(false);
      }
    };
    createIntent();
  }, [qtyTurchese, qtyRosa]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col page-padding py-12">
      <button onClick={() => navigate(-1)} className="flex items-center text-body mb-8 hover:text-brand-turquoise transition-colors w-fit">
        <ArrowLeft className="mr-2" size={20} /> Go Back
      </button>

      <div className="flex-1 flex flex-col md:flex-row gap-12 max-w-[1000px] mx-auto w-full items-start">
        {/* Riepilogo Ordine */}
        <div className="w-full md:w-1/2 bg-white rounded-3xl p-8 border border-silver shadow-sm">
          <h2 className="text-h3 mb-6">Order Summary</h2>
          
          {/* Line items */}
          <div className="flex flex-col gap-4">
            {qtyTurchese > 0 && (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#CCFBF1] flex items-center justify-center p-1.5">
                  <img src="/assets/bottle-cutout.png" alt="Turchese" className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Leap Water Bottle</p>
                  <p className="text-xs text-brand-turquoise font-bold">Turchese × {qtyTurchese}</p>
                </div>
                <span className="font-semibold text-sm">€{(qtyTurchese * BASE_PRICE).toFixed(2)}</span>
              </div>
            )}

            {qtyRosa > 0 && (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#F9E8F4] flex items-center justify-center p-1.5">
                  <img src="/assets/bottle-rosa.jpg" alt="Rosa Steel" className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Leap Water Bottle</p>
                  <p className="text-xs text-[#BD7AA3] font-bold">Rosa Steel × {qtyRosa}</p>
                </div>
                <span className="font-semibold text-sm">€{(qtyRosa * BASE_PRICE).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-silver pt-6">
            <div className="flex justify-between mb-3 text-body text-sm">
              <span>Subtotal ({totalQty} {totalQty === 1 ? 'bottle' : 'bottles'})</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between mb-3 text-sm">
                <span className="text-brand-turquoise font-bold">Discount {(discount * 100).toFixed(0)}%</span>
                <span className="text-brand-turquoise font-bold">-€{(subtotal - totalAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between mb-3 text-body text-sm">
              <span>Shipping</span>
              <span className="text-brand-turquoise">Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-silver pt-4">
              <span>Total</span>
              <span>€{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Form Pagamento */}
        <div className="w-full md:w-1/2">
          <h2 className="text-h3 mb-6">Secure Payment</h2>
          
          {!clientSecret ? (
            <div className="text-center py-10 text-body">
              {loadingContext ? 'Initializing secure payment...' : 'Error loading payment gateway.'}
            </div>
          ) : (
              <Elements 
                options={{ 
                  clientSecret, 
                  appearance: { theme: 'stripe' },
                }} 
                stripe={stripePromise}
              >
                <div className="mb-6 bg-white p-4 rounded-xl border border-silver">
                  <p className="text-sm text-body mb-4">Shipping Information</p>
                  <CheckoutForm totalAmount={totalAmount} />
                </div>
              </Elements>
          )}

          <div className="mt-8 flex justify-center items-center gap-2 opacity-50">
            <span className="text-[10px] text-body">Guaranteed Safe & Secure Checkout by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
