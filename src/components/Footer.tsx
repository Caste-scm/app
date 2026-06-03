import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

const QUICK_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Specifications', href: '#specs' },
  { label: 'Shipping', href: '#' },
  { label: 'FAQ', href: '#faq' },
];


export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubscribed(true);
      setEmail('');
    }
  };

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        footer.querySelectorAll('.footer-animate'),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 85%',
          },
        }
      );
    }, footer);

    return () => ctx.revert();
  }, []);

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer ref={footerRef} className="w-full bg-charcoal-deep pt-16 pb-8">
      <div className="mx-auto max-w-[1200px] page-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div className="footer-animate">
          <div className="footer-animate flex items-center gap-2 mb-3">
            <img src="/assets/logo.png" alt="LEAP Logo" className="h-7 w-7 object-contain" />
            <h3 className="text-[14px] font-bold tracking-[0.2em] text-white">LEAP</h3>
          </div>
            <p className="text-body text-[rgba(255,255,255,0.6)]">
              Innovative hydration for modern dogs.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-animate">
            <h4 className="text-label text-white mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-sm text-[rgba(255,255,255,0.6)] hover:text-brand-turquoise transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-animate">
            <h4 className="text-label text-white mb-4">Stay Updated</h4>
            {subscribed ? (
              <div className="bg-[#CCFBF1] text-brand-dark px-4 py-3 rounded-xl text-sm font-medium border border-[#99f6e4]">
                Grazie per l'iscrizione! Controlla la tua email.
              </div>
            ) : (
              <form className="flex" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 rounded-l-pill bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.2)] border-r-0 px-4 py-2.5 text-sm text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-brand-turquoise"
                />
                <button type="submit" className="rounded-r-pill bg-brand-turquoise text-charcoal-deep text-label px-5 py-2.5 hover:bg-brand-dark transition-colors">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
