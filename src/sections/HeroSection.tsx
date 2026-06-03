import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router';
import { ChevronDown, Play, Droplets, Lock, Leaf, Plus, Minus } from 'lucide-react';
import PillButton from '@/components/PillButton';
import TextRevealAnimation from '@/components/TextRevealAnimation';
import VideoModal from '@/components/VideoModal';

gsap.registerPlugin(ScrollTrigger);

const INFO_CARDS = [
  {
    icon: Droplets,
    title: 'Flip-Open Bowl',
    desc: 'Silicone top flips back instantly',
  },
  {
    icon: Lock,
    title: 'Leak-Proof Design',
    desc: 'Sealed stainless steel base',
  },
  {
    icon: Leaf,
    title: 'BPA-Free Materials',
    desc: 'Food-grade silicone & steel',
  },
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeColor, setActiveColor] = useState('Turchese');
  const [qtyTurchese, setQtyTurchese] = useState(1);
  const [qtyRosa, setQtyRosa] = useState(0);
  const navigate = useNavigate();

  const totalQty = qtyTurchese + qtyRosa;
  let discount = 0;
  if (totalQty === 2) discount = 0.15;
  else if (totalQty === 3) discount = 0.20;
  else if (totalQty >= 4) discount = 0.25;

  const basePrice = 15.99;
  const totalAmount = totalQty * basePrice * (1 - discount);

  // Persist quantities to localStorage for the NavigationBar to pick up
  useEffect(() => {
    localStorage.setItem('leap_cart', JSON.stringify({ qtyTurchese, qtyRosa }));
  }, [qtyTurchese, qtyRosa]);

  const handleShopNow = () => {
    if (totalQty === 0) return;
    window.location.href = `/checkout?turchese=${qtyTurchese}&rosa=${qtyRosa}`;
  };

  useEffect(() => {
    const section = sectionRef.current;
    const product = productRef.current;
    const scrollIndicator = scrollIndicatorRef.current;
    const cards = cardsRef.current;
    if (!section || !product || !scrollIndicator || !cards) return;

    const ctx = gsap.context(() => {
      // Product float animation
      gsap.to(product.querySelector('.product-image'), {
        y: -8,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // Scroll indicator fade out
      gsap.to(scrollIndicator, {
        opacity: 0,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100',
          scrub: true,
        },
      });

      // Info cards slide in
      const cardEls = cards.querySelectorAll('.info-card');
      gsap.fromTo(
        cardEls,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=60%',
            scrub: false,
            toggleActions: 'play none none reset',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative w-full min-h-[100dvh] bg-[#FAFAFA] overflow-hidden"
    >
      {/* Text Layer */}
      <div className="relative z-10 flex flex-col items-center pt-[15vh] px-4">
        {/* Badge */}
        <div className="stagger-item mb-6 inline-flex items-center gap-2 rounded-pill border border-brand-turquoise bg-[rgba(45,212,191,0.15)] px-4 py-1.5 text-label text-charcoal-deep">
          <Droplets size={14} className="text-brand-turquoise" />
          NEW 2025 DESIGN
        </div>

        {/* Title */}
        <TextRevealAnimation

          className="text-display text-charcoal-deep text-center"
        >
          HYDRATION
        </TextRevealAnimation>
        <TextRevealAnimation

          className="text-display text-center"
          delay={0.15}
        >
          <span className="text-charcoal-deep">ON THE </span>
          <span className="text-brand-turquoise">GO</span>
        </TextRevealAnimation>

        {/* Subtitle */}
        <p className="mt-6 max-w-[520px] text-center text-body-large text-body">
          The world&apos;s first spherical dog water bottle. Premium stainless steel meets
          food-grade silicone for instant hydration anywhere.
        </p>

        {/* Selection Area */}
        <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-sm">
          {/* Color Preview Selectors */}
          <div className="flex justify-center gap-4 w-full">
            <button 
              onClick={() => setActiveColor('Turchese')}
              className={`flex-1 group flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${activeColor === 'Turchese' ? 'border-brand-turquoise bg-[#f0fdfa]' : 'border-silver bg-white hover:border-gray-300'}`}
            >
              <div className="w-4 h-4 rounded-full bg-brand-turquoise shadow-sm" />
              <span className={`text-xs font-bold uppercase tracking-wider ${activeColor === 'Turchese' ? 'text-charcoal-deep' : 'text-body'}`}>Turchese</span>
            </button>
            <button 
              onClick={() => setActiveColor('Rosa')}
              className={`flex-1 group flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${activeColor === 'Rosa' ? 'border-[#E5B6D6] bg-[#F9E8F4]' : 'border-silver bg-white hover:border-gray-300'}`}
            >
              <div className="w-4 h-4 rounded-full bg-[#E5B6D6] shadow-sm" />
              <span className={`text-xs font-bold uppercase tracking-wider ${activeColor === 'Rosa' ? 'text-charcoal-deep' : 'text-body'}`}>Rosa Steel</span>
            </button>
          </div>

          {/* Quantity Selectors */}
          <div className="flex flex-col gap-3 w-full bg-white p-4 rounded-2xl border border-silver shadow-sm">
            <p className="text-[10px] uppercase tracking-widest font-bold text-body text-center mb-1">Componi il tuo Ordine</p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-charcoal-deep flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-brand-turquoise" />
                 Turchese
              </span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQtyTurchese(Math.max(0, qtyTurchese - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal-deep transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-4 text-center font-bold text-lg">{qtyTurchese}</span>
                <button 
                  onClick={() => setQtyTurchese(qtyTurchese + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(45,212,191,0.2)] hover:bg-[rgba(45,212,191,0.4)] text-brand-dark transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-charcoal-deep flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#E5B6D6]" />
                 Rosa Steel
              </span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQtyRosa(Math.max(0, qtyRosa - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal-deep transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-4 text-center font-bold text-lg">{qtyRosa}</span>
                <button 
                  onClick={() => setQtyRosa(qtyRosa + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F9E8F4] hover:bg-[#ebd0e8] text-[#975881] transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Discount Banner */}
            {discount > 0 && (
              <div className="mt-2 bg-brand-turquoise/10 border border-brand-turquoise/30 rounded-xl p-2 text-center">
                <span className="text-brand-dark font-bold text-xs">SCONTO {(discount * 100).toFixed(0)}% APPLICATO</span>
              </div>
            )}
            {totalQty === 1 && (
              <div className="mt-2 bg-gray-50 border border-gray-100 rounded-xl p-2 text-center">
                <span className="text-gray-500 font-medium text-[10px] uppercase">Aggiungi 1 per il 15% di sconto</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA Row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <PillButton variant="filled" size="md" onClick={handleShopNow} className={totalQty === 0 ? "opacity-50 cursor-not-allowed" : ""}>
            {totalQty === 0 ? 'Seleziona Quantità' : `Acquista Ora - €${totalAmount.toFixed(2)}`}
          </PillButton>
          <PillButton
            variant="outlined"
            size="md"
            className="flex items-center gap-2"
            onClick={() => setIsVideoOpen(true)}
          >
            <Play size={12} fill="currentColor" />
            Watch Video
          </PillButton>
        </div>
      </div>

      {/* Product Image Area */}
      <div
        ref={productRef}
        className="relative z-10 flex justify-center mt-12 md:mt-16 px-4"
      >
        <div className="product-image relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px]">
          <img
            src={activeColor === 'Rosa' ? '/assets/bottle-rosa.jpg' : '/assets/bottle-cutout.png'}
            alt="Leap Spherical Dog Water Bottle"
            className="w-full h-full object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500"
          />
        </div>
      </div>

      {/* Info Cards */}
      <div
        ref={cardsRef}
        className="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row justify-center items-center gap-6 mt-8 md:mt-4 px-4 pb-12"
      >
        {INFO_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="info-card flex items-center gap-4 w-[280px] rounded-2xl bg-[rgba(250,250,250,0.8)] backdrop-blur-[12px] border border-silver px-5 py-4 shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[rgba(45,212,191,0.1)] border border-brand-turquoise flex items-center justify-center">
                <Icon size={16} className="text-brand-turquoise" />
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal-deep">{card.title}</p>
                <p className="text-xs text-body">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <ChevronDown
          size={20}
          className="text-body animate-bounce opacity-40"
        />
        <span className="font-mono text-[12px] text-body opacity-30">Scroll to explore</span>
      </div>
      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        src="/assets/Video.mp4"
      />
    </section>
  );
}
