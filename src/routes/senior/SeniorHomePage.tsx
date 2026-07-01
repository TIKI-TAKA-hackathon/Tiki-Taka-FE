import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui';
import { seniorDay } from '../../lib/mock';

export function SeniorHomePage() {
  const navigate = useNavigate();
  const { dateLabel, nextDose, doses } = seniorDay;

  return (
    <div className="flex min-h-full flex-col gap-5 px-5 pb-8 pt-2">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-stone-400">{dateLabel}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-stone-900">오늘 먹을 약</h1>
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
          onClick={() => navigate('/senior/photo')}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 py-3 text-base font-semibold text-stone-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
            <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.7" />
          </svg>
          약 사진 보기
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
