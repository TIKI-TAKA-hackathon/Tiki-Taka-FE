import { useCallback } from 'react';
import { BackHeader, ErrorNote, Loading } from '../../components/ui';
import { fetchSeniorNotifications } from '../../lib/api';
import { notifications as notificationsFixture } from '../../lib/mock';
import { loadSession } from '../../lib/session';
import { useAsync } from '../../lib/useAsync';

export function AlertsPage() {
  const session = loadSession();
  const loadNotifications = useCallback(
    () =>
      session
        ? fetchSeniorNotifications(session.seniorId, session.ownerUserId)
        : // No session yet (e.g. before pairing): show the demo feed so the screen never dead-ends.
          Promise.resolve(notificationsFixture),
    [session],
  );
  const { data, loading, error } = useAsync(loadNotifications);

  if (loading) {
    return <Loading label="알림을 불러오는 중…" />;
  }
  if (error || !data) {
    return (
      <div className="flex min-h-full flex-col pb-8">
        <BackHeader title="알림함" />
        <ErrorNote message="알림을 불러오지 못했어요." />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col pb-8">
      <BackHeader title="알림함" />
      {data.length === 0 ? (
        <p className="px-6 py-16 text-center text-lg text-stone-400">아직 알림이 없어요.</p>
      ) : (
        <ul className="space-y-3 px-6">
          {data.map((item) => (
            <li
              key={item.id}
              className={`rounded-3xl border p-5 shadow-sm ${
                item.read ? 'border-stone-100 bg-white' : 'border-brand-100 bg-brand-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-xl font-bold text-stone-900">{item.title}</span>
                <span className="shrink-0 text-base text-stone-400">{item.createdAtLabel}</span>
              </div>
              <p className="mt-1.5 text-lg text-stone-600">{item.body}</p>
              {!item.read && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-sm font-bold text-white">
                  새 알림
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
