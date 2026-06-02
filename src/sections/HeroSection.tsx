import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router';
import { ChevronDown, Play, Droplets, Lock, Leaf } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(1);
  const [bundleMix, setBundleMix] = useState('both-turchese');
  const navigate = useNavigate();

  const handleShopNow = () => {
    const colorParam = quantity === 2 ? bundleMix : activeColor;
    window.location.href = `/checkout?color=${colorParam}&qty=${quantity}`;
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
          {/* Color Selectors */}
          <div className="flex justify-center gap-4 w-full">
            <button 
              onClick={() => setActiveColor('Turchese')}
              className={`flex-1 group flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${activeColor === 'Turchese' ? 'border-brand-turquoise bg-[#f0fdfa]' : 'border-silver bg-white hover:border-gray-300'}`}
            >
              <div className="w-5 h-5 rounded-full bg-brand-turquoise shadow-sm" />
              <span className={`text-sm font-bold uppercase tracking-wider ${activeColor === 'Turchese' ? 'text-charcoal-deep' : 'text-body'}`}>Turchese</span>
            </button>
            <button 
              onClick={() => {
                setActiveColor('Rosa');
                if (quantity === 2) setBundleMix('both-rosa');
              }}
              className={`flex-1 group flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${activeColor === 'Rosa' ? 'border-[#E5B6D6] bg-[#F9E8F4]' : 'border-silver bg-white hover:border-gray-300'}`}
            >
              <div className="w-5 h-5 rounded-full bg-[#E5B6D6] shadow-sm" />
              <span className={`text-sm font-bold uppercase tracking-wider ${activeColor === 'Rosa' ? 'text-charcoal-deep' : 'text-body'}`}>Rosa Steel</span>
            </button>
          </div>

          {/* Quantity Selectors */}
          <div className="flex gap-4 w-full">
            <button 
              onClick={() => setQuantity(1)}
              className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${quantity === 1 ? 'border-brand-turquoise bg-[#f0fdfa]' : 'border-silver bg-white hover:border-gray-300'}`}
            >
              <span className={`text-sm font-bold ${quantity === 1 ? 'text-charcoal-deep' : 'text-body'}`}>1 Bottiglia</span>
              <span className={`text-xs ${quantity === 1 ? 'text-charcoal-deep' : 'text-body'}`}>€15.99</span>
            </button>
            <button 
              onClick={() => {
                setQuantity(2);
                setBundleMix(activeColor === 'Turchese' ? 'both-turchese' : 'both-rosa');
              }}
              className={`flex-1 relative flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${quantity === 2 ? 'border-brand-turquoise bg-[#f0fdfa]' : 'border-silver bg-white hover:border-gray-300'}`}
            >
              <div className="absolute -top-3 bg-brand-turquoise text-charcoal-deep text-[10px] font-bold px-2 py-0.5 rounded-full">SCONTO 12%</div>
              <span className={`text-sm font-bold ${quantity === 2 ? 'text-charcoal-deep' : 'text-body'}`}>2 Bottiglie</span>
              <span className={`text-xs font-bold ${quantity === 2 ? 'text-charcoal-deep text-brand-turquoise' : 'text-body'}`}>€28.00</span>
            </button>
          </div>

          {/* Bundle Mix Selection - Only visible when quantity 2 is selected */}
          {quantity === 2 && (
            <div className="w-full animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-[10px] uppercase tracking-widest font-bold text-body mb-3 text-center">Scegli la combinazione:</p>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setBundleMix('both-turchese')}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${bundleMix === 'both-turchese' ? 'border-brand-turquoise bg-[#f0fdfa]' : 'border-silver bg-white'}`}
                >
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-brand-turquoise border border-white" />
                    <div className="w-4 h-4 rounded-full bg-brand-turquoise border border-white" />
                  </div>
                  <span className="text-[9px] font-bold leading-tight uppercase">2 Azzurre</span>
                </button>
                <button 
                  onClick={() => setBundleMix('both-rosa')}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${bundleMix === 'both-rosa' ? 'border-[#E5B6D6] bg-[#F9E8F4]' : 'border-silver bg-white'}`}
                >
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-[#E5B6D6] border border-white" />
                    <div className="w-4 h-4 rounded-full bg-[#E5B6D6] border border-white" />
                  </div>
                  <span className="text-[9px] font-bold leading-tight uppercase">2 Rosa</span>
                </button>
                <button 
                  onClick={() => setBundleMix('one-each')}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${bundleMix === 'one-each' ? 'border-charcoal-deep bg-gray-50' : 'border-silver bg-white'}`}
                >
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-brand-turquoise border border-white" />
                    <div className="w-4 h-4 rounded-full bg-[#E5B6D6] border border-white" />
                  </div>
                  <span className="text-[9px] font-bold leading-tight uppercase">1 e 1</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CTA Row */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <PillButton variant="filled" size="md" onClick={handleShopNow}>
            Acquista Ora - €{quantity === 2 ? '28.00' : '15.99'}
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
