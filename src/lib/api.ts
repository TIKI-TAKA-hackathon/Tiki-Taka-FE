import { env } from './env';
import { loadCaregiverAlerts, markCaregiverAlertRead } from './caregiverAlerts';
import { mergeLocalCaregiverMembers } from './caregiverMembers';
import {
  careGroup as careGroupFixture,
  caregiverBoard,
  changeLog as changeLogFixture,
  confirmMedsView as confirmMedsViewFixture,
  dosePhotos as dosePhotosFixture,
  inviteLink as inviteLinkFixture,
  mealTimes as mealTimesFixture,
  notifications as notificationsFixture,
  notificationSettings as notificationSettingsFixture,
  seniorDay,
} from './mock';
import { loadSession, saveSession } from './session';
import { DEFAULT_SENIOR_NAME, seniorNameWithHonorific } from './seniorName';
import type {
  AppNotification,
  CareGroup,
  CaregiverBoard,
  CaregiverPhotos,
  ChangeLog,
  ConfirmMedsView,
  CreateCareGroupRequest,
  CreatePrescriptionRequest,
  DosePhoto,
  InviteLink,
  MealTimes,
  NotificationSettings,
  NotificationType,
  PairingCode,
  PrescriptionResponse,
  ReviewStatus,
  SeniorDay,
  UpdateMealTimesRequest,
} from './types';

// Every backend route lives under /api/v1 and wraps responses as { data, error }.
const API_PREFIX = '/api/v1';
const DEMO_PAIRING_CODE_KEY = 'gojjibom.demoPairingCode';
const DEMO_PAIRING_CODE_TTL_MS = 10 * 60 * 1000;
const DEMO_MEAL_TIMES_KEY = 'gojjibom.demoMealTimes';
const DEMO_NOTIFICATION_SETTINGS_KEY = 'gojjibom.demoNotificationSettings';

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
  return load(
    `/care-groups/${params.careGroupId ?? 'latest'}/board${query({ date: params.date })}`,
    caregiverBoard,
  ).then(withSessionCaregiverBoard);
}

// --- Care group (real endpoints) ---
// POST /care-groups — caregiver signup + senior registration (incl. phone).
export async function createCareGroup(req: CreateCareGroupRequest): Promise<CareGroup> {
  if (env.demoMode) {
    return withCreatedCareGroup(req);
  }
  try {
    return await sendJson<CareGroup>('POST', '/care-groups', req);
  } catch {
    // Keep the demo flow alive when the backend is unreachable.
    return withCreatedCareGroup(req);
  }
}

