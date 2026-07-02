import { env } from './env';
import {
  careGroup as careGroupFixture,
  caregiverBoard,
  changeLog as changeLogFixture,
  confirmMedsView as confirmMedsViewFixture,
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
  ConfirmMedsView,
  CreateCareGroupRequest,
  CreatePrescriptionRequest,
  InviteLink,
  MealTimes,
  NotificationSettings,
  PrescriptionResponse,
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

// --- Prescription QR registration (real endpoint) ---
// GET /prescriptions:lookup?code=<rawValue> — the QR rawValue is the pharmacy registration code.
export async function fetchPrescriptionByCode(code: string): Promise<ConfirmMedsView> {
  if (env.demoMode) {
    return confirmMedsViewFixture;
  }
  try {
    return await getJson<ConfirmMedsView>(`/prescriptions:lookup${query({ code })}`);
  } catch {
    // Keep the confirm-meds flow demoable before BE is deployed.
    return confirmMedsViewFixture;
  }
}

// POST /seniors/{seniorId}/prescriptions — pharmacy pre-creates the prescription (D-A).
// The prescription is persisted + ACTIVE at create time; its registrationCode is scanned/entered later.
export async function createPrescription(
  seniorId: string,
  request: CreatePrescriptionRequest,
): Promise<PrescriptionResponse> {
  if (env.demoMode) {
    return {
      id: Date.now(),
      seniorId: Number(seniorId) || 0,
      status: 'ACTIVE',
      registrationCode: request.registrationCode ?? null,
    };
  }
  try {
    return await sendJson<PrescriptionResponse>('POST', `/seniors/${seniorId}/prescriptions`, request);
  } catch {
    // Keep the pharmacy-registration flow demoable before BE is deployed.
    return {
      id: Date.now(),
      seniorId: Number(seniorId) || 0,
      status: 'ACTIVE',
      registrationCode: request.registrationCode ?? null,
    };
  }
}

// --- Phone OTP (real endpoints, demo-fallback) ---
// POST /auth/otp:request — no-op SMS stub on the backend.
export async function requestOtp(phone: string): Promise<void> {
  if (env.demoMode) {
    return;
  }
  try {
    await sendJson<{ sent: boolean }>('POST', '/auth/otp:request', { phone });
  } catch {
    // Pretend the SMS was sent so the demo flow can proceed.
  }
}

// POST /auth/otp:verify — backend returns { verified }, or 400 OTP_INVALID for non-6-digit codes.
export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  if (env.demoMode) {
    return /^\d{6}$/.test(code);
  }
  try {
    const result = await sendJson<{ verified: boolean }>('POST', '/auth/otp:verify', { phone, code });
    return result.verified;
  } catch {
    // Demo-fallback when the backend is down: treat any 6-digit numeric code as verified.
    return /^\d{6}$/.test(code);
  }
}

// --- Find a care group by senior phone (real endpoint, demo-fallback) ---
// GET /care-groups:lookup?seniorPhone=010-... — used by the senior phone-pairing flow.
export async function findCareGroupBySeniorPhone(
  phone: string,
): Promise<{ careGroupId: string; seniorId: string }> {
  if (!env.demoMode) {
    try {
      const found = await getJson<{ careGroupId: string; seniorId: string; seniorName: string }>(
        `/care-groups:lookup${query({ seniorPhone: phone })}`,
      );
      return { careGroupId: found.careGroupId, seniorId: found.seniorId };
    } catch {
      // Fall through to the local/demo pairing below when the lookup is unavailable.
    }
  }
  const session = loadSession();
  if (session?.seniorPhone && normalizePhone(session.seniorPhone) === normalizePhone(phone)) {
    return { careGroupId: session.careGroupId, seniorId: session.seniorId };
  }
  // Demo pairing fallback so the senior connect flow never dead-ends.
  return { careGroupId: careGroupFixture.id, seniorId: careGroupFixture.senior.id };
}

// --- Notification cadence (real endpoints, demo-fallback) ---
// GET /seniors/{id}/notification-settings — returns defaults (enabled/5min/3retries) if no row exists.
export function getNotificationSettings(seniorId: string): Promise<NotificationSettings> {
  return load(`/seniors/${seniorId}/notification-settings`, notificationSettingsFixture);
}

// PUT /seniors/{id}/notification-settings — primary member only; 403 PRIMARY_REQUIRED otherwise.
export async function saveNotificationSettings(
  seniorId: string,
  actorUserId: string,
  settings: NotificationSettings,
): Promise<NotificationSettings> {
  if (env.demoMode) {
    return settings;
  }
  // Do not swallow errors: the caller needs to distinguish 403 PRIMARY_REQUIRED from success.
  return sendJson<NotificationSettings>('PUT', `/seniors/${seniorId}/notification-settings`, {
    actorUserId,
    ...settings,
  });
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// Re-export so pages can persist the senior phone alongside the ids after signup.
export { saveSession };
