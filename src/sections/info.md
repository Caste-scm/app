import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollTriggerEntrance from '@/components/ScrollTriggerEntrance';
import TextRevealAnimation from '@/components/TextRevealAnimation';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    num: '01',
    title: 'Flip-Open Drinking Bowl',
    description:
      'The food-grade silicone top flips back in one motion to create an instant 5-inch drinking bowl. No separate parts, no setup — just flip and serve.',
    image: '/assets/new-feature-bowl-open.png',
    layout: 'left',
  },
  {
    num: '02',
    title: 'Stainless Steel Freshness',
    description:
      'Double-walled 304 stainless steel keeps water cool for up to 6 hours. The interior is electro-polished to prevent bacteria growth and eliminate metallic taste.',
    image: '/assets/bottle-lifestyle-kitchen.jpg',
    layout: 'right',
  },
  {
    num: '03',
    title: 'Adventure-Proof Design',
    description:
      'The braided paracord strap clips to any bag or leash. Leak-proof silicone seal means zero spills in your backpack. Weighs just 8oz when empty.',
    image: '/assets/new-feature-travel-strap.png',
    layout: 'left',
  },
];

export default function FeaturesGridSection() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards) return;

    const ctx = gsap.context(() => {
      const cardEls = cards.querySelectorAll('.feature-card');
      cardEls.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
            },
            delay: i * 0.15,
          }
        );
      });
    }, cards);

    return () => ctx.revert();
  }, []);

  return (
    <section id="features" className="w-full bg-[#CCFBF1] py-24 md:py-[100px] page-padding">
      {/* Section Header */}
      <ScrollTriggerEntrance className="text-center mb-16 md:mb-20">
        <p className="stagger-item text-label text-brand-turquoise tracking-[0.1em] mb-4">
          WHY IT WORKS
        </p>
        <TextRevealAnimation
          
          className="text-h2 text-charcoal-deep max-w-[600px] mx-auto"
        >
          Three reasons your dog will love it
        </TextRevealAnimation>
      </ScrollTriggerEntrance>

      {/* Feature Cards */}
      <div ref={cardsRef} className="mx-auto max-w-[1200px] flex flex-col items-center gap-6 md:gap-0">
        {FEATURES.map((feature, i) => (
          <div
            key={i}
            className={`feature-card w-full max-w-[900px] bg-surface border border-silver rounded-3xl p-8 md:p-12 md:-mt-5 first:mt-0 transition-shadow duration-300 hover:shadow-card-hover ${
              i % 2 === 0 ? '' : 'md:ml-16'
            } ${i === 1 ? 'md:mr-16 md:ml-auto' : ''}`}
          >
            <div
              className={`flex flex-col ${
                feature.layout === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'
              } items-center gap-8 md:gap-12`}
            >
              {/* Text */}
              <div className="flex-1">
                <span className="font-serif italic text-brand-turquoise text-[clamp(4rem,8vw,6rem)] leading-none">
                  {feature.num}
                </span>
                <h3 className="text-h3 text-charcoal-deep mt-2 mb-4">{feature.title}</h3>
                <p className="text-body text-body max-w-[360px]">{feature.description}</p>
              </div>

              {/* Image */}
              <div className="flex-shrink-0 w-[200px] h-[200px] md:w-[280px] md:h-[280px]">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
