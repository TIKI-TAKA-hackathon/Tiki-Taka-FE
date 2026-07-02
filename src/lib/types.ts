export type DoseStatus = 'done' | 'upcoming' | 'missed';
export type ConfirmMethod = 'voice' | 'button';

export type PillShape = 'round' | 'oval' | 'capsule';
export type Pill = { id: string; name: string; shape: PillShape; note: string };

export type Dose = {
  id: string;
  label: string; // 아침약 / 점심약 / 저녁약
  time: string; // '08:30'
  mealTag: string; // '식후 30분'
  pillCount: number;
  packetNo: number;
  status: DoseStatus;
  note: string; // '3개 모두 드셨어요' | '잠시 후 알림이 와요'
};

export type NextDose = {
  doseId: string;
  label: string; // '저녁약 · 1번 봉지'
  alarmLabel: string; // '오후 7:30'
  pillCount: number;
  packetNo: number;
  mealTag: string; // '식후 30분'
  includesNote: string; // '혈압약이 포함돼 있어요'
  baselineNote: string; // '저녁 식사 오후 7시 기준'
  spokenText: string;
  doneTimeLabel: string; // '오후 7:32'
  pills: Pill[];
};

export type PillTracking = {
  remaining: number;
  runOutDate: string; // '7월 14일'
  refillDDay: string; // 'D-13'
};

export type WeekDayStatus = 'done' | 'warn' | 'none';
export type WeekDay = { label: string; status: WeekDayStatus };

export type ConfirmLog = {
  doseLabel: string;
  status: DoseStatus;
  detail?: string; // '08:32 · 음성 확인'
};

export type EscalationAlert = {
  doseLabel: string;
  lastAlarm: string; // '오후 7:30'
  retries: number;
  minutesElapsed: number;
  steps: string[];
};

export type CareCircle = { family: number; social: number };

export type SeniorDay = {
  dateLabel: string; // '2026년 7월 2일 목요일'
  nextDose: NextDose;
  doses: Dose[];
};

export type CaregiverBoard = {
  patientName: string; // '어머니'
  circle: CareCircle;
  doses: Dose[];
  confirmations: ConfirmLog[];
  pills: PillTracking;
  week: WeekDay[];
  alert: EscalationAlert | null;
};

// --- Care group / membership (BE contract) ---
export type UserType = 'SENIOR' | 'CAREGIVER';
export type MemberRole = 'OWNER' | 'FAMILY' | 'SOCIAL_WORKER';
export type MemberStatus = 'CONNECTED' | 'INVITED' | 'REMOVED';

export type CareGroupUser = {
  id: string;
  name: string;
  userType: UserType;
};

export type CareGroupMember = {
  id: string;
  user: CareGroupUser;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string | null;
  isPrimary: boolean;
  viewerOnly: boolean;
};

export type CareGroup = {
  id: string;
  name: string;
  senior: CareGroupUser;
  members: CareGroupMember[];
};

// POST /care-groups request body.
export type CreateCareGroupRequest = {
  name: string;
  senior: { name: string; phone: string; birthDate?: string };
  owner: { name: string; phone: string };
};

// --- Meal times (BE contract, LocalTime 'HH:mm:ss') ---
export type MealTimes = {
  seniorId: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  updatedAt: string | null;
};

export type UpdateMealTimesRequest = {
  actorUserId: string;
  breakfast: string;
  lunch: string;
  dinner: string;
};

// --- Invite links (BE contract) ---
export type InviteLink = {
  token: string;
  expiresAt: string | null;
  maxUses: number | null;
  useCount: number;
};

// --- Change log (BE contract) ---
export type ChangeLog = {
  id: string;
  action: string;
  actorName: string | null;
  detail: string | null;
  createdAt: string;
};

// --- Notification cadence (mock-only, no BE endpoint yet) ---
export type NotificationSettings = {
  enabled: boolean;
  remindIntervalMin: number;
  maxRetries: number;
};
