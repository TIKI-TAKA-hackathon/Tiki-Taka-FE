import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export type BadgeTone = 'success' | 'neutral' | 'meal' | 'next' | 'info' | 'warn' | 'check';

// 상태색은 색만으로 구분하지 않고 글자·아이콘을 병기한다 (5·9장 안심/접근성 원칙).
const TONES: Record<BadgeTone, string> = {
  success: 'bg-done-bg text-done', // 완료 ✓
  neutral: 'bg-basalt-200 text-ink',
  meal: 'bg-done-bg text-done',
  next: 'bg-citrus-wash text-ink',
  info: 'bg-brand-50 text-sea-deep',
  warn: 'bg-delay-bg text-delay', // 지연 ⏳
  check: 'bg-check-bg text-check', // 확인 필요 ⚠
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

type DemoImageProps = {
  src: string;
  alt: string;
  className?: string;
  // Rendered when the image is missing (404) or fails to load. Defaults to
  // rendering nothing, so a missing demo image simply disappears instead of
  // showing a broken-image icon.
  fallback?: ReactNode;
};

// Graceful image for demo assets that may not exist yet. Because the demo image
// files are dropped in by hand later, this swaps to `fallback` on the first load
// error so a 404 never surfaces a broken-image icon.
export function DemoImage({ src, alt, className, fallback = null }: DemoImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <>{fallback}</>;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[var(--gjb-radius-card)] bg-surface shadow-[var(--gjb-shadow-soft)] ${className}`}
    >
      {children}
    </section>
  );
}

export function CheckCircle({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const box = size === 'lg' ? 'h-24 w-24' : 'h-6 w-6';
  const icon = size === 'lg' ? 'h-11 w-11' : 'h-4 w-4';
  return (
    <span className={`inline-flex ${box} items-center justify-center rounded-full bg-done-bg`}>
      <svg className={`${icon} text-done`} viewBox="0 0 24 24" fill="none" aria-hidden>
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
        className="flex h-9 w-9 items-center justify-center rounded-full border border-basalt-300 text-ink-soft"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1 className="text-xl font-bold text-ink">{title}</h1>
    </div>
  );
}

export function Loading({ label = '불러오는 중…' }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-ink-soft">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-basalt-300 border-t-sea-deep" />
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

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'tel' | 'date';
  inputMode?: 'text' | 'tel' | 'numeric';
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
  hint?: string;
};

export function TextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  placeholder,
  maxLength,
  autoFocus,
  hint,
}: TextFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="text-base font-semibold text-stone-700" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className="mt-2 rounded-2xl border border-stone-200 px-4 py-3 text-lg text-stone-900 outline-none focus:border-brand-500"
      />
      {hint && <p className="mt-1.5 text-sm text-stone-400">{hint}</p>}
    </div>
  );
}

type ButtonTone = 'brand' | 'success';
type ButtonSize = 'md' | 'lg' | 'xl';

// 캡슐 버튼 높이: 어르신 주 동작(lg) ≥ --gjb-elder-tap(64px), 기본(md) ≥ --gjb-tap(48px).
const BUTTON_SIZE: Record<ButtonSize, string> = {
  md: 'min-h-[var(--gjb-tap)] py-4 text-lg',
  lg: 'min-h-[var(--gjb-elder-tap)] py-5 text-xl',
  xl: 'min-h-[var(--gjb-senior-action-min)] py-[var(--gjb-senior-action-py)] text-[length:var(--gjb-senior-action-label)] leading-tight',
};

type PrimaryButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  tone?: ButtonTone;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
};

// 주 버튼 = 감귤 2톤 캡슐 + 은은한 상단 광택 + 잉크 글자 (7장①). 흰 글자 금지.
export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  size = 'md',
  disabled = false,
  className = '',
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`gjb-pill-btn flex w-full items-center justify-center gap-2 ${BUTTON_SIZE[size]} font-bold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

type SecondaryButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  size?: ButtonSize;
  className?: string;
};

// 보조 버튼 = 현무암 2톤 캡슐 + 잉크 글자 (7장①).
export function SecondaryButton({ children, onClick, type = 'button', size = 'md', className = '' }: SecondaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`gjb-pill-btn gjb-pill-btn--secondary flex w-full items-center justify-center gap-2 ${BUTTON_SIZE[size]} font-bold transition active:scale-[0.99] ${className}`}
    >
      {children}
    </button>
  );
}

export function SeniorActionZone({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`gjb-senior-action-zone flex min-h-[var(--gjb-senior-action-zone)] shrink-0 flex-col justify-center gap-3 ${className}`}>
      {children}
    </div>
  );
}

export function SeniorHomeButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      aria-label="홈화면으로 나가기"
      onClick={() => navigate('/senior/today')}
      className="gjb-senior-home-btn"
    >
      홈으로
    </button>
  );
}
