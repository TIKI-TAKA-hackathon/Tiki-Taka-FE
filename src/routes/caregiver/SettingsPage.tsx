import { useCallback, useEffect, useState } from 'react';
import { BackHeader, Card, Loading, PrimaryButton } from '../../components/ui';
import {
  getCareGroup,
  getMealTimes,
  getNotificationSettings,
  saveNotificationSettings,
  updateMealTimes,
} from '../../lib/api';
import { loadSession } from '../../lib/session';
import type { CareGroup, MealTimes, NotificationSettings } from '../../lib/types';

// LocalTime 'HH:mm:ss' <-> input[type=time] 'HH:mm'.
function toInputTime(value: string): string {
  return value.slice(0, 5);
}
function toLocalTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

const INTERVAL_OPTIONS = [5, 10];
const RETRY_OPTIONS = [1, 3];
const INTERVAL_MIN = 1;
const INTERVAL_MAX = 20;
const RETRY_MIN = 1;
const RETRY_MAX = 5;

export function SettingsPage() {
  const session = loadSession();
  const [group, setGroup] = useState<CareGroup | null>(null);
  const [meal, setMeal] = useState<MealTimes | null>(null);
  const [notif, setNotif] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [mealMessage, setMealMessage] = useState<string | null>(null);
  const [mealSaving, setMealSaving] = useState(false);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const [customIntervalOpen, setCustomIntervalOpen] = useState(false);
  const [customInterval, setCustomInterval] = useState('');
  const [customRetryOpen, setCustomRetryOpen] = useState(false);
  const [customRetry, setCustomRetry] = useState('');

  const load = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    const [g, m, n] = await Promise.all([
      getCareGroup(session.careGroupId),
      getMealTimes(session.seniorId),
      getNotificationSettings(session.seniorId),
    ]);
    setGroup(g);
    setMeal(m);
    setNotif(n);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <Loading label="설정을 불러오는 중…" />;
  }

  if (!session) {
    return (
      <div className="flex min-h-full flex-col pb-8">
        <BackHeader title="설정" />
        <div className="m-6 rounded-2xl bg-warn-50 p-4 text-center text-base font-semibold text-warn-700">
          먼저 보호자 방을 만들어주세요.
        </div>
      </div>
    );
  }

  // Whether this device's owner is the primary member (only the primary can edit meal times).
  const currentMember = group?.members.find((member) => member.user.id === session.ownerUserId);
  const canEdit = currentMember?.isPrimary ?? false;

  async function saveMeal() {
    if (!meal || !session) {
      return;
    }
    setMealMessage(null);
    setMealSaving(true);
    try {
      const updated = await updateMealTimes(session.seniorId, {
        actorUserId: session.ownerUserId,
        breakfast: meal.breakfast,
        lunch: meal.lunch,
        dinner: meal.dinner,
      });
      setMeal(updated);
      setMealMessage('식사시간을 저장했어요. 어르신·보호자에게 알림이 갑니다.');
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setMealMessage(
        message.includes('PRIMARY_REQUIRED')
          ? '식사시간은 대표자만 변경할 수 있어요.'
          : '식사시간을 저장하지 못했어요.',
      );
    } finally {
      setMealSaving(false);
    }
  }

  async function saveNotif(next: NotificationSettings) {
    if (!session) {
      return;
    }
    const previous = notif;
    setNotif(next);
    setNotifMessage(null);
    try {
      const saved = await saveNotificationSettings(session.seniorId, session.ownerUserId, next);
      setNotif(saved);
      setNotifMessage('알림 설정을 저장했어요.');
    } catch (err) {
      // Roll back the optimistic update so the UI matches the server.
      setNotif(previous);
      const message = err instanceof Error ? err.message : '';
      setNotifMessage(
        message.includes('PRIMARY_REQUIRED')
          ? '알림 설정은 대표자만 변경할 수 있어요.'
          : '알림 설정을 저장하지 못했어요.',
      );
    }
  }

  function openCustomInterval() {
    if (!notif) {
      return;
    }
    setCustomInterval(String(notif.remindIntervalMin));
    setCustomIntervalOpen(true);
    setNotifMessage(null);
  }

  function openCustomRetry() {
    if (!notif) {
      return;
    }
    setCustomRetry(String(notif.maxRetries));
    setCustomRetryOpen(true);
    setNotifMessage(null);
  }

  function saveCustomInterval() {
    if (!notif) {
      return;
    }
    const value = parseLimitedNumber(customInterval, INTERVAL_MIN, INTERVAL_MAX);
    if (value === null) {
      setNotifMessage(`재알림 간격은 ${INTERVAL_MIN}~${INTERVAL_MAX}분 사이로 입력해주세요.`);
      return;
    }
    void saveNotif({ ...notif, remindIntervalMin: value });
  }

  function saveCustomRetry() {
    if (!notif) {
      return;
    }
    const value = parseLimitedNumber(customRetry, RETRY_MIN, RETRY_MAX);
    if (value === null) {
      setNotifMessage(`최대 재시도는 ${RETRY_MIN}~${RETRY_MAX}회 사이로 입력해주세요.`);
      return;
    }
    void saveNotif({ ...notif, maxRetries: value });
  }

  return (
    <div className="flex min-h-full flex-col gap-4 px-6 pb-10 pt-1">
      <BackHeader title="설정" />

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">🍽 식사시간</h2>
          {!canEdit && <span className="text-sm font-semibold text-stone-400">🔒 대표자만 변경</span>}
        </div>
        <p className="mt-1 text-sm text-stone-400">약 알림은 식사시간을 기준으로 계산돼요.</p>
        {meal && (
          <div className="mt-3 space-y-3">
            {(
              [
                ['아침', 'breakfast'],
                ['점심', 'lunch'],
                ['저녁', 'dinner'],
              ] as const
            ).map(([label, key]) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-base font-semibold text-stone-700">{label}</span>
                <input
                  type="time"
                  disabled={!canEdit}
                  value={toInputTime(meal[key])}
                  onChange={(event) => setMeal({ ...meal, [key]: toLocalTime(event.target.value) })}
                  className="rounded-xl border border-stone-200 px-3 py-2 text-lg text-stone-900 disabled:bg-stone-50 disabled:text-stone-400"
                />
              </label>
            ))}
          </div>
        )}
        {mealMessage && <p className="mt-3 text-sm font-semibold text-stone-600">{mealMessage}</p>}
        {canEdit && (
          <div className="mt-4">
            <PrimaryButton onClick={saveMeal} disabled={mealSaving}>
              {mealSaving ? '저장 중…' : '식사시간 저장'}
            </PrimaryButton>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">🔔 알림 주기</h2>
          <div className="flex items-center gap-2">
            {!canEdit && <span className="text-sm font-semibold text-stone-400">🔒 대표자만 변경</span>}
            <button
              type="button"
              role="switch"
              aria-checked={notif?.enabled ?? false}
              disabled={!canEdit}
              onClick={() => notif && void saveNotif({ ...notif, enabled: !notif.enabled })}
              className={`relative h-7 w-12 rounded-full transition disabled:opacity-50 ${
                notif?.enabled ? 'bg-brand-600' : 'bg-stone-300'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  notif?.enabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-stone-400">복약 확인이 없을 때 다시 알리는 간격이에요.</p>
        {notif?.enabled && (
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-sm font-semibold text-stone-700">재알림 간격</p>
              <div role="group" aria-label="재알림 간격 선택" className="mt-2 flex gap-2">
                {INTERVAL_OPTIONS.map((min) => (
                  <button
                    key={min}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => {
                      setCustomIntervalOpen(false);
                      void saveNotif({ ...notif, remindIntervalMin: min });
                    }}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 ${
                      !customIntervalOpen && notif.remindIntervalMin === min
                        ? 'bg-brand-600 text-white'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {min}분
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={openCustomInterval}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 ${
                    customIntervalOpen || !INTERVAL_OPTIONS.includes(notif.remindIntervalMin)
                      ? 'bg-brand-600 text-white'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  직접 입력
                </button>
              </div>
              {customIntervalOpen && (
                <div className="mt-2 flex items-end gap-2">
                  <label className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-stone-500">분 단위</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label="재알림 간격 직접 입력"
                      value={customInterval}
                      onChange={(event) => setCustomInterval(event.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder={`${INTERVAL_MIN}~${INTERVAL_MAX}`}
                      maxLength={2}
                      disabled={!canEdit}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-lg font-bold text-stone-900 outline-none focus:border-brand-500 disabled:bg-stone-50 disabled:text-stone-400"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={saveCustomInterval}
                    aria-label="재알림 간격 적용"
                    className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    적용
                  </button>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-700">최대 재시도</p>
              <div role="group" aria-label="최대 재시도 선택" className="mt-2 flex gap-2">
                {RETRY_OPTIONS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => {
                      setCustomRetryOpen(false);
                      void saveNotif({ ...notif, maxRetries: count });
                    }}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 ${
                      !customRetryOpen && notif.maxRetries === count
                        ? 'bg-brand-600 text-white'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}회
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={openCustomRetry}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 ${
                    customRetryOpen || !RETRY_OPTIONS.includes(notif.maxRetries)
                      ? 'bg-brand-600 text-white'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  직접 입력
                </button>
              </div>
              {customRetryOpen && (
                <div className="mt-2 flex items-end gap-2">
                  <label className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-stone-500">횟수</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label="최대 재시도 직접 입력"
                      value={customRetry}
                      onChange={(event) => setCustomRetry(event.target.value.replace(/\D/g, '').slice(0, 1))}
                      placeholder={`${RETRY_MIN}~${RETRY_MAX}`}
                      maxLength={1}
                      disabled={!canEdit}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-lg font-bold text-stone-900 outline-none focus:border-brand-500 disabled:bg-stone-50 disabled:text-stone-400"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={saveCustomRetry}
                    aria-label="최대 재시도 적용"
                    className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    적용
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {notifMessage && <p className="mt-3 text-sm font-semibold text-stone-600">{notifMessage}</p>}
      </Card>

      <Card className="p-4">
        <h2 className="text-base font-bold text-stone-900">🔊 음성 안내</h2>
        <p className="mt-1 text-sm text-stone-400">알림 음성과 안내 목소리를 고를 수 있어요.</p>
        <button
          type="button"
          disabled
          className="mt-3 w-full rounded-2xl bg-stone-100 py-3 text-base font-bold text-stone-400"
        >
          음성 안내 설정 (준비 중)
        </button>
      </Card>
    </div>
  );
}

function parseLimitedNumber(value: string, min: number, max: number): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const number = Number(value);
  return number >= min && number <= max ? number : null;
}
