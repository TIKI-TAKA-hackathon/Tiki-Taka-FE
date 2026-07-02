import { useNavigate } from 'react-router-dom';
import { caregiverBoard, jejuWeather, seniorDay } from '../../lib/mock';
import { loadSession } from '../../lib/session';
import { seniorName } from '../../lib/seniorName';

// Caregiver phone lock-screen mock (mirrors the senior NotifyPage): a calm dark background
// with a big clock/date and a STACK of incoming push-notification cards (iOS notification-
// center style). Each card is a large tappable button that deep-links into the app.
// TODO: real weather is 기상청 동네예보 / 제주 오픈 API, and real push delivery is
// Kakao 알림톡 / SMS — both out of demo scope (fixtures only here).

const CAREGIVER_PHONE = '01012345678'; // demo-only 보호자 연락처

export function CaregiverNotifyPage() {
  const navigate = useNavigate();
  const patient = seniorName(loadSession()?.seniorName ?? caregiverBoard.patientName);
  const { doses } = caregiverBoard;

  // Pull dose labels/times from the existing mock instead of hardcoding.
  const dinner = doses.find((dose) => dose.id === 'dinner');
  const morning = doses.find((dose) => dose.id === 'morning');
  const dinnerLabel = dinner?.label ?? '저녁약';
  const morningLabel = morning?.label ?? '아침약';
  const doneTimeLabel = seniorDay.nextDose.doneTimeLabel; // '오후 7:32'

  const shortDate = seniorDay.dateLabel.replace(/^\d{4}년\s*/, '');
  const nowLabel = seniorDay.nextDose.alarmLabel; // lock-screen clock, mirrors NotifyPage

  const isRain = jejuWeather.condition === 'rain';

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6 pb-10 pt-16 text-white">
      <div className="flex flex-col items-center text-center">
        <p className="text-lg font-medium text-white/70">{shortDate}</p>
        <p className="mt-1 text-7xl font-extralight tracking-tight tabular-nums">{nowLabel}</p>
      </div>

      <div className="mt-14 flex flex-1 flex-col gap-3">
        {/* 복용 완료 (positive) → 사진 확인 */}
        <button
          type="button"
          onClick={() => navigate('/caregiver/photos')}
          className="w-full rounded-3xl bg-white/85 p-5 text-left shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-success-100 text-base">💊</span>
            <span>고찌봄</span>
            <span className="ml-auto font-medium text-stone-400">지금</span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-2xl font-extrabold text-stone-900">
            <span className="text-success-600">✓</span>
            {patient}가 {dinnerLabel}을 드셨어요
          </p>
          <p className="mt-1 text-lg font-medium text-stone-500">{doneTimeLabel} · 사진 확인</p>
        </button>

        {/* 미복용 → 연락 (warn) → 타임라인, with a nested 전화하기 action */}
        <button
          type="button"
          onClick={() => navigate('/caregiver/timeline')}
          className="w-full rounded-3xl bg-white/85 p-5 text-left shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-warn-100 text-base">⚠</span>
            <span>고찌봄</span>
            <span className="ml-auto font-medium text-stone-400">방금</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-stone-900">
            {patient}가 {morningLabel}을 아직 안 드셨어요
          </p>
          <p className="mt-1 text-lg font-medium text-stone-500">재알림 2회 · 확인이 필요해요</p>
          <a
            href={`tel:${CAREGIVER_PHONE}`}
            onClick={(event) => event.stopPropagation()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-warn-100 py-3 text-base font-bold text-warn-700"
          >
            📞 전화하기
          </a>
        </button>

        {/* 날씨 (info) → 대시보드. 비일 때만 노출. */}
        {isRain && (
          <button
            type="button"
            onClick={() => navigate('/caregiver')}
            className="w-full rounded-3xl bg-white/85 p-5 text-left shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-50 text-base">☔</span>
              <span>고찌봄</span>
              <span className="ml-auto font-medium text-stone-400">오늘</span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-stone-900">
              {jejuWeather.region}에 {jejuWeather.label}가 와요 — 오늘 병원 방문은 내일로 권해요
            </p>
            <p className="mt-1 text-lg font-medium text-stone-500">{jejuWeather.advisory}</p>
          </button>
        )}
      </div>

      <p className="text-center text-base font-medium text-white/50">밀어서 확인 ›</p>
    </div>
  );
}
