export type DoseStatus = 'done' | 'upcoming' | 'missed';
export type ConfirmMethod = 'voice' | 'button';

export type PillShape = 'round' | 'oval' | 'capsule';
export type Pill = { id: string; name: string; shape: PillShape; note: string; image?: string };

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

// --- Notification cadence (BE contract: GET/PUT /seniors/{id}/notification-settings) ---
export type NotificationSettings = {
  enabled: boolean;
  remindIntervalMin: number;
  maxRetries: number;
};

// --- Prescription confirm-meds view (BE contract: GET /prescriptions:lookup?code=) ---
// One dosing schedule inside a prescription (아침/점심/저녁 등).
export type ConfirmMedsSchedule = {
  displayName: string; // '아침약' / '저녁약'
  timesPerDay: number; // 하루 횟수
  doseBasis: string; // 복용기준: '식후' / '식전' / '취침전'
  offsetMin: number; // 기준시각 대비 오프셋(분)
  pillCount: number; // 1회 복용 알약 수
  dispensedDays: number; // 조제일수
  dispensingNumber: number; // 조제번호(봉지 번호)
};

export type ConfirmMedsView = {
  seniorDisplayName: string; // '김순자'
  prescribedDateLabel: string; // '2026년 6월 25일'
  pharmacyName: string; // '행복약국'
  schedules: ConfirmMedsSchedule[];
};

// --- In-app notifications (WP3 contract) ---
// GET /seniors/{id}/notifications and GET /care-groups/{id}/notifications (BFF) return this item shape, newest first.
export type NotificationType = 'reminder' | 'missed' | 'escalation';

export type AppNotification = {
  id: string;
  type: NotificationType;
  level: string; // backend severity label; kept as a string so the FE stays tolerant.
  title: string;
  body: string;
  createdAtLabel: string; // '오후 7:30' — the backend may send createdAtLabel or a raw createdAt (normalized in api.ts).
  read: boolean;
};

// --- Caregiver photo gallery (BE contract: GET /care-groups/{id}/photos) ---
// Caregiver review state for a dose photo. Photos are reference-only, not proof of intake.
export type ReviewStatus = 'pending' | 'reviewed' | 'flagged';

// One photo per dose event (WP2 decision: 1 photo per dose_event).
export type DosePhoto = {
  doseEventId: string;
  doseLabel: string; // '아침약'
  takenAtLabel: string; // '오전 8:32'
  status: DoseStatus; // 'done' | 'upcoming' | 'missed'
  method?: ConfirmMethod; // 'voice' | 'button'
  reviewStatus: ReviewStatus;
  photoUrl: string;
  thumbnailUrl: string;
};

// GET /care-groups/{id}/photos response.
export type CaregiverPhotos = {
  careGroupId: string;
  photos: DosePhoto[];
};

// --- Prescription create (BE contract: POST /seniors/{id}/prescriptions) ---
// String unions mirror the BE enums; only the values the FE actually sends/reads are kept.
export type DoseSlot = 'MORNING' | 'LUNCH' | 'DINNER' | 'BEDTIME' | 'CUSTOM';
export type MealRelation = 'BEFORE_MEAL' | 'AFTER_MEAL' | 'WITH_MEAL' | 'NONE';
export type DoseBasis = 'BEFORE_MEAL' | 'AFTER_MEAL' | 'BEDTIME' | 'EMPTY_STOMACH' | 'FIXED';
export type DispensingType = 'POUCH' | 'ORGANIZER';
export type PrescriptionStatus = 'ACTIVE' | 'ENDED';

export type CreateDoseScheduleItemRequest = {
  medicationName: string;
  count: number;
};

export type CreateDoseScheduleRequest = {
  slot: DoseSlot;
  label: string;
  scheduledTime: string; // LocalTime 'HH:mm:ss'
  mealRelation: MealRelation;
  pillCount: number;
  doseBasis?: DoseBasis;
  items: CreateDoseScheduleItemRequest[];
};

export type CreatePrescriptionRequest = {
  pharmacistUserId: number;
  pharmacy: { name: string; phone: string; address?: string };
  prescribedDate: string; // LocalDate 'YYYY-MM-DD'
  startDate: string; // LocalDate 'YYYY-MM-DD'
  endDate?: string;
  dispensingType?: DispensingType;
  registrationCode?: string;
  schedules: CreateDoseScheduleRequest[];
};

// Subset of BE PrescriptionResponse — only the fields the FE reads.
export type PrescriptionResponse = {
  id: number;
  seniorId: number;
  status: PrescriptionStatus;
  registrationCode: string | null;
};
