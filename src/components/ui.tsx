import type { ReactNode } from 'react';

export type BadgeTone = 'success' | 'neutral' | 'meal' | 'next' | 'info' | 'warn';

const TONES: Record<BadgeTone, string> = {
  success: 'bg-success-100 text-success-700',
  neutral: 'bg-stone-100 text-stone-500',
  meal: 'bg-success-50 text-success-700',
  next: 'bg-amber-100 text-amber-800',
  info: 'bg-brand-50 text-brand-700',
  warn: 'bg-warn-100 text-warn-700',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-stone-100 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function CheckCircle({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const box = size === 'lg' ? 'h-24 w-24' : 'h-6 w-6';
  const icon = size === 'lg' ? 'h-11 w-11' : 'h-4 w-4';
  return (
    <span className={`inline-flex ${box} items-center justify-center rounded-full bg-success-100`}>
      <svg className={`${icon} text-success-600`} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 13l4 4L19 7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
