import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import ScrollTriggerEntrance from '@/components/ScrollTriggerEntrance';
import TextRevealAnimation from '@/components/TextRevealAnimation';

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    dog: 'Owner of Milo, a Labrador',
    image: '/assets/customer-sarah.jpg',
    review:
      'We hike every weekend and this bottle is a game changer. Milo used to struggle with collapsible bowls — this is so much easier.',
    rating: 5,
  },
  {
    name: 'James T.',
    dog: 'Owner of Luna, a Border Collie',
    image: '/assets/customer-james.jpg',
    review:
      'Best purchase for our trail runs. The paracord strap clips right to my running belt. Zero leaks, even when bouncing around.',
    rating: 5,
  },
  {
    name: 'Emma R.',
    dog: 'Owner of Biscuit, a French Bulldog',
    image: '/assets/customer-emma.jpg',
    review:
      'So compact and cute! I keep it in my tote bag for park visits. The silicone bowl is the perfect size for Biscuit.',
    rating: 5,
  },
  {
    name: 'David K.',
    dog: 'Owner of Atlas, a Vizsla',
    image: '/assets/customer-david.jpg',
    review:
      'The stainless steel keeps water cold for hours on the beach. Atlas drinks way more now, which makes me a happy owner.',
    rating: 5,
  },
  {
    name: 'Lisa P.',
    dog: 'Owner of Kodiak, a Husky',
    image: '/assets/customer-lisa.jpg',
    review:
      'Took this camping last month and it was perfect. Easy to fill, easy to clean, and Kodiak loves the wide bowl.',
    rating: 5,
  },
  {
    name: 'Alex C.',
    dog: 'Owner of Waffles, a Corgi',
    image: '/assets/customer-alex.jpg',
    review:
      'I walk Waffles twice a day and this bottle is always clipped to my bag. Stylish design gets compliments all the time.',
    rating: 5,
  },
  {
    name: 'Maya S.',
    dog: 'Owner of River, an Australian Shepherd',
    image: '/assets/customer-maya.jpg',
    review:
      "We paddleboard together and I clip this to the board's D-ring. River stays hydrated even on long water adventures!",
    rating: 5,
  },
  {
    name: 'Tom B.',
    dog: 'Owner of Cooper, a Beagle',
    image: '/assets/customer-tom.jpg',
    review:
      'Road trips with Cooper are so much better now. Fits in my cup holder and the flip bowl means no extra accessories.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, TESTIMONIALS.length - 1));
    setActiveIndex(clamped);
    if (trackRef.current) {
      const cardWidth = trackRef.current.children[0]?.clientWidth || 320;
      const gap = 24;
      trackRef.current.scrollTo({
        left: clamped * (cardWidth + gap),
        behavior: 'smooth',
      });
    }
  };

  const handlePrev = () => scrollTo(activeIndex - 1);
  const handleNext = () => scrollTo(activeIndex + 1);

  // Touch/drag support
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    scrollStartX.current = trackRef.current?.scrollLeft || 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !trackRef.current) return;
    const dx = e.clientX - dragStartX.current;
    trackRef.current.scrollLeft = scrollStartX.current - dx;
  };

  const handlePointerUp = () => {
    if (!isDragging || !trackRef.current) return;
    setIsDragging(false);
    const cardWidth = trackRef.current.children[0]?.clientWidth || 320;
    const gap = 24;
    const newIndex = Math.round(trackRef.current.scrollLeft / (cardWidth + gap));
    scrollTo(newIndex);
  };

  // Update active index on scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      const cardWidth = track.children[0]?.clientWidth || 320;
      const gap = 24;
      const newIndex = Math.round(track.scrollLeft / (cardWidth + gap));
      setActiveIndex(Math.max(0, Math.min(newIndex, TESTIMONIALS.length - 1)));
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="reviews" className="w-full bg-[#FAFAFA] py-24 md:py-[100px] overflow-hidden">
      {/* Section Header */}
      <ScrollTriggerEntrance className="text-center mb-14 md:mb-16 page-padding">
        <p className="stagger-item text-label text-brand-turquoise mb-4">
          HAPPY DOGS, HAPPY OWNERS
        </p>
        <TextRevealAnimation

          className="text-h2 text-charcoal-deep max-w-[700px] mx-auto"
        >
          Join 10,000+ pet parents who made the switch
        </TextRevealAnimation>
      </ScrollTriggerEntrance>

      {/* Carousel */}
      <div className="relative">
        {/* Track */}
        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-[max(20px,5vw)] pb-4 cursor-grab active:cursor-grabbing snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {TESTIMONIALS.map((t, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={i}
                className={`flex-shrink-0 w-[300px] md:w-[340px] snap-center rounded-2xl border border-silver bg-surface p-6 transition-all duration-500 select-none ${isActive ? 'scale-100 opacity-100 shadow-card' : 'scale-95 opacity-60'
                  }`}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover"
                    draggable={false}
                  />
                  <div>
                    <h4 className="text-base font-bold text-charcoal-deep">{t.name}</h4>
                    <p className="text-xs text-body">{t.dog}</p>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star
                      key={si}
                      size={16}
                      fill="#D4A574"
                      className="text-gold"
                    />
                  ))}
                </div>

                {/* Review */}
                <p className="text-sm text-body leading-relaxed line-clamp-4">
                  &ldquo;{t.review}&rdquo;
                </p>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows - desktop only */}
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[rgba(15,15,15,0.05)] border border-silver items-center justify-center hover:bg-brand-turquoise transition-colors z-10"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[rgba(15,15,15,0.05)] border border-silver items-center justify-center hover:bg-brand-turquoise transition-colors z-10"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-brand-turquoise w-6' : 'bg-silver'
              }`}
          />
        ))}
      </div>
    </section>
  );
}
