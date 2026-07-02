import type { CareGroup, CareGroupMember, MemberRole } from './types';

const STORAGE_KEY = 'gojjibom.caregiverMembers';
const REMOVED_STORAGE_KEY = 'gojjibom.removedCaregiverMembers';

export type LocalCaregiverMember = {
  id: string;
  careGroupId: string;
  name: string;
  phone: string;
  role: Extract<MemberRole, 'FAMILY' | 'SOCIAL_WORKER'>;
  status: 'INVITED' | 'CONNECTED';
};

export function addLocalCaregiverMember(input: Omit<LocalCaregiverMember, 'id' | 'status'>): LocalCaregiverMember {
  const members = loadLocalCaregiverMembers();
  const normalizedPhone = normalizePhone(input.phone);
  const next: LocalCaregiverMember = {
    ...input,
    id: `local-${Date.now()}`,
    phone: normalizedPhone,
    status: 'INVITED',
  };
  saveLocalCaregiverMembers([
    next,
    ...members.filter(
      (member) => member.careGroupId !== input.careGroupId || member.phone !== normalizedPhone,
    ),
  ]);
  return next;
}

export function findLocalCaregiverMemberByPhone(phone: string): LocalCaregiverMember | null {
  const normalizedPhone = normalizePhone(phone);
  return loadLocalCaregiverMembers().find((member) => member.phone === normalizedPhone) ?? null;
}

export function connectLocalCaregiverMember(id: string): LocalCaregiverMember | null {
  const members = loadLocalCaregiverMembers();
  const target = members.find((member) => member.id === id);
  if (!target) {
    return null;
  }
  const connected = { ...target, status: 'CONNECTED' as const };
  saveLocalCaregiverMembers(members.map((member) => (member.id === id ? connected : member)));
  return connected;
}

export function removeLocalCaregiverMember(id: string): void {
  const members = loadLocalCaregiverMembers();
  saveLocalCaregiverMembers(members.filter((member) => member.id !== id));
  saveRemovedCaregiverMemberIds([...new Set([...loadRemovedCaregiverMemberIds(), id])]);
}

export function mergeLocalCaregiverMembers(group: CareGroup): CareGroup {
  const removedIds = new Set(loadRemovedCaregiverMemberIds());
  const localMembers = loadLocalCaregiverMembers()
    .filter((member) => member.careGroupId === group.id)
    .filter((member) => !removedIds.has(member.id))
    .map(localCaregiverMemberToCareGroupMember);
  const localIds = new Set(localMembers.map((member) => member.id));
  return {
    ...group,
    members: [
      ...group.members.filter((member) => !localIds.has(member.id) && !removedIds.has(member.id)),
      ...localMembers,
    ],
  };
}

function loadLocalCaregiverMembers(): LocalCaregiverMember[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isLocalCaregiverMember) : [];
  } catch {
    return [];
  }
}

function saveLocalCaregiverMembers(members: LocalCaregiverMember[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch {
    // localStorage may be unavailable; member invite is demo-only best effort.
  }
}

function loadRemovedCaregiverMemberIds(): string[] {
  try {
    const raw = window.localStorage.getItem(REMOVED_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function saveRemovedCaregiverMemberIds(ids: string[]): void {
  try {
    window.localStorage.setItem(REMOVED_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage may be unavailable; member removal is demo-only best effort.
  }
}

export function localCaregiverMemberToCareGroupMember(member: LocalCaregiverMember): CareGroupMember {
  return {
    id: member.id,
    user: { id: member.id, name: member.name, userType: 'CAREGIVER' },
    role: member.role,
    status: member.status,
    joinedAt: member.status === 'CONNECTED' ? new Date().toISOString() : null,
    isPrimary: false,
    viewerOnly: member.role === 'SOCIAL_WORKER',
  };
}

function isLocalCaregiverMember(value: unknown): value is LocalCaregiverMember {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.careGroupId === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.phone === 'string' &&
    (candidate.role === 'FAMILY' || candidate.role === 'SOCIAL_WORKER') &&
    (candidate.status === 'INVITED' || candidate.status === 'CONNECTED')
  );
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}
