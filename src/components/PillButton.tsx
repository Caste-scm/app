import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function PillButton({
  variant = 'filled',
  size = 'md',
  className,
  children,
  ...props
}: PillButtonProps) {
  return (
    <button
      className={cn(
        'rounded-pill font-bold uppercase tracking-[0.06em] transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 active:translate-y-0',
        size === 'sm' && 'px-5 py-2 text-[11px]',
        size === 'md' && 'px-8 py-3.5 text-[13px]',
        size === 'lg' && 'px-10 py-4 text-[13px]',
        variant === 'filled' &&
        'bg-brand-turquoise text-charcoal-deep hover:bg-brand-dark hover:shadow-glow',
        variant === 'outlined' &&
        'border border-charcoal-deep text-charcoal-deep bg-transparent hover:bg-charcoal-deep hover:text-white',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
