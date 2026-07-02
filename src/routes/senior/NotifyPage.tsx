import { useNavigate } from 'react-router-dom';
import { SeniorHomeButton } from '../../components/ui';
import { seniorDay } from '../../lib/mock';

// Phone lock-screen mock: a calm dark background with a big clock/date and a single
// push-notification card. Tapping the card opens the in-app alarm (mock-only, no OS push).
export function NotifyPage() {
  const navigate = useNavigate();
  const { nextDose, dateLabel } = seniorDay;

  // "저녁약 · 1번 봉지" → "저녁약"; strip the year so it reads like a lock-screen date.
  const doseName = nextDose.label.split('·')[0]?.trim() ?? nextDose.label;
  const shortDate = dateLabel.replace(/^\d{4}년\s*/, '');

  return (
    <div className="relative flex min-h-full flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-[var(--gjb-screen-x)] pb-10 pt-16 text-white">
      <SeniorHomeButton />
      <div className="flex flex-col items-center text-center">
        <p className="text-lg font-medium text-white/70">{shortDate}</p>
        <p className="mt-1 text-[length:clamp(3.5rem,18vw,4.5rem)] font-extralight tabular-nums">{nextDose.alarmLabel}</p>
      </div>

      <div className="mt-14 flex flex-1 flex-col justify-start">
        <button
          type="button"
          onClick={() => navigate('/senior/alarm')}
          className="w-full rounded-3xl bg-white/85 p-5 text-left shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-500">
            <img
              src="/brand/고찌봄 기본.svg"
              alt="고찌봄"
              className="gjb-mascot-muted h-6 w-6 rounded-lg object-contain shadow-[var(--gjb-shadow-soft)]"
            />
            <span>고찌봄</span>
            <span className="ml-auto font-medium text-stone-400">지금</span>
          </div>
          <p className="mt-2 text-[length:var(--gjb-senior-subtitle)] font-extrabold leading-snug text-stone-900">{doseName} 드실 시간이에요</p>
          <p className="mt-1 text-lg font-medium text-stone-500">지금 눌러서 확인하세요</p>
        </button>
      </div>

      <p className="text-center text-base font-medium text-white/50">밀어서 확인 ›</p>
    </div>
  );
}
