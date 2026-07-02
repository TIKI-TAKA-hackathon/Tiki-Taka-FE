import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, DemoImage, PrimaryButton, SeniorActionZone } from '../../components/ui';
import { seniorDay } from '../../lib/mock';
import { useSharedDosePhoto } from '../../lib/shareStore';
import { GUIDE_AUDIO } from '../../lib/guide';

export function DonePage() {
  const navigate = useNavigate();
  const { nextDose } = seniorDay;
  const photo = useSharedDosePhoto();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 완료 안내 음성. 자동재생 차단·미지원 환경에서는 조용히 무시한다.
    const el = audioRef.current;
    if (!el) return;
    try {
      const played = el.play();
      if (played && typeof played.catch === 'function') played.catch(() => undefined);
    } catch {
      // 재생 미지원 환경(테스트 등)
    }
  }, []);

  return (
    <div className="flex min-h-full flex-col px-6">
      <audio ref={audioRef} src={GUIDE_AUDIO.done} preload="auto" />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto py-6 text-center">
        <CheckCircle />
        <h1 className="mt-5 text-3xl font-extrabold text-stone-900">잘 하셨어요!</h1>
        <p className="mt-2 text-xl font-semibold text-stone-500">저녁약을 드셨어요.</p>

        <section className="mt-6 w-full rounded-3xl border border-stone-100 bg-white p-5 text-left shadow-sm">
          <div className="flex items-center gap-4">
            {photo ? (
              <DemoImage
                src={photo.dataUrl}
                alt="보호자에게 보낸 약 사진"
                className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-sm"
              />
            ) : (
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-success-50 text-4xl">
                ✓
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-success-700">
                {photo ? '약 사진과 함께 알렸어요' : '보호자에게 알렸어요'}
              </p>
              <p className="mt-1 text-xl font-extrabold leading-snug text-stone-900">{nextDose.label}</p>
              <p className="mt-1 text-base font-semibold text-stone-500">{nextDose.doneTimeLabel} · 완료</p>
            </div>
          </div>
          <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-center text-base font-bold text-brand-700">
            보호자에게 카카오톡으로 알렸어요.
          </p>
          {photo && <p className="mt-3 text-center text-sm text-stone-400">사진은 참고용이며 복용 증명은 아니에요.</p>}
        </section>
      </div>

      <SeniorActionZone className="pb-8 pt-4">
        <PrimaryButton size="xl" className="flex-1 text-3xl" onClick={() => navigate('/senior/today')}>
          오늘 약 홈으로
        </PrimaryButton>
      </SeniorActionZone>
    </div>
  );
}
