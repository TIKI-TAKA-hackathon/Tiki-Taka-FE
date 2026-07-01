import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, SecondaryButton } from '../../components/ui';
import { seniorDay } from '../../lib/mock';

export function AlarmPage() {
  const navigate = useNavigate();
  const { nextDose } = seniorDay;

  useEffect(() => {
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
        <PrimaryButton size="lg" onClick={() => navigate('/senior/dose')}>
          지금 확인하기
        </PrimaryButton>
        <SecondaryButton onClick={() => navigate('/senior/today')}>10분 뒤에 다시 알림</SecondaryButton>
      </div>
    </div>
  );
}
