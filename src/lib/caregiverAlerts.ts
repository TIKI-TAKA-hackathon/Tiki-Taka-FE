import type { AppNotification } from './types';

const STORAGE_KEY = 'gojjibom.caregiverAlerts';
const MAX_ALERTS = 10;

type CaregiverAlertInput = {
  id: string;
  title: string;
  body: string;
};

export function pushCaregiverAlert(alert: CaregiverAlertInput): void {
  const next: AppNotification = {
    id: alert.id,
    type: 'escalation',
    level: 'high',
    title: alert.title,
    body: alert.body,
    createdAtLabel: '방금',
    read: false,
  };
  const alerts = loadCaregiverAlerts().filter((item) => item.id !== alert.id);
  saveCaregiverAlerts([next, ...alerts].slice(0, MAX_ALERTS));
}

export function loadCaregiverAlerts(): AppNotification[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isAppNotification) : [];
  } catch {
    return [];
  }
}

export function markCaregiverAlertRead(id: string): void {
  const alerts = loadCaregiverAlerts();
  saveCaregiverAlerts(alerts.map((item) => (item.id === id ? { ...item, read: true } : item)));
}

function saveCaregiverAlerts(alerts: AppNotification[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch {
    // localStorage may be unavailable; the alert is best-effort in demo mode.
  }
}

function isAppNotification(value: unknown): value is AppNotification {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.level === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.body === 'string' &&
    typeof candidate.createdAtLabel === 'string' &&
    typeof candidate.read === 'boolean'
  );
}
