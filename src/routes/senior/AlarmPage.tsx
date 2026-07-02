import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, SeniorActionZone, SeniorHomeButton } from '../../components/ui';
import { seniorDay } from '../../lib/mock';
import { GUIDE_AUDIO } from '../../lib/guide';

export function AlarmPage() {
  const navigate = useNavigate();
  const { nextDose } = seniorDay;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 알림 안내 음성(best-effort). 자동재생 차단 시 무시 — OS 알림이 주 채널이다.
    const el = audioRef.current;
    if (el) {
      try {
        const played = el.play();
        if (played && typeof played.catch === 'function') played.catch(() => undefined);
      } catch {
        // 재생 미지원 환경
      }
    }
    // If the senior already granted permission, arriving reminder pops a real OS notification.
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('고찌봄 · 복약 알림', {
          body: `${seniorDay.nextDose.label} 드실 시간이에요. 약 ${seniorDay.nextDose.pillCount}개를 드세요.`,
          icon: '/icon.svg',
        });
      } catch {
        // 알림 표시 실패는 무시 (인앱 알림 화면은 그대로 노출)
      }
    }
  }, []);

  return (
    <div className="gjb-hero-gradient relative flex min-h-full flex-col px-[var(--gjb-screen-x)] pt-10">
      <SeniorHomeButton />
      <audio ref={audioRef} src={GUIDE_AUDIO.alarm} preload="auto" />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <img
          src="/brand/고찌봄 인사.svg"
          alt="고찌봄 캐릭터"
          className="gjb-mascot-muted h-[var(--gjb-senior-mascot)] w-auto rounded-3xl drop-shadow-[var(--gjb-shadow-soft)]"
        />
        <p className="mt-6 text-base font-bold text-citrus-deep">복약 알림</p>
        <h1 className="gjb-senior-title mt-2 font-extrabold text-ink">약 드실 시간이에요</h1>
        <p className="mt-4 text-[length:var(--gjb-senior-subtitle)] font-bold leading-snug text-ink">{nextDose.label}</p>
        <p className="mt-1 text-lg text-ink-soft">
          {nextDose.alarmLabel} · 약 {nextDose.pillCount}개
        </p>
      </div>

      <SeniorActionZone className="pb-8 pt-4">
        <PrimaryButton size="xl" className="flex-1" onClick={() => navigate('/senior/dose')}>
          지금 확인하기
        </PrimaryButton>
      </SeniorActionZone>
    </div>
  );
}
