import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Effetto coriandoli per celebrare l'acquisto
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2dd4bf', '#0f172a', '#ffffff']
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center page-padding">
      <div className="max-w-[500px] w-full bg-white rounded-3xl p-10 border border-silver shadow-card text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[rgba(45,212,191,0.1)] flex items-center justify-center text-brand-turquoise">
            <CheckCircle size={48} />
          </div>
        </div>

        <h1 className="text-h2 mb-4">Grazie per l'ordine!</h1>
        <p className="text-body-large text-body mb-8">
          Il tuo pagamento è andato a buon fine. Stiamo già preparando la tua borraccia Leap per la spedizione.
        </p>

        <div className="bg-[#F8FAFC] rounded-2xl p-6 mb-8 flex items-center gap-4 text-left border border-silver">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <Package size={24} className="text-charcoal-deep" />
          </div>
          <div>
            <p className="text-sm font-bold text-charcoal-deep">Ordine Ricevuto</p>
            <p className="text-xs text-body">Riceverai una mail con il tracking a breve.</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="w-full rounded-pill bg-charcoal-deep text-white font-bold py-4 flex items-center justify-center gap-2 hover:bg-charcoal transition-all group"
        >
          Torna alla Home
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
