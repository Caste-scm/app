import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const NAV_ITEMS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
];

export default function NavigationBar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Entrance animation
    gsap.fromTo(
      nav,
      { yPercent: -100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.inOut', delay: 0.2 }
    );

    // Scroll-triggered background
    const trigger = ScrollTrigger.create({
      start: 'top -50',
      onUpdate: (self) => {
        setScrolled(self.progress > 0);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('/')) {
      window.location.href = href;
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] md:h-[72px] transition-all duration-300 ${scrolled
          ? 'bg-[rgba(250,250,250,0.92)] backdrop-blur-[12px] shadow-[0_1px_0_rgba(0,0,0,0.05)]'
          : 'bg-transparent'
        }`}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between page-padding">
        {/* Logo */}
        <a href="#" className="text-label text-charcoal-deep flex items-center gap-0">
          <span>LE</span>
          <span className="text-brand-turquoise">A</span>
          <span>P</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.href)}
              className="rounded-pill px-4 py-2 text-label text-body hover:bg-[rgba(45,212,191,0.1)] hover:text-charcoal-deep transition-all duration-200"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <button
            onClick={() => handleNavClick('/checkout')}
            className="rounded-pill bg-charcoal-deep text-white text-label px-6 py-2.5 hover:bg-charcoal transition-all duration-200"
          >
            Buy Now
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[rgba(250,250,250,0.98)] backdrop-blur-[12px] border-t border-silver px-5 py-6">
          <div className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="text-left text-body font-medium py-2 hover:text-brand-turquoise transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick('/checkout')}
              className="rounded-pill bg-charcoal-deep text-white text-label px-6 py-3 mt-2 w-full"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
