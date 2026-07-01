import { useNavigate } from 'react-router-dom';
import { seniorDay } from '../../lib/mock';

export function AlarmPage() {
  const navigate = useNavigate();
  const { nextDose } = seniorDay;

  return (
    <div className="flex min-h-full flex-col px-6 py-10">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="flex h-28 w-28 animate-pulse items-center justify-center rounded-full bg-brand-50 text-6xl">
          💊
        </span>
        <p className="mt-6 text-base font-bold text-brand-600">복약 알림</p>
        <h1 className="mt-2 text-3xl font-extrabold text-stone-900">약 드실 시간이에요</h1>
        <p className="mt-4 text-2xl font-bold text-stone-800">{nextDose.label}</p>
        <p className="mt-1 text-lg text-stone-400">
          {nextDose.alarmLabel} · 약 {nextDose.pillCount}개
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => navigate('/senior/dose')}
          className="w-full rounded-2xl bg-brand-600 py-5 text-xl font-bold text-white shadow-sm"
        >
          지금 확인하기
        </button>
        <button
          type="button"
          onClick={() => navigate('/senior')}
          className="w-full rounded-2xl border-2 border-stone-200 py-4 text-lg font-bold text-stone-600"
        >
          10분 뒤에 다시 알림
        </button>
      </div>
    </div>
  );
}
