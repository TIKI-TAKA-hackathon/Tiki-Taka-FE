import { env } from './env';
import {
  careGroup as careGroupFixture,
  caregiverBoard,
  changeLog as changeLogFixture,
  inviteLink as inviteLinkFixture,
  mealTimes as mealTimesFixture,
  notificationSettings as notificationSettingsFixture,
  seniorDay,
} from './mock';
import { loadSession, saveSession } from './session';
import type {
  CareGroup,
  CaregiverBoard,
  ChangeLog,
  CreateCareGroupRequest,
  InviteLink,
  MealTimes,
  NotificationSettings,
  SeniorDay,
  UpdateMealTimesRequest,
} from './types';

// Every backend route lives under /api/v1 and wraps responses as { data, error }.
const API_PREFIX = '/api/v1';

type ApiEnvelope<T> = { data: T | null; error: { code?: string; message?: string } | null };

function unwrap<T>(body: ApiEnvelope<T>): T {
  if (body.error) {
    throw new Error(body.error.message ?? body.error.code ?? 'API error');
  }
  if (body.data === null || body.data === undefined) {
    throw new Error('API response has no data');
  }
  return body.data;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${API_PREFIX}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return unwrap((await response.json()) as ApiEnvelope<T>);
}

// Write helper for POST/PUT/PATCH/DELETE. Unwraps the envelope and throws on !ok.
async function sendJson<T>(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${API_PREFIX}${path}`, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    // Surface the backend error code (e.g. PRIMARY_REQUIRED) when present.
    let code: string | undefined;
    try {
      const parsed = (await response.json()) as ApiEnvelope<T>;
      code = parsed.error?.code ?? parsed.error?.message;
    } catch {
      // no JSON body
    }
    throw new Error(code ?? `API request failed: ${response.status} ${response.statusText}`);
  }
  return unwrap((await response.json()) as ApiEnvelope<T>);
}

// Demo mode returns fixtures. Otherwise call the backend and fall back to fixtures on failure.
async function load<T>(path: string, fixture: T): Promise<T> {
  if (env.demoMode) {
    return fixture;
  }
  try {
    return await getJson<T>(path);
  } catch {
    return fixture;
  }
}

function query(params: Record<string, string | undefined> = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : '';
}

// --- Existing read screens (real endpoints) ---
export function fetchSeniorDay(params: { seniorId?: string; date?: string } = {}): Promise<SeniorDay> {
  return load(`/senior/today${query(params)}`, seniorDay);
}

export function fetchCaregiverBoard(
  params: { careGroupId?: string; date?: string } = {},
): Promise<CaregiverBoard> {
  return load(`/care-groups/${params.careGroupId ?? 'latest'}/board${query({ date: params.date })}`, caregiverBoard);
}

// --- Care group (real endpoints) ---
// POST /care-groups — caregiver signup + senior registration (incl. phone).
export async function createCareGroup(req: CreateCareGroupRequest): Promise<CareGroup> {
  if (env.demoMode) {
    return { ...careGroupFixture, name: req.name, senior: { ...careGroupFixture.senior, name: req.senior.name } };
  }
  try {
    return await sendJson<CareGroup>('POST', '/care-groups', req);
  } catch {
    // Keep the demo flow alive when the backend is unreachable.
    return { ...careGroupFixture, name: req.name, senior: { ...careGroupFixture.senior, name: req.senior.name } };
  }
}

export function getCareGroup(id: string): Promise<CareGroup> {
  return load(`/care-groups/${id}`, careGroupFixture);
}

export function fetchChangeLog(id: string, limit = 20): Promise<ChangeLog[]> {
  return load(`/care-groups/${id}/change-log${query({ limit: String(limit) })}`, changeLogFixture);
}

// POST /care-groups/{id}/invite-links — invite family members via a shareable link.
export async function createInviteLink(id: string, ownerUserId: string, maxUses?: number): Promise<InviteLink> {
  if (env.demoMode) {
    return inviteLinkFixture;
  }
  try {
    return await sendJson<InviteLink>('POST', `/care-groups/${id}/invite-links`, { ownerUserId, maxUses });
  } catch {
    return inviteLinkFixture;
  }
}

// PATCH /care-groups/{id}/primary — transfer the primary (대표자) role.
export async function transferPrimary(
  id: string,
  actorUserId: string,
  memberId: string,
): Promise<CareGroup> {
  if (env.demoMode) {
    return careGroupFixture;
  }
  try {
    return await sendJson<CareGroup>('PATCH', `/care-groups/${id}/primary`, { actorUserId, memberId });
  } catch {
    return careGroupFixture;
  }
}

// --- Meal times (real endpoints) ---
export function getMealTimes(seniorId: string): Promise<MealTimes> {
  return load(`/seniors/${seniorId}/meal-times`, mealTimesFixture);
}

// PUT /seniors/{id}/meal-times — primary member only; backend returns 403 PRIMARY_REQUIRED otherwise.
export async function updateMealTimes(seniorId: string, req: UpdateMealTimesRequest): Promise<MealTimes> {
  if (env.demoMode) {
    return { ...mealTimesFixture, ...req, seniorId, updatedAt: new Date().toISOString() };
  }
  // Do not swallow errors here: the caller needs to distinguish 403 PRIMARY_REQUIRED from success.
  return sendJson<MealTimes>('PUT', `/seniors/${seniorId}/meal-times`, req);
}

// --- Mock-only: phone OTP (no backend SMS/OTP endpoint yet) ---
export function requestOtp(_phone: string): Promise<void> {
  // No-op mock: pretend the SMS was sent.
  void _phone;
  return Promise.resolve();
}

export function verifyOtp(_phone: string, code: string): Promise<boolean> {
  // Any 6-digit numeric code passes in the mock.
  void _phone;
  return Promise.resolve(/^\d{6}$/.test(code));
}

// --- Mock-only: find a care group by senior phone (no BE endpoint yet) ---
// Matches against the session saved at signup on the same demo device; otherwise returns a demo pairing.
export function findCareGroupBySeniorPhone(
  phone: string,
): Promise<{ careGroupId: string; seniorId: string }> {
  const session = loadSession();
  if (session?.seniorPhone && normalizePhone(session.seniorPhone) === normalizePhone(phone)) {
    return Promise.resolve({ careGroupId: session.careGroupId, seniorId: session.seniorId });
  }
  // Demo pairing fallback so the senior connect flow never dead-ends.
  return Promise.resolve({ careGroupId: careGroupFixture.id, seniorId: careGroupFixture.senior.id });
}

// --- Mock-only: notification cadence (no BE persistence yet) — localStorage ---
const NOTIFICATION_KEY = 'gojjibom.notificationSettings';

export function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_KEY);
    if (raw) {
      return Promise.resolve(JSON.parse(raw) as NotificationSettings);
    }
  } catch {
    // ignore malformed / unavailable storage
  }
  return Promise.resolve(notificationSettingsFixture);
}

export function saveNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
  try {
    window.localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(settings));
  } catch {
    // ignore unavailable storage
  }
  return Promise.resolve(settings);
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// Re-export so pages can persist the senior phone alongside the ids after signup.
export { saveSession };
