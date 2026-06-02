import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PillButton from '@/components/PillButton';

gsap.registerPlugin(ScrollTrigger);

export default function LifestyleCTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const content = contentRef.current;
    if (!section || !bg || !content) return;

    const ctx = gsap.context(() => {
      // Parallax background
      gsap.fromTo(
        bg,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      // Content entrance
      gsap.fromTo(
        content.querySelectorAll('.cta-animate'),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[100dvh] overflow-hidden flex items-center justify-center"
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0"
        style={{ transform: 'scale(1.2)' }}
      >
        <img
          src="/assets/lifestyle-hero.jpg"
          alt="Dog and owner hiking"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[rgba(15,15,15,0.3)] to-[rgba(15,15,15,0.6)]" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-[700px]"
      >
        <p className="cta-animate font-serif italic text-white text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.3] drop-shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
          &ldquo;Every adventure deserves a happy, hydrated companion.&rdquo;
        </p>
        <p className="cta-animate text-label text-[rgba(255,255,255,0.7)] mt-4">
          — The Leap Team
        </p>
        <div className="cta-animate mt-10">
          <PillButton variant="filled" size="lg" className="animate-pulse-glow" onClick={() => window.location.href = '/checkout'}>
            Start Your Adventure
          </PillButton>
        </div>
      </div>
    </section>
  );
}
