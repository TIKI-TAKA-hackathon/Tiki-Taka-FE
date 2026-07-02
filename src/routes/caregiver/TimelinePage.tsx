import { useCallback, useEffect, useState } from 'react';
import { Badge, BackHeader, ErrorNote, Loading } from '../../components/ui';
import type { BadgeTone } from '../../components/ui';
import { fetchCareGroupNotifications, markNotificationRead } from '../../lib/api';
import { notifications as notificationsFixture } from '../../lib/mock';
import { loadSession } from '../../lib/session';
import type { AppNotification, NotificationType } from '../../lib/types';

const TYPE_TONE: Record<NotificationType, BadgeTone> = {
  reminder: 'neutral',
  missed: 'check', // 미확인 = 주의(attention), 경고 아님 (안심 원칙)
  escalation: 'check',
};

const TYPE_LABEL: Record<NotificationType, string> = {
  reminder: '알림',
  missed: '미확인',
  escalation: '보호자 알림',
};

const DOT: Record<NotificationType, string> = {
  reminder: 'bg-basalt-300',
  missed: 'bg-check', // 미확인 = 테라코타 주의색 (빨강 금지)
  escalation: 'bg-check',
};

export function TimelinePage() {
  const session = loadSession();
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = session
        ? await fetchCareGroupNotifications(session.careGroupId)
        : // No session yet: fall back to the demo feed so the screen still renders.
          notificationsFixture;
      setItems(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleTap(item: AppNotification) {
    if (item.read) {
      return;
    }
    // Optimistically mark read; the PATCH is best-effort and the UI already reflects the change.
    setItems((current) =>
      current ? current.map((n) => (n.id === item.id ? { ...n, read: true } : n)) : current,
    );
    void markNotificationRead(item.id, session?.ownerUserId);
  }

  if (loading) {
    return <Loading label="타임라인을 불러오는 중…" />;
  }
  if (error || !items) {
    return (
      <div className="flex min-h-full flex-col pb-8">
        <BackHeader title="오늘 타임라인" />
        <ErrorNote message="타임라인을 불러오지 못했어요." />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col pb-8">
      <BackHeader title="오늘 타임라인" />
      {items.length === 0 ? (
        <p className="px-6 py-16 text-center text-base text-stone-400">아직 알림이 없어요.</p>
      ) : (
        <ol className="px-6">
          {items.map((item, index) => (
            <li key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={`mt-1.5 h-3 w-3 rounded-full ${DOT[item.type]}`} />
                {index < items.length - 1 && <span className="w-px flex-1 bg-stone-200" />}
              </div>
              <button
                type="button"
                onClick={() => handleTap(item)}
                className="flex-1 pb-5 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-400">{item.createdAtLabel}</span>
                  <Badge tone={TYPE_TONE[item.type]}>{TYPE_LABEL[item.type]}</Badge>
                  {!item.read && <span className="h-2 w-2 rounded-full bg-brand-600" aria-label="읽지 않음" />}
                </div>
                <p className={`mt-0.5 text-base ${item.read ? 'font-medium text-stone-500' : 'font-bold text-stone-900'}`}>
                  {item.title}
                </p>
                <p className="mt-0.5 text-sm text-stone-500">{item.body}</p>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
