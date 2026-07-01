import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

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

export function BackHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 px-6 py-3">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="뒤로"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-600"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1 className="text-xl font-bold text-stone-900">{title}</h1>
    </div>
  );
}

export function Loading({ label = '불러오는 중…' }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-stone-400">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-brand-600" />
      <p className="text-base">{label}</p>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="m-6 rounded-2xl bg-warn-50 p-4 text-center text-base font-semibold text-warn-700">
      {message}
    </div>
  );
}
