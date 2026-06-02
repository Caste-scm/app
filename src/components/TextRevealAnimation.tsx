import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealAnimationProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  start?: string;
}

export default function TextRevealAnimation({
  children,
  className = '',
  delay = 0,
  start = 'top 75%',
}: TextRevealAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const split = new SplitType(el, { types: 'words,chars' });
    const chars = split.chars;
    if (!chars || chars.length === 0) return;

    // Hide chars initially
    gsap.set(chars, { opacity: 0 });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        {
          scaleY: 1.4,
          scaleX: 0.8,
          opacity: 0,
        },
        {
          scaleY: 1,
          scaleX: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.04,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: 'play none none none',
          },
        }
      );
    }, el);

    return () => {
      ctx.revert();
      split.revert();
    };
  }, [delay, start]);

  return (
    <div ref={containerRef} className={className} style={{ perspective: '2000px' }}>
      {children}
    </div>
  );
}
