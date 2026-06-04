import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay to ensure it pops up after initial render smoothly
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'all');
    setIsVisible(false);
  };

  const handleEssential = () => {
    localStorage.setItem('cookie_consent', 'essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] p-4 md:p-6 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-4xl bg-[rgba(255,255,255,0.85)] backdrop-blur-xl border border-silver rounded-2xl p-5 md:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.1)] animate-modalSlideUp flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h3 className="font-bold text-charcoal-deep mb-2 flex items-center gap-2">
            Ops... I Cookies 🍪
          </h3>
          <p className="text-sm text-body leading-relaxed">
            We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies ensuring the website works flawlessly.
            <a href="/cookie-policy" className="text-brand-turquoise font-medium hover:underline ml-1 text-nowrap">Read our policy.</a>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 min-w-[280px]">
          <button 
            onClick={handleEssential}
            className="flex-1 px-4 py-2.5 rounded-xl border border-charcoal-deep text-charcoal-deep text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Essential Only
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-turquoise text-charcoal-deep text-xs font-bold uppercase tracking-wider hover:bg-brand-dark transition-colors whitespace-nowrap shadow-sm"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
