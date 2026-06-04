import { useState } from 'react';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import { Package, Search, ExternalLink } from 'lucide-react';

export default function TrackOrder() {
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !orderId) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/track-order?email=${encodeURIComponent(email)}&orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json();
      
      if (res.ok) {
        setResult(data.order);
      } else {
        setError(data.error || 'Order not found. Please check your details.');
      }
    } catch (err) {
      setError('An error occurred while tracking. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
      <NavigationBar />
      
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-silver shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-brand-turquoise/10 rounded-full flex items-center justify-center text-brand-turquoise">
              <Package size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-charcoal-deep mb-2">Track Your Order</h1>
          <p className="text-body text-center text-sm mb-8">
            Enter your email and order ID below to see the current status of your shipment.
          </p>

          <form onSubmit={handleTrack} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-deep uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="The email used at checkout"
                className="w-full border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-turquoise focus:ring-1 focus:ring-brand-turquoise"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal-deep uppercase tracking-wider mb-2">Order ID</label>
              <input 
                type="text" 
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="e.g. ord_123456789"
                className="w-full border border-silver rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-turquoise focus:ring-1 focus:ring-brand-turquoise"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-charcoal-deep text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-black transition-colors disabled:opacity-70"
            >
              <Search size={16} />
              {loading ? 'Searching...' : 'Track Now'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center animate-pop-in">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8 p-6 bg-[#FAFAFA] rounded-2xl border border-silver animate-pop-in">
              <h3 className="font-bold text-charcoal-deep mb-4 text-center">Order Status</h3>
              
              <div className="flex flex-col gap-4">
                 <div className="flex justify-between items-center pb-4 border-b border-silver">
                   <span className="text-sm text-body font-medium">Status:</span>
                   <span className={`text-xs px-3 py-1 rounded-full font-bold ${result.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                     {result.status === 'paid' ? 'In Preparation' : 'Pending Payment'}
                   </span>
                 </div>
                 
                 <div className="pt-2 flex flex-col gap-4">
                   <span className="text-sm text-body font-medium block">Carrier Tracking:</span>
                   {result.tracking_number ? (
                     <div className="flex flex-col gap-3">
                       <span className="font-mono bg-white border border-silver px-3 py-2 rounded-lg text-center tracking-wider font-bold">
                         {result.tracking_number}
                       </span>
                       <a 
                         href={`https://parcelsapp.com/en/tracking/${result.tracking_number}`}
                         target="_blank"
                         rel="noreferrer"
                         className="flex items-center justify-center gap-2 bg-brand-turquoise text-charcoal-deep px-4 py-3 rounded-xl font-bold text-sm hover:bg-brand-dark transition-colors"
                       >
                         View Delivery Map <ExternalLink size={14} />
                       </a>
                     </div>
                   ) : (
                     <p className="text-sm italic text-body bg-white border border-silver p-4 rounded-xl text-center">
                        We are currently preparing your package. The tracking number will appear here once it has been shipped.
                     </p>
                   )}
                 </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
