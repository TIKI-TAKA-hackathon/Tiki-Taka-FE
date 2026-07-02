import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, PrimaryButton } from '../../components/ui';
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
    <div className="flex min-h-full flex-col px-6 pb-8">
      <audio ref={audioRef} src={GUIDE_AUDIO.done} preload="auto" />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <CheckCircle />
        <h1 className="mt-6 text-3xl font-extrabold text-stone-900">잘 하셨어요!</h1>
        <p className="mt-3 text-xl text-stone-500">저녁약을 드셨어요.</p>
        {photo && (
          <img
            src={photo.dataUrl}
            alt="가족에게 보낸 약 사진"
            className="mt-5 h-32 w-32 rounded-2xl object-cover shadow-sm"
          />
        )}
        <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-50 px-5 py-4 text-base font-bold text-brand-700">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M16 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="9.5" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
            <path d="M17 8h4M19 6v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          {photo ? '약 사진과 함께 카카오톡으로 가족에게 알렸어요.' : '가족에게 카카오톡으로 알렸어요.'}
        </div>
        <p className="mt-4 rounded-2xl bg-stone-100 px-5 py-3 text-base font-medium text-stone-500">
          {nextDose.doneTimeLabel} · 저녁약 1번 봉지 · 완료
        </p>
      </div>

      <PrimaryButton onClick={() => navigate('/senior/today')}>오늘 약 홈으로</PrimaryButton>
    </div>
  );
}
