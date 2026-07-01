import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../../components/ui';
import { seniorDay } from '../../lib/mock';

export function DosePage() {
  const navigate = useNavigate();
  const [helpSent, setHelpSent] = useState(false);
  const { nextDose } = seniorDay;

  return (
    <div className="flex min-h-full flex-col pb-6">
      <div className="flex items-center justify-between bg-brand-50 px-5 py-3">
        <span className="flex items-center gap-2 text-base font-semibold text-brand-700">🔊 음성 안내 중</span>
        <button
          type="button"
          className="flex items-center gap-1 rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white"
        >
          ↻ 다시 듣기
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pt-5 text-center">
        <h1 className="text-2xl font-extrabold text-stone-900">지금 드실 약이에요</h1>
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-success-50 px-3 py-1 text-base font-semibold text-success-700">
          🍽 {nextDose.mealTag}
        </span>
        <p className="mt-3 text-5xl font-black tracking-tight text-stone-900">{nextDose.alarmLabel}</p>
        <p className="mt-2 text-base text-stone-400">{nextDose.baselineNote}</p>

        <div className="mt-5 flex flex-col items-center rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50 px-10 py-6">
          <span className="text-6xl">💊</span>
          <span className="mt-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-base font-bold text-white">
            {nextDose.packetNo}
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-stone-900">{nextDose.label}</h2>
        <p className="mt-1 text-lg text-stone-500">약 {nextDose.pillCount}개</p>

        <div className="mt-4 rounded-2xl bg-stone-100 px-5 py-4 text-base leading-relaxed text-stone-600">
          “{nextDose.spokenText}”
        </div>
        <button
          type="button"
          onClick={() => navigate('/senior/photo')}
          className="mt-3 text-base font-semibold text-brand-600 underline underline-offset-4"
        >
          약 사진 보기
        </button>
        {helpSent && (
          <p className="mt-4 rounded-2xl bg-success-50 px-4 py-3 text-base font-semibold text-success-700">
            가족에게 도움 요청을 보냈어요.
          </p>
        )}
      </div>

      <div className="space-y-3 px-6 pt-4">
        <PrimaryButton tone="success" size="lg" onClick={() => navigate('/senior/camera')}>
          네, 먹었어요 ✓
        </PrimaryButton>
        <button
          type="button"
          onClick={() => setHelpSent(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-200 py-4 text-lg font-bold text-red-500"
        >
          📞 도와주세요
        </button>
      </div>
    </div>
  );
}
