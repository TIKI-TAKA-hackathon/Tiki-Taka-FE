import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Card, DemoImage, ErrorNote, Loading } from '../../components/ui';
import { fetchCaregiverBoard, fetchCaregiverPhotos } from '../../lib/api';
// Demo-only refill/weather fixtures (mock). These are static demo values, not part of the board contract.
import { jejuWeather, refillStatus } from '../../lib/mock';
import { loadSession } from '../../lib/session';
import { seniorNameWithHonorific } from '../../lib/seniorName';
import { useSharedDosePhoto } from '../../lib/shareStore';
import { useAsync } from '../../lib/useAsync';
import type { WeekDayStatus } from '../../lib/types';

const WEEK_DOT: Record<WeekDayStatus, string> = {
  done: 'bg-done-bg text-done',
  warn: 'bg-check-bg text-check', // ⚠ 미확인 = 주의(check), 경고 아님 (안심 원칙)
  none: 'bg-basalt-200 text-basalt-400',
};

const TOP_ACTION_CLASS =
  'flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-white px-3 py-3 text-base font-bold text-stone-700 shadow-sm ring-1 ring-stone-100';

export function CaregiverDashboardPage() {
  const navigate = useNavigate();
  const careGroupId = loadSession()?.careGroupId;
  const loadBoard = useCallback(() => fetchCaregiverBoard({ careGroupId }), [careGroupId]);
  const { data, loading, error } = useAsync(loadBoard);
  const loadPhotos = useCallback(() => fetchCaregiverPhotos(careGroupId), [careGroupId]);
  const { data: photos } = useAsync(loadPhotos);
  const photo = useSharedDosePhoto();
  const recentPhotos = (photos ?? []).slice(0, 3);

  if (loading) {
    return <Loading label="복약 상태를 불러오는 중…" />;
  }
  if (error || !data) {
    return <ErrorNote message={error ?? '복약 상태를 불러오지 못했어요.'} />;
  }

  const { patientName, circle, doses, confirmations, pills, week, alert } = data;
  const seniorLabel = seniorNameWithHonorific(patientName);
  const confirmByLabel = new Map(confirmations.map((log) => [log.doseLabel, log] as const));

  return (
    <div className="flex min-h-full flex-col gap-4 px-6 pb-10 pt-4">
      <header>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-stone-400">복약 모니터링</p>
            <h1 className="mt-1 text-2xl font-extrabold text-stone-900">{seniorLabel} 복약 상태</h1>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              {jejuWeather.region} {jejuWeather.condition === 'rain' ? '☔' : '☀️'} {jejuWeather.label}{' '}
              {jejuWeather.tempC}°
            </span>
          </div>
          <div className="flex -space-x-1 text-2xl">
            <span>👩</span>
            <span>👦</span>
            <span>🏥</span>
          </div>
        </div>
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge tone="success">보호자 {circle.family}명</Badge>
            <Badge tone="info">사회복지사 {circle.social}명</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => navigate('/caregiver/notify')}
              className={TOP_ACTION_CLASS}
            >
              🔔 알림 미리보기
            </button>
            <button
              type="button"
              onClick={() => navigate('/caregiver/add-prescription')}
              className={`${TOP_ACTION_CLASS} bg-brand-50 text-brand-700 ring-brand-100`}
            >
              💊 약 등록
            </button>
            <button
              type="button"
              onClick={() => navigate('/caregiver/settings')}
              className={TOP_ACTION_CLASS}
            >
              ⚙ 설정
            </button>
            <button
              type="button"
              onClick={() => navigate('/caregiver/manage')}
              className={TOP_ACTION_CLASS}
            >
              👥 방 관리
            </button>
          </div>
        </div>
      </header>

      {refillStatus.depleted && (
        <div className="rounded-3xl border border-brand-100 bg-brand-50 p-4">
          <h2 className="flex items-center gap-1.5 text-base font-bold text-brand-700">💊 재처방 필요</h2>
          <p className="mt-1 text-sm font-semibold text-stone-700">
            {seniorLabel} 약이 소진됐어요 · {refillStatus.hospitalName} 재처방 필요
          </p>
          {jejuWeather.condition === 'rain' && (
            <p className="mt-2 text-sm text-stone-600">☔ 제주 우천 — 재처방 방문은 내일 권장</p>
          )}
          <div className="mt-3 flex gap-2">
            <a
              href={`tel:${refillStatus.hospitalPhone.replace(/-/g, '')}`}
              className="flex flex-1 items-center justify-center rounded-2xl bg-brand-600 py-3 text-sm font-bold text-white"
            >
              📞 병원 전화
            </a>
            <button
              type="button"
              onClick={() => navigate('/caregiver/timeline')}
              className="flex-1 rounded-2xl border border-stone-200 bg-white py-3 text-sm font-bold text-stone-700"
            >
              🕐 타임라인 보기
            </button>
          </div>
        </div>
      )}

      <Card className="p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-base font-bold text-stone-900">
          <span className="text-success-600">✓</span> 오늘 복약 확인
        </h2>
        <ul className="space-y-2.5">
          {doses.map((dose) => {
            const done = dose.status === 'done';
            const detail = confirmByLabel.get(dose.label)?.detail;
            return (
              <li key={dose.id} className="flex items-center gap-3">
                {done ? (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-50 text-success-600">
                    ✓
                  </span>
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-300">
                    ⏳
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-stone-900">{dose.label}</span>
                    <span className="text-sm text-stone-400">{dose.time}</span>
                    <Badge tone="meal">🍽 {dose.mealTag}</Badge>
                  </div>
                  {detail && <p className="mt-0.5 text-sm text-stone-500">{detail}</p>}
                </div>
                {done ? <Badge tone="success">✓ 완료</Badge> : <Badge tone="neutral">예정</Badge>}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-stone-400">오늘 복약 상태를 시간대별로 확인해요.</p>
      </Card>

      {photo && (
        <Card className="p-4">
          <h2 className="mb-3 text-base font-bold text-stone-700">📷 어르신이 보낸 복약 사진</h2>
          <DemoImage src={photo.dataUrl} alt="어르신이 보낸 약 사진" className="w-full rounded-2xl object-cover" />
          <p className="mt-2 text-sm text-stone-400">
            {photo.doseLabel} · {photo.at} 전송됨
          </p>
          <p className="mt-1 text-xs text-stone-400">사진은 참고용이며 복용 증명은 아니에요.</p>
        </Card>
      )}

      {recentPhotos.length > 0 && (
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">📷 최근 복약 사진</h2>
            <button
              type="button"
              onClick={() => navigate('/caregiver/photos')}
              className="text-sm font-semibold text-brand-600"
            >
              전체 보기 ›
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {recentPhotos.map((item) => (
              <button
                key={item.doseEventId}
                type="button"
                onClick={() => navigate('/caregiver/photos')}
                className="flex flex-col overflow-hidden rounded-2xl border border-stone-100 text-left"
                aria-label={`${item.doseLabel} 사진 보기`}
              >
                <DemoImage
                  src={item.thumbnailUrl}
                  alt={`${item.doseLabel} 복약 사진`}
                  className="aspect-square w-full object-cover"
                  fallback={
                    <span className="flex aspect-square w-full items-center justify-center bg-stone-100 text-3xl">
                      📷
                    </span>
                  }
                />
                <span className="px-2 py-1.5 text-xs font-semibold text-stone-500">{item.doseLabel}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-stone-400">사진은 참고용이며 복용 증명은 아니에요.</p>
        </Card>
      )}

      <Card className="border-l-4 border-l-brand-500 p-4">
        <h2 className="mb-3 text-base font-bold text-stone-900">💊 약 개수 추적</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { big: `${pills.remaining}개`, small: '남은 개수' },
            { big: pills.runOutDate, small: '예상 소진일' },
            { big: pills.refillDDay, small: '재처방 D-day' },
          ].map((stat) => (
            <div key={stat.small} className="rounded-2xl bg-stone-50 px-2 py-3 text-center">
              <p className="text-lg font-extrabold text-stone-900">{stat.big}</p>
              <p className="mt-1 text-xs text-stone-400">{stat.small}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate('/caregiver/pills')}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-2xl bg-brand-50 py-3 text-base font-bold text-brand-700"
        >
          개수 상세 보기 ›
        </button>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-base font-bold text-stone-900">최근 7일 요약</h2>
        <div className="flex justify-between">
          {week.map((day) => (
            <div key={day.label} className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${WEEK_DOT[day.status]}`}
              >
                {day.status === 'done' ? '✓' : day.status === 'warn' ? '⚠' : ''}
              </span>
              <span className="text-xs text-stone-400">{day.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {alert && (
        <div className="rounded-3xl bg-check-bg p-4 shadow-[var(--gjb-shadow-soft)]">
          <h2 className="flex items-center gap-1.5 text-base font-bold text-check">
            ⚠ 확인 필요 — {alert.doseLabel}
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            마지막 알림 {alert.lastAlarm} · 재알림 {alert.retries}회 · {alert.minutesElapsed}분 경과
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {alert.steps.map((step, index) => (
              <span
                key={step}
                className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                  index === alert.steps.length - 1 ? 'bg-brand-600 text-white' : 'bg-white text-stone-500'
                }`}
              >
                {step}
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/caregiver/timeline')}
              className="flex-1 rounded-2xl bg-check-bg py-3 text-sm font-bold text-check"
            >
              🕐 타임라인 보기
            </button>
            <a
              href="tel:0212345678"
              className="flex flex-1 items-center justify-center rounded-2xl border border-stone-200 bg-white py-3 text-sm font-bold text-stone-700"
            >
              📞 전화하기
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
