import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements, AddressElement } from '@stripe/react-stripe-js';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

// Make sure to call loadStripe outside of a component's render to avoid recreating the Stripe object on every render.
// We use a fallback key to prevent crashes while the .env is empty.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_123');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const variant = searchParams.get('color') || 'Turchese';
  const quantity = parseInt(searchParams.get('qty') || '1', 10);
  const totalAmount = quantity === 2 ? 28.00 : 15.99;

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
      // Recuperiamo l'indirizzo inserito nel form prima di salvare nel DB
      const addressElement = elements.getElement('address');
      let shippingData = null;
      if (addressElement) {
        const { value } = await addressElement.getValue();
        shippingData = {
          name: value.name,
          address: value.address
        };
      }

      // Salviamo l'ordine istantaneamente nel nostro DB
      try {
        await fetch('/api/save-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            shipping: shippingData,
            variant: quantity === 2 ? `${variant} (x2)` : variant
          })
        });
      } catch (err) {
        console.error('Failed to sync order to DB', err);
      }
      
      // Navighiamo subito senza ricaricare la pagina per evitare lag
      navigate('/checkout/success', { replace: true });
    }
    
    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="w-full max-w-md mx-auto mt-8">
      <div className="mb-8">
        <h3 className="text-sm font-bold text-charcoal-deep mb-4">Dati di Consegna e Fatturazione</h3>
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
          {isLoading ? <div className="spinner">Elaborazione...</div> : `Paga ora: €${totalAmount.toFixed(2)}`}
        </span>
      </button>
      {message && <div id="payment-message" className="mt-4 text-center text-sm font-medium text-red-500">{message}</div>}
    </form>
  );
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('');
  const [email] = useState(''); // Removed setEmail as it is hardcoded for test for now
  const [loadingContext, setLoadingContext] = useState(false);
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const variant = searchParams.get('color') || 'Turchese';
  const quantity = parseInt(searchParams.get('qty') || '1', 10);
  const totalAmount = quantity === 2 ? 28.00 : 15.99;

  useEffect(() => {
    // In un progetto reale, crei il payment intent quando entri in questa pagina
    const createIntent = async () => {
      setLoadingContext(true);
      try {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ id: 'leap', quantity }], email: email || 'test@example.com' }),
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
  }, [email]);

  const isRosa = variant === 'Rosa' || variant === 'both-rosa';
  const isMix = variant === 'one-each';
  
  const getVariantLabel = () => {
    if (variant === 'both-turchese') return '2x Turchese';
    if (variant === 'both-rosa') return '2x Rosa Steel';
    if (variant === 'one-each') return '1 Turchese + 1 Rosa Steel';
    if (variant === 'Rosa') return 'Rosa Steel';
    return 'Turchese';
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col page-padding py-12">
      <button onClick={() => navigate(-1)} className="flex items-center text-body mb-8 hover:text-brand-turquoise transition-colors w-fit">
        <ArrowLeft className="mr-2" size={20} /> Torna indietro
      </button>

      <div className="flex-1 flex flex-col md:flex-row gap-12 max-w-[1000px] mx-auto w-full items-start">
        {/* Riepilogo Ordine */}
        <div className="w-full md:w-1/2 bg-white rounded-3xl p-8 border border-silver shadow-sm">
          <h2 className="text-h3 mb-6">Riepilogo Ordine</h2>
          <div className="flex gap-4 items-center">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center p-2 ${isRosa ? 'bg-[#F9E8F4]' : isMix ? 'bg-gray-100' : 'bg-[#CCFBF1]'}`}>
              <div className="relative w-full h-full">
                {isMix ? (
                  <div className="flex -space-x-4 h-full w-full items-center justify-center">
                    <img src="/assets/bottle-cutout.png" className="w-2/3 h-2/3 object-contain drop-shadow-md z-10" />
                    <img src="/assets/bottle-rosa.jpg" className="w-2/3 h-2/3 object-contain drop-shadow-md" />
                  </div>
                ) : (
                  <img 
                    src={isRosa ? '/assets/bottle-rosa.jpg' : '/assets/bottle-cutout.png'} 
                    alt="Leap Dog Water Bottle" 
                    className="w-full h-full object-contain drop-shadow-md" 
                  />
                )}
              </div>
            </div>
            <div>
              <p className="font-bold text-lg">Leap Water Bottle {quantity === 2 ? '(Bundle 2)' : ''}</p>
              <p className="text-body text-sm font-bold">Variante: <span className={isRosa ? 'text-[#BD7AA3]' : isMix ? 'text-charcoal-deep' : 'text-brand-turquoise'}>{getVariantLabel()}</span></p>
            </div>
            <div className="ml-auto flex flex-col items-end">
              {quantity === 2 && <span className="text-xs text-body line-through">€31.98</span>}
              <span className="font-serif italic text-xl">€{totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-8 border-t border-silver pt-6">
            <div className="flex justify-between mb-4 text-body text-sm"><span>Subtotale {quantity === 2 && '(Sconto 12%)'}</span><span>€{totalAmount.toFixed(2)}</span></div>
            <div className="flex justify-between mb-4 text-body text-sm"><span>Spedizione</span><span className="text-brand-turquoise">Gratuita</span></div>
            <div className="flex justify-between font-bold text-lg border-t border-silver pt-4"><span>Totale</span><span>€{totalAmount.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Form Pagamento */}
        <div className="w-full md:w-1/2">
          <h2 className="text-h3 mb-6">Pagamento Sicuro</h2>
          
          {!clientSecret ? (
            <div className="text-center py-10 text-body">
              {loadingContext ? 'Inizializzazione pagamento sicuro...' : 'Errore nel caricamento del gateway di pagamento.'}
            </div>
          ) : (
              <Elements 
                options={{ 
                  clientSecret, 
                  appearance: { theme: 'stripe' },
                  // Chiediamo l'indirizzo di spedizione direttamente a Stripe
                }} 
                stripe={stripePromise}
              >
                <div className="mb-6 bg-white p-4 rounded-xl border border-silver">
                  <p className="text-sm text-body mb-4">Informazioni di Spedizione</p>
                  <CheckoutForm />
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
