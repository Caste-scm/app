import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Instagram, Facebook } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const QUICK_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Specifications', href: '#specs' },
  { label: 'Shipping', href: '#' },
  { label: 'FAQ', href: '#faq' },
];

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

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
            <h3 className="text-h3 text-white mb-3 flex items-center gap-0">
              <span>LE</span>
              <span className="text-brand-turquoise">A</span>
              <span>P</span>
            </h3>
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
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-l-pill bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.2)] border-r-0 px-4 py-2.5 text-sm text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-brand-turquoise"
              />
              <button className="rounded-r-pill bg-brand-turquoise text-charcoal-deep text-label px-5 py-2.5 hover:bg-brand-dark transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-animate mt-10 pt-6 border-t border-[rgba(255,255,255,0.1)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono text-[rgba(255,255,255,0.4)]">
            2025 Leap Pet Essentials. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button className="text-[rgba(255,255,255,0.4)] hover:text-brand-turquoise transition-colors">
              <Instagram size={20} />
            </button>
            <button className="text-[rgba(255,255,255,0.4)] hover:text-brand-turquoise transition-colors">
              <TikTokIcon size={20} />
            </button>
            <button className="text-[rgba(255,255,255,0.4)] hover:text-brand-turquoise transition-colors">
              <Facebook size={20} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
