// Local session store: keeps the ids the app needs to make real backend calls after signup.
// Persisted in localStorage so a reload keeps the same care group / senior / owner.
const STORAGE_KEY = 'gojjibom.session';

export type Session = {
  careGroupId: string;
  seniorId: string;
  ownerUserId: string;
  groupName?: string;
  ownerName?: string;
  seniorName?: string;
  // Kept locally so the senior phone-pairing flow can match on the same demo device
  // (BE has no "find care group by senior phone" endpoint yet).
  seniorPhone?: string;
};

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.careGroupId === 'string' &&
    typeof candidate.seniorId === 'string' &&
    typeof candidate.ownerUserId === 'string' &&
    optionalString(candidate.groupName) &&
    optionalString(candidate.ownerName) &&
    optionalString(candidate.seniorName) &&
    optionalString(candidate.seniorPhone)
  );
}

function optionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

export function saveSession(session: Session): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // localStorage may be unavailable (private mode / SSR); the flow still works in-memory for the session.
  }
}

export function loadSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
