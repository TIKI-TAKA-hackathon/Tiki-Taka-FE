import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Card, DemoImage, ErrorNote, Loading } from '../../components/ui';
import { fetchCaregiverBoard, fetchCaregiverPhotos } from '../../lib/api';
import { loadSession } from '../../lib/session';
import { useSharedDosePhoto } from '../../lib/shareStore';
import { useAsync } from '../../lib/useAsync';
import type { WeekDayStatus } from '../../lib/types';

const WEEK_DOT: Record<WeekDayStatus, string> = {
  done: 'bg-success-100 text-success-600',
  warn: 'bg-warn-100 text-warn-700',
  none: 'bg-stone-100 text-stone-300',
};

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

  return (
    <div className="flex min-h-full flex-col gap-4 px-6 pb-10 pt-4">
      <header>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-stone-400">복약 모니터링</p>
            <h1 className="mt-1 text-2xl font-extrabold text-stone-900">{patientName} 복약 상태</h1>
          </div>
          <div className="flex -space-x-1 text-2xl">
            <span>👩</span>
            <span>👦</span>
            <span>🏥</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            <Badge tone="success">가족 {circle.family}명</Badge>
            <Badge tone="info">사회복지사 {circle.social}명</Badge>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/caregiver/add-prescription')}
              className="text-sm font-semibold text-brand-600"
            >
              약 등록
            </button>
            <button
              type="button"
              onClick={() => navigate('/caregiver/settings')}
              className="text-sm font-semibold text-stone-500"
            >
              설정
            </button>
            <button
              type="button"
              onClick={() => navigate('/caregiver/manage')}
              className="text-sm font-semibold text-stone-500"
            >
              관리 →
            </button>
          </div>
        </div>
      </header>

      <Card className="p-4">
        <h2 className="mb-3 text-base font-bold text-stone-900">오늘 복약</h2>
        <ul className="space-y-2.5">
          {doses.map((dose) => (
            <li key={dose.id} className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-stone-900">{dose.label}</span>
                <span className="text-sm text-stone-400">{dose.time}</span>
                <Badge tone="meal">🍽 {dose.mealTag}</Badge>
              </div>
              <div className="flex items-center gap-2">
                {dose.status === 'done' ? <Badge tone="success">✓ 완료</Badge> : <Badge tone="neutral">예정</Badge>}
                <span className="text-stone-300">›</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-base font-bold text-stone-900">
          <span className="text-success-600">✓</span> 오늘의 복용 확인
        </h2>
        <ul className="space-y-2">
          {confirmations.map((log) => (
            <li
              key={log.doseLabel}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
                log.status === 'done' ? 'bg-success-50' : 'bg-stone-100'
              }`}
            >
              {log.status === 'done' ? <Badge tone="success">✓ 완료</Badge> : <Badge tone="neutral">예정</Badge>}
              <span className="font-bold text-stone-900">{log.doseLabel}</span>
              {log.detail && <span className="ml-auto text-sm text-stone-500">{log.detail}</span>}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-stone-400">앱의 확인 결과는 보조 정보입니다.</p>
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
        <div className="rounded-3xl border border-warn-100 bg-warn-50 p-4">
          <h2 className="flex items-center gap-1.5 text-base font-bold text-warn-700">
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
              className="flex-1 rounded-2xl bg-warn-100 py-3 text-sm font-bold text-warn-700"
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
