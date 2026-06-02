import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollTriggerEntrance from '@/components/ScrollTriggerEntrance';
import TextRevealAnimation from '@/components/TextRevealAnimation';

gsap.registerPlugin(ScrollTrigger);

const USAGE_FEATURES = [
  {
    title: 'Hydration on the Go',
    description: "The unique flip-open silicone bowl creates an instant, wide drinking surface that perfectly matches your dog's natural drinking posture. No more pouring water into a separate bowl or cupping it in your hands.",
    image: '/assets/corgi-drinking-new.jpg',
    layout: 'left'
  },
  {
    title: 'Wearable Adventure',
    description: 'Designed to go wherever you and your dog wander. The durable braided paracord securely clips onto any standard harness or leash, keeping your hands entirely free while you explore the great outdoors.',
    image: '/assets/corgi-wearing-new.jpg',
    layout: 'right'
  }
];

export default function DogUsageSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const rows = container.querySelectorAll('.usage-row');
      rows.forEach((row) => {
        const imageBlock = row.querySelector('.usage-image');
        const textBlock = row.querySelector('.usage-text');

        gsap.fromTo(
          imageBlock,
          { opacity: 0, scale: 0.95, y: 40 },
          {
            opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: row, start: 'top 80%' }
          }
        );

        gsap.fromTo(
          textBlock,
          { opacity: 0, x: row.classList.contains('layout-right') ? -40 : 40 },
          {
            opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.2,
            scrollTrigger: { trigger: row, start: 'top 80%' }
          }
        );
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section id="usage" className="w-full bg-[#FFFFFF] py-24 md:py-[120px] page-padding overflow-hidden">
      <ScrollTriggerEntrance className="text-center mb-20 md:mb-32">
        <p className="stagger-item text-label text-brand-turquoise tracking-[0.1em] mb-4">
          IN ACTION
        </p>
        <TextRevealAnimation className="text-h2 text-charcoal-deep max-w-[800px] mx-auto">
          Built for dogs, designed for ease
        </TextRevealAnimation>
      </ScrollTriggerEntrance>

      <div ref={containerRef} className="mx-auto max-w-[1200px] flex flex-col gap-24 md:gap-32">
        {USAGE_FEATURES.map((feature, i) => (
          <div key={i} className={`usage-row flex flex-col gap-8 md:gap-16 items-center ${feature.layout === 'right' ? 'md:flex-row-reverse layout-right' : 'md:flex-row layout-left'}`}>
            <div className="usage-image w-full md:w-1/2 relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] group">
              <div className="aspect-[4/5] md:aspect-[3/4] w-full">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-&lsqb;1.5s&sqb; group-hover:scale-105"
                />
              </div>
            </div>

            <div className="usage-text w-full md:w-1/2 flex flex-col justify-center px-4 md:px-12">
              <div className="w-16 h-[2px] bg-brand-turquoise mb-8" />
              <h3 className="text-h3 text-charcoal-deep mb-6">{feature.title}</h3>
              <p className="text-body-large text-[rgba(15,15,15,0.7)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