export function getCareGroup(id: string): Promise<CareGroup> {
  return load(`/care-groups/${id}`, careGroupFixture).then(withSessionCareGroup).then(mergeLocalCaregiverMembers);
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

export async function createPairingCode(careGroupId: string): Promise<PairingCode> {
  const group = await getCareGroup(careGroupId);
  const pairingCode: PairingCode = {
    code: String(Math.floor(100000 + Math.random() * 900000)),
    careGroupId: group.id,
    seniorId: group.senior.id,
    expiresAt: new Date(Date.now() + DEMO_PAIRING_CODE_TTL_MS).toISOString(),
  };
  saveDemoPairingCode(pairingCode);
  return pairingCode;
}

export async function verifyPairingCode(code: string): Promise<{ careGroupId: string; seniorId: string }> {
  const normalized = code.replace(/\D/g, '');
  if (env.demoMode && /^\d{6}$/.test(normalized)) {
    return { careGroupId: careGroupFixture.id, seniorId: careGroupFixture.senior.id };
  }
  const stored = loadDemoPairingCode();
  if (stored && stored.code === normalized && !isExpired(stored.expiresAt)) {
    return { careGroupId: stored.careGroupId, seniorId: stored.seniorId };
  }
  throw new Error('PAIRING_CODE_INVALID');
}

// PATCH /care-groups/{id}/primary — transfer the primary (대표자) role.
export async function transferPrimary(
  id: string,
  actorUserId: string,
  memberId: string,
): Promise<CareGroup> {
  if (env.demoMode) {
    return withSessionCareGroup(careGroupFixture);
  }
  try {
    return await sendJson<CareGroup>('PATCH', `/care-groups/${id}/primary`, { actorUserId, memberId });
  } catch {
    return withSessionCareGroup(careGroupFixture);
  }
}

// --- Meal times (real endpoints) ---
export function getMealTimes(seniorId: string): Promise<MealTimes> {
  if (env.demoMode) {
    return Promise.resolve(loadDemoMealTimes() ?? mealTimesFixture);
  }
  return load(`/seniors/${seniorId}/meal-times`, loadDemoMealTimes() ?? mealTimesFixture);
}

// PUT /seniors/{id}/meal-times — primary member only; backend returns 403 PRIMARY_REQUIRED otherwise.
export async function updateMealTimes(seniorId: string, req: UpdateMealTimesRequest): Promise<MealTimes> {
  if (env.demoMode) {
    const next = { ...mealTimesFixture, ...req, seniorId, updatedAt: new Date().toISOString() };
    saveDemoMealTimes(next);
    return next;
  }
  // Do not swallow errors here: the caller needs to distinguish 403 PRIMARY_REQUIRED from success.
  const next = await sendJson<MealTimes>('PUT', `/seniors/${seniorId}/meal-times`, req);
  saveDemoMealTimes(next);
  return next;
}

// --- Prescription QR registration (real endpoint) ---
// GET /prescriptions:lookup?code=<rawValue> — the QR rawValue is the pharmacy registration code.
export async function fetchPrescriptionByCode(code: string): Promise<ConfirmMedsView> {
  if (env.demoMode) {
    return withSessionConfirmMedsView(confirmMedsViewFixture);
  }
  try {
    return withSessionConfirmMedsView(await getJson<ConfirmMedsView>(`/prescriptions:lookup${query({ code })}`));
  } catch {
    // Keep the confirm-meds flow demoable before BE is deployed.
    return withSessionConfirmMedsView(confirmMedsViewFixture);
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
  if (env.demoMode) {
    return Promise.resolve(loadDemoNotificationSettings() ?? notificationSettingsFixture);
  }
  return load(`/seniors/${seniorId}/notification-settings`, loadDemoNotificationSettings() ?? notificationSettingsFixture);
}

// PUT /seniors/{id}/notification-settings — primary member only; 403 PRIMARY_REQUIRED otherwise.
export async function saveNotificationSettings(
  seniorId: string,
  actorUserId: string,
  settings: NotificationSettings,
): Promise<NotificationSettings> {
  if (env.demoMode) {
    saveDemoNotificationSettings(settings);
    return settings;
  }
  // Do not swallow errors: the caller needs to distinguish 403 PRIMARY_REQUIRED from success.
  const saved = await sendJson<NotificationSettings>('PUT', `/seniors/${seniorId}/notification-settings`, {
    actorUserId,
    ...settings,
  });
  saveDemoNotificationSettings(saved);
  return saved;
}

// --- In-app notifications (real endpoints, demo-fallback) ---
// Backend may send createdAtLabel or a raw createdAt; keep the shape tolerant so the FE never breaks on either.
type RawNotification = Partial<AppNotification> & { createdAt?: string };

function normalizeNotification(raw: RawNotification): AppNotification {
  return {
    id: raw.id ?? '',
    type: (raw.type as NotificationType | undefined) ?? 'reminder',
    level: raw.level ?? 'info',
    title: raw.title ?? '',
    body: raw.body ?? '',
    createdAtLabel: raw.createdAtLabel ?? raw.createdAt ?? '',
    read: raw.read ?? false,
  };
}

// GET /seniors/{id}/notifications?actorUserId= — in-app notification records for the senior (newest first).
export async function fetchSeniorNotifications(
  seniorId: string,
  actorUserId?: string,
): Promise<AppNotification[]> {
  if (env.demoMode) {
    return withSessionNotifications(notificationsFixture);
  }
  try {
    const raw = await getJson<RawNotification[]>(
      `/seniors/${seniorId}/notifications${query({ actorUserId })}`,
    );
    return raw.map(normalizeNotification);
  } catch {
    return withSessionNotifications(notificationsFixture);
  }
}

// GET /care-groups/{id}/notifications — BFF feed for caregivers (newest first).
export async function fetchCareGroupNotifications(careGroupId: string): Promise<AppNotification[]> {
  if (env.demoMode) {
    return mergeCaregiverAlerts(withSessionNotifications(notificationsFixture));
  }
  try {
    const raw = await getJson<RawNotification[]>(`/care-groups/${careGroupId}/notifications`);
    return mergeCaregiverAlerts(raw.map(normalizeNotification));
  } catch {
    return mergeCaregiverAlerts(withSessionNotifications(notificationsFixture));
  }
}

// PATCH /notifications/{id}:read — marks a notification read. Best-effort in demo/offline mode.
export async function markNotificationRead(id: string, actorUserId?: string): Promise<void> {
  markCaregiverAlertRead(id);
  if (env.demoMode) {
    return;
  }
  try {
    await sendJson<AppNotification>('PATCH', `/notifications/${id}:read`, { actorUserId });
  } catch {
    // Optimistic UI already reflects the read state; ignore transient failures.
  }
}

function withCreatedCareGroup(req: CreateCareGroupRequest): CareGroup {
  return {
    ...careGroupFixture,
    name: req.name,
    senior: { ...careGroupFixture.senior, name: req.senior.name },
    members: careGroupFixture.members.map((member) =>
      member.role === 'OWNER'
        ? { ...member, user: { ...member.user, name: req.owner.name } }
        : member,
    ),
  };
}

function withSessionCareGroup(group: CareGroup): CareGroup {
  const session = loadSession();
  return {
    ...group,
    name: session?.groupName ?? group.name,
    senior: { ...group.senior, name: session?.seniorName ?? group.senior.name },
    members: group.members.map((member) =>
      member.role === 'OWNER' && session?.ownerName
        ? { ...member, user: { ...member.user, name: session.ownerName } }
        : member,
    ),
  };
}

function withSessionCaregiverBoard(board: CaregiverBoard): CaregiverBoard {
  return {
    ...board,
    patientName: loadSession()?.seniorName ?? board.patientName,
  };
}

function withSessionConfirmMedsView(view: ConfirmMedsView): ConfirmMedsView {
  return {
    ...view,
    seniorDisplayName: loadSession()?.seniorName ?? view.seniorDisplayName,
  };
}

function withSessionNotifications(items: AppNotification[]): AppNotification[] {
  const name = loadSession()?.seniorName;
  if (!name || name === DEFAULT_SENIOR_NAME) {
    return items;
  }
  const from = seniorNameWithHonorific(DEFAULT_SENIOR_NAME);
  const to = seniorNameWithHonorific(name);
  return items.map((item) => ({
    ...item,
    title: replaceText(replaceText(item.title, from, to), DEFAULT_SENIOR_NAME, name),
    body: replaceText(replaceText(item.body, from, to), DEFAULT_SENIOR_NAME, name),
  }));
}

function replaceText(value: string, from: string, to: string): string {
  return value.split(from).join(to);
}

function mergeCaregiverAlerts(items: AppNotification[]): AppNotification[] {
  return [...loadCaregiverAlerts(), ...items];
}

// --- Caregiver photo gallery (real endpoints, demo-fallback) ---
// GET /care-groups/{id}/photos?from=&to= — dose photos for the caregiver review gallery.
export async function fetchCaregiverPhotos(
  careGroupId: string | undefined,
  params: { from?: string; to?: string } = {},
): Promise<DosePhoto[]> {
  const id = careGroupId ?? 'latest';
  const view = await load<CaregiverPhotos>(
    `/care-groups/${id}/photos${query(params)}`,
    { careGroupId: id, photos: dosePhotosFixture },
  );
  return view.photos;
}

// PATCH /dose-events/{id}/photo:review — caregiver marks a photo reviewed or flagged.
export async function reviewDosePhoto(
  doseEventId: string,
  reviewStatus: Exclude<ReviewStatus, 'pending'>,
  actorUserId: string,
): Promise<DosePhoto> {
  const fallback: DosePhoto = {
    ...(dosePhotosFixture.find((photo) => photo.doseEventId === doseEventId) ?? dosePhotosFixture[0]),
    doseEventId,
    reviewStatus,
  };
  if (env.demoMode) {
    return fallback;
  }
  try {
    return await sendJson<DosePhoto>('PATCH', `/dose-events/${doseEventId}/photo:review`, {
      actorUserId,
      reviewStatus,
    });
  } catch {
    // Optimistic fallback so the review flow works before BE is deployed.
    return fallback;
  }
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function saveDemoPairingCode(pairingCode: PairingCode): void {
  try {
    window.localStorage.setItem(DEMO_PAIRING_CODE_KEY, JSON.stringify(pairingCode));
  } catch {
    // localStorage may be unavailable; the caller still receives the generated code.
  }
}

function loadDemoPairingCode(): PairingCode | null {
  try {
    const raw = window.localStorage.getItem(DEMO_PAIRING_CODE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isPairingCode(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function isPairingCode(value: unknown): value is PairingCode {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.code === 'string' &&
    typeof candidate.careGroupId === 'string' &&
    typeof candidate.seniorId === 'string' &&
    (typeof candidate.expiresAt === 'string' || candidate.expiresAt === null)
  );
}

function isExpired(expiresAt: string | null): boolean {
  return expiresAt !== null && Date.parse(expiresAt) <= Date.now();
}

function saveDemoMealTimes(mealTimes: MealTimes): void {
  try {
    window.localStorage.setItem(DEMO_MEAL_TIMES_KEY, JSON.stringify(mealTimes));
  } catch {
    // localStorage may be unavailable; settings still work for the current call.
  }
}

function loadDemoMealTimes(): MealTimes | null {
  try {
    const raw = window.localStorage.getItem(DEMO_MEAL_TIMES_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isMealTimes(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isMealTimes(value: unknown): value is MealTimes {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.seniorId === 'string' &&
    typeof candidate.breakfast === 'string' &&
    typeof candidate.lunch === 'string' &&
    typeof candidate.dinner === 'string' &&
    (typeof candidate.updatedAt === 'string' || candidate.updatedAt === null)
  );
}

function saveDemoNotificationSettings(settings: NotificationSettings): void {
  try {
    window.localStorage.setItem(DEMO_NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // localStorage may be unavailable; settings still work for the current call.
  }
}

function loadDemoNotificationSettings(): NotificationSettings | null {
  try {
    const raw = window.localStorage.getItem(DEMO_NOTIFICATION_SETTINGS_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isNotificationSettings(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isNotificationSettings(value: unknown): value is NotificationSettings {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.enabled === 'boolean' &&
    typeof candidate.remindIntervalMin === 'number' &&
    typeof candidate.maxRetries === 'number'
  );
}

// Re-export so pages can persist the senior phone alongside the ids after signup.
export { saveSession };
