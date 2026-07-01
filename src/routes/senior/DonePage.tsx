import { useNavigate } from 'react-router-dom';
import { CheckCircle } from '../../components/ui';
import { seniorDay } from '../../lib/mock';

export function DonePage() {
  const navigate = useNavigate();
  const { nextDose } = seniorDay;

  return (
    <div className="flex min-h-full flex-col px-6 pb-8">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <CheckCircle />
        <h1 className="mt-6 text-3xl font-extrabold text-stone-900">잘 하셨어요!</h1>
        <p className="mt-3 text-xl text-stone-500">저녁약을 드셨어요.</p>
        <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-50 px-5 py-4 text-base font-bold text-brand-700">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M16 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="9.5" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
            <path d="M17 8h4M19 6v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          가족에게도 전해졌어요.
        </div>
        <p className="mt-4 rounded-2xl bg-stone-100 px-5 py-3 text-base font-medium text-stone-500">
          {nextDose.doneTimeLabel} · 저녁약 1번 봉지 · 완료
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate('/senior')}
        className="w-full rounded-2xl bg-brand-600 py-4 text-lg font-bold text-white shadow-sm"
      >
        오늘 약 홈으로
      </button>
    </div>
  );
}
