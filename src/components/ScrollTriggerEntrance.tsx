import { useRef, useEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollTriggerEntranceProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  start?: string;
  y?: number;
  duration?: number;
}

export default function ScrollTriggerEntrance({
  children,
  className = '',
  stagger = 0.08,
  start = 'top 80%',
  y = 60,
  duration = 1.0,
}: ScrollTriggerEntranceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const elements = container.querySelectorAll('.stagger-item');
      const targets = elements.length > 0 ? elements : [container];

      gsap.fromTo(
        targets,
        { opacity: 0, y, skewY: 3 },
        {
          opacity: 1,
          y: 0,
          skewY: 0,
          duration,
          stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start,
            toggleActions: 'play none none none',
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [stagger, start, y, duration]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
