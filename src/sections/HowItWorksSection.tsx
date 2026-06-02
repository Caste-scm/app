import { Droplets, RotateCcw, PawPrint } from 'lucide-react';
import ScrollTriggerEntrance from '@/components/ScrollTriggerEntrance';
import TextRevealAnimation from '@/components/TextRevealAnimation';

const STEPS = [
  {
    icon: Droplets,
    num: '01',
    title: 'Fill with Water',
    description: 'Unscrew the cap and fill the stainless steel base with fresh, cool water.',
  },
  {
    icon: RotateCcw,
    num: '02',
    title: 'Flip the Silicone',
    description:
      'Push the turquoise silicone top backward — it instantly becomes a wide, stable drinking bowl.',
  },
  {
    icon: PawPrint,
    num: '03',
    title: 'Let Them Drink',
    description:
      'Your dog drinks comfortably from the bowl. When done, flip it back and continue your adventure.',
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="w-full bg-[#FAFAFA] py-24 md:py-[100px] page-padding"
    >
      {/* Section Header */}
      <ScrollTriggerEntrance className="text-center mb-14 md:mb-16">
        <p className="stagger-item text-label text-brand-turquoise mb-4">
          HOW IT WORKS
        </p>
        <TextRevealAnimation

          className="text-h2 text-charcoal-deep"
        >
          Hydration in three simple steps
        </TextRevealAnimation>
      </ScrollTriggerEntrance>

      {/* Steps */}
      <ScrollTriggerEntrance
        className="relative mx-auto max-w-[1000px]"
        stagger={0.1}
        start="top 75%"
      >
        {/* Connecting line - desktop only */}
        <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-0 border-t-2 border-dashed border-silver z-0" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-center gap-10 md:gap-10">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="stagger-item flex flex-col items-center text-center max-w-[300px] flex-1 bg-white py-8 px-6 rounded-2xl"
              >
                {/* Icon Circle */}
                <div className="w-16 h-16 rounded-full bg-[rgba(45,212,191,0.1)] border border-brand-turquoise flex items-center justify-center mb-4">
                  <Icon size={24} className="text-brand-turquoise" />
                </div>

                {/* Step Number */}
                <span className="font-mono text-sm text-silver mb-1">{step.num}</span>

                {/* Title */}
                <h3 className="text-h3 text-charcoal-deep mb-3">{step.title}</h3>

                {/* Description */}
                <p className="text-body text-body">{step.description}</p>
              </div>
            );
          })}
        </div>
      </ScrollTriggerEntrance>
    </section>
  );
}
