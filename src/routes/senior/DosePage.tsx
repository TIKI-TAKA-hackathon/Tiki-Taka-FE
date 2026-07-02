import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DemoImage, PrimaryButton, SeniorActionZone, SeniorHomeButton } from '../../components/ui';
import { seniorDay } from '../../lib/mock';
import { GUIDE_AUDIO } from '../../lib/guide';
import { useCaregiverExitAlert } from '../../lib/useCaregiverExitAlert';

export function DosePage() {
  const navigate = useNavigate();
  const { nextDose } = seniorDay;
  const pouchName = nextDose.label.split('·')[1]?.trim().replace(/ 봉지$/, '') ?? `${nextDose.packetNo}번`;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useCaregiverExitAlert(true, {
    id: 'senior-dose-exit',
    title: '복약 확인 중 앱을 벗어났어요',
    body: '어르신이 복약 확인을 마치지 못했어요. 확인이 필요해요.',
  });

  // 모바일 자동재생 차단·미지원 환경에서는 조용히 무시하고 화면 텍스트 안내로 폴백한다.
  const play = useCallback((el: HTMLAudioElement | null) => {
    if (!el) return;
    el.currentTime = 0;
    try {
      const played = el.play();
      if (played && typeof played.catch === 'function') played.catch(() => undefined);
    } catch {
      // 재생 미지원 환경(테스트 등)
    }
  }, []);

  useEffect(() => {
    play(audioRef.current);
  }, [play]);

  return (
    <div className="relative flex min-h-full flex-col">
      <SeniorHomeButton />
      <div className="flex items-center bg-brand-50 px-5 py-3">
        <span className="flex items-center gap-2 text-base font-semibold text-brand-700">🔊 음성 안내 중</span>
      </div>
      <audio ref={audioRef} src={GUIDE_AUDIO.detailEnvelope} preload="auto" />

      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-[var(--gjb-screen-x)] pt-5 text-center">
        <h1 className="text-[length:var(--gjb-senior-subtitle)] font-extrabold leading-snug text-stone-900">지금 드실 약이에요</h1>
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-success-50 px-3 py-1 text-base font-semibold text-success-700">
          🍽 {nextDose.mealTag}
        </span>
        <p className="mt-3 text-[length:var(--gjb-senior-display)] font-black text-stone-900">{nextDose.alarmLabel}</p>
        <p className="mt-2 text-base text-stone-400">{nextDose.baselineNote}</p>

        <div className="mt-5 flex flex-col items-center rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50 px-[clamp(2rem,10vw,2.5rem)] py-[clamp(1.25rem,4dvh,1.5rem)]">
          {nextDose.pills.some((pill) => pill.image) ? (
            <div className="flex items-center gap-2">
              {nextDose.pills.map((pill) =>
                pill.image ? (
                  <DemoImage
                    key={pill.id}
                    src={pill.image}
                    alt={pill.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                    fallback={<span className="text-[length:var(--gjb-senior-icon)]">💊</span>}
                  />
                ) : (
                  <span key={pill.id} className="text-[length:var(--gjb-senior-icon)]">
                    💊
                  </span>
                ),
              )}
            </div>
          ) : (
            <span className="text-[length:var(--gjb-senior-icon)]">💊</span>
          )}
          <span className="mt-2 flex min-h-9 items-center justify-center rounded-full bg-brand-600 px-3 text-base font-bold text-white">
            {pouchName}
          </span>
        </div>
        <h2 className="mt-4 text-[length:var(--gjb-senior-subtitle)] font-extrabold leading-snug text-stone-900">{nextDose.label}</h2>
        <p className="mt-1 text-lg text-stone-500">약 {nextDose.pillCount}개</p>
      </div>

      <SeniorActionZone className="px-[var(--gjb-screen-x)] pb-6 pt-4">
        <PrimaryButton size="xl" className="flex-1" onClick={() => navigate('/senior/camera')}>
          네, 먹었어요 ✓
        </PrimaryButton>
      </SeniorActionZone>
    </div>
  );
}
