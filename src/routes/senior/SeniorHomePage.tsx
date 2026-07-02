import { useNavigate } from 'react-router-dom';
import { Badge, DemoImage, ErrorNote, Loading } from '../../components/ui';
import { fetchSeniorDay } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';

const HOSPITAL_MAP_IMAGE = '/mock/jeju-halla-map.svg';

export function SeniorHomePage() {
  const navigate = useNavigate();
  const { data, loading, error } = useAsync(fetchSeniorDay);

  if (loading) {
    return <Loading label="오늘 약을 불러오는 중…" />;
  }
  if (error || !data) {
    return <ErrorNote message={error ?? '복약 정보를 불러오지 못했어요.'} />;
  }

  const { dateLabel, nextDose, doses, refill, weather } = data;
  const rainy = weather.condition === 'rain';
  const doseName = nextDose.label.split('·')[0]?.trim() ?? nextDose.label;
  const pouchName = nextDose.label.split('·')[1]?.trim();

  async function triggerReminder() {
    try {
      if ('Notification' in window) {
        const permission =
          Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('고찌봄 · 복약 알림', {
            body: `${doseName} 드실 시간이에요. ${pouchName ? `${pouchName} ` : ''}약 ${nextDose.pillCount}개를 드세요.`,
            icon: '/icon.svg',
          });
        }
      }
    } catch {
      // 알림 미지원/거부는 무시하고 인앱 알림 화면으로 이동
    }
    navigate('/senior/dose');
  }

  return (
    <div className="flex min-h-full flex-col gap-5 px-[var(--gjb-screen-x)] pb-8 pt-4">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-stone-400">{dateLabel}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-stone-900">오늘 먹을 약</h1>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            {weather.region} {rainy ? '☔' : '☀️'} {weather.label} {weather.tempC}°
          </span>
        </div>
        <button
          type="button"
          aria-label="알림"
          onClick={() => navigate('/senior/alerts')}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-500"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <button
        type="button"
        onClick={() => navigate('/senior/notify')}
        className="flex w-full items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-left"
      >
        <span className="mt-0.5 text-2xl" aria-hidden>
          🔔
        </span>
        <span>
          <span className="block text-sm font-extrabold text-brand-700">데모 알림 미리보기</span>
          <span className="mt-0.5 block text-base font-bold leading-snug text-stone-900">
            실제 사용자는 {nextDose.alarmLabel}에 복약 알림을 받아요
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => navigate('/senior/add-prescription')}
        className="gjb-pill-btn flex min-h-[var(--gjb-senior-qr-entry-min)] w-full flex-col items-center justify-center gap-5 px-6 py-8 text-center text-[length:var(--gjb-senior-action-label)] font-extrabold leading-tight text-stone-900"
      >
        <span className="text-[length:var(--gjb-senior-icon)]" aria-hidden>
          📷
        </span>
        <span>
          처방 QR로
          <br />
          약 등록하기
        </span>
        <span className="text-lg font-bold text-stone-600">여기를 크게 눌러주세요</span>
      </button>

      {refill.depleted && (
        <section className="rounded-3xl border border-brand-100 bg-brand-50 p-5 shadow-sm">
          <h2 className="text-2xl font-extrabold text-stone-900">약이 다 떨어졌어요 💊</h2>
          <p className="mt-1 text-lg font-semibold text-brand-700">재처방이 필요해요</p>
          <div className="mt-4 rounded-2xl bg-white px-4 py-3">
            <p className="text-lg font-bold text-stone-900">🏥 {refill.hospitalName}</p>
            <p className="mt-1 text-base text-stone-600">{refill.hospitalAddress}</p>
          </div>
          <DemoImage
            src={HOSPITAL_MAP_IMAGE}
            alt={`${refill.hospitalName} 위치 지도`}
            className="mt-4 h-40 w-full rounded-2xl border border-brand-100 object-cover"
            fallback={
              <div className="mt-4 flex h-40 w-full items-center justify-center rounded-2xl border border-brand-100 bg-white text-base font-bold text-stone-400">
                지도 이미지를 준비 중이에요
              </div>
            }
          />
          {rainy && (
            <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-base font-semibold text-stone-700">
              ☔ 오늘 제주에 비가 와요 — 병원 방문은 내일로 권해요.
            </p>
          )}
          <div className="mt-4 flex gap-3">
            <a
              href={`tel:${refill.hospitalPhone.replace(/-/g, '')}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-lg font-bold text-white shadow-sm"
            >
              📞 전화하기
            </a>
            <button
              type="button"
              // 지도 연동은 데모 범위 밖(placeholder). 실제로는 병원 위치 지도 앱/웹으로 연결.
              onClick={() => {}}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-stone-200 bg-white py-4 text-lg font-bold text-stone-700"
            >
              🗺 지도
            </button>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-stone-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <Badge tone="next">⏰ 다음 약</Badge>
          <span className="text-base font-semibold text-stone-500">{nextDose.alarmLabel}</span>
        </div>
        <h2 className="mt-3 text-2xl font-extrabold text-stone-900">{nextDose.label}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-medium text-stone-500">약 {nextDose.pillCount}개</span>
          <span className="text-stone-300">·</span>
          <Badge tone="meal">🍽 {nextDose.mealTag}</Badge>
          <span className="text-stone-300">·</span>
          <span className="font-semibold text-brand-600">{nextDose.alarmLabel} 알림</span>
        </div>
        <div className="mt-3 rounded-2xl bg-stone-100/80 px-4 py-3 text-base font-medium text-stone-600">
          💊 {nextDose.includesNote}
        </div>
        <button
          type="button"
          onClick={triggerReminder}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-50 py-3 text-base font-bold text-brand-700"
        >
          🔔 지금 알림 받아보기
        </button>
      </section>

      <section>
        <h3 className="mb-2 px-1 text-base font-bold text-stone-500">오늘 복약 현황</h3>
        <ul className="space-y-3">
          {doses.map((dose) => {
            const clickable = dose.status === 'upcoming';
            const body = (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-stone-900">{dose.label}</span>
                  <span className="text-base font-medium text-stone-400">{dose.time}</span>
                  <Badge tone="meal">🍽 {dose.mealTag}</Badge>
                </div>
                <p className="mt-1 text-base text-stone-500">{dose.note}</p>
              </div>
            );
            return (
              <li key={dose.id}>
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => navigate('/senior/dose')}
                    className="flex w-full items-center justify-between rounded-3xl border border-stone-100 bg-white p-4 text-left shadow-sm"
                  >
                    {body}
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">예정</Badge>
                      <span className="text-stone-300">›</span>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center justify-between rounded-3xl border border-stone-100 bg-white p-4 shadow-sm">
                    {body}
                    <div className="flex items-center gap-2">
                      <Badge tone="success">✓ 완료</Badge>
                      <span className="text-stone-300">›</span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
