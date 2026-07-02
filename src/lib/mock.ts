import type {
  CareGroup,
  CaregiverBoard,
  ChangeLog,
  ConfirmMedsView,
  Dose,
  DosePhoto,
  InviteLink,
  MealTimes,
  NotificationSettings,
  SeniorDay,
} from './types';

const doses: Dose[] = [
  {
    id: 'morning',
    label: '아침약',
    time: '08:30',
    mealTag: '식후 30분',
    pillCount: 3,
    packetNo: 1,
    status: 'done',
    note: '3개 모두 드셨어요',
  },
  {
    id: 'lunch',
    label: '점심약',
    time: '12:00',
    mealTag: '식전 30분',
    pillCount: 3,
    packetNo: 2,
    status: 'done',
    note: '3개 모두 드셨어요',
  },
  {
    id: 'dinner',
    label: '저녁약',
    time: '19:30',
    mealTag: '식후 30분',
    pillCount: 3,
    packetNo: 1,
    status: 'upcoming',
    note: '잠시 후 알림이 와요',
  },
];

export const seniorDay: SeniorDay = {
  dateLabel: '2026년 7월 2일 목요일',
  nextDose: {
    doseId: 'dinner',
    label: '저녁약 · 1번 봉지',
    alarmLabel: '오후 7:30',
    pillCount: 3,
    packetNo: 1,
    mealTag: '식후 30분',
    includesNote: '혈압약이 포함돼 있어요',
    baselineNote: '저녁 식사 오후 7시 기준',
    spokenText: '저녁 식사 30분 후, 오후 7시 30분입니다. 1번 봉지를 꺼내 약 3개를 모두 드세요.',
    doneTimeLabel: '오후 7:32',
    pills: [
      { id: 'p1', name: '흰색 동그란 약', shape: 'round', note: '작은 알약' },
      { id: 'p2', name: '노란색 긴 약', shape: 'oval', note: '타원형 알약' },
      { id: 'p3', name: '파란색 캡슐', shape: 'capsule', note: '긴 캡슐' },
    ],
  },
  doses,
};

export const caregiverBoard: CaregiverBoard = {
  patientName: '어머니',
  circle: { family: 2, social: 1 },
  doses,
  confirmations: [
    { doseLabel: '아침약', status: 'done', detail: '08:32 · 음성 확인' },
    { doseLabel: '점심약', status: 'done', detail: '12:08 · 버튼 확인' },
    { doseLabel: '저녁약', status: 'upcoming' },
  ],
  pills: { remaining: 3, runOutDate: '7월 14일', refillDDay: 'D-13' },
  week: [
    { label: '월', status: 'done' },
    { label: '화', status: 'done' },
    { label: '수', status: 'done' },
    { label: '목', status: 'done' },
    { label: '금', status: 'done' },
    { label: '토', status: 'warn' },
    { label: '일', status: 'none' },
  ],
  alert: {
    doseLabel: '저녁약',
    lastAlarm: '오후 7:30',
    retries: 3,
    minutesElapsed: 15,
    steps: ['1차 +5분', '2차 10분', '3차 15분', '에스컬레이션'],
  },
};

// Demo-fallback fixture for the care group (used when the backend is down or in demo mode).
export const careGroup: CareGroup = {
  id: 'demo-group',
  name: '우리 가족방',
  senior: { id: 'demo-senior', name: '어머니', userType: 'SENIOR' },
  members: [
    {
      id: 'demo-owner',
      user: { id: 'demo-owner', name: '김영수', userType: 'CAREGIVER' },
      role: 'OWNER',
      status: 'CONNECTED',
      joinedAt: '2026-06-20T09:00:00',
      isPrimary: true,
      viewerOnly: false,
    },
    {
      id: 'demo-family',
      user: { id: 'demo-family', name: '김지은', userType: 'CAREGIVER' },
      role: 'FAMILY',
      status: 'CONNECTED',
      joinedAt: '2026-06-21T10:00:00',
      isPrimary: false,
      viewerOnly: false,
    },
    {
      id: 'demo-social',
      user: { id: 'demo-social', name: '행복복지관', userType: 'CAREGIVER' },
      role: 'SOCIAL_WORKER',
      status: 'CONNECTED',
      joinedAt: '2026-06-22T11:00:00',
      isPrimary: false,
      viewerOnly: true,
    },
  ],
};

export const mealTimes: MealTimes = {
  seniorId: 'demo-senior',
  breakfast: '08:00:00',
  lunch: '12:00:00',
  dinner: '19:00:00',
  updatedAt: '2026-06-25T08:00:00',
};

export const notificationSettings: NotificationSettings = {
  enabled: true,
  remindIntervalMin: 10,
  maxRetries: 3,
};

// Demo-fallback fixture for the prescription QR lookup (confirm-meds view).
export const confirmMedsView: ConfirmMedsView = {
  seniorDisplayName: '김순자',
  prescribedDateLabel: '2026년 6월 25일',
  pharmacyName: '행복약국',
  schedules: [
    {
      displayName: '아침약',
      timesPerDay: 3,
      doseBasis: '식후',
      offsetMin: 30,
      pillCount: 3,
      dispensedDays: 30,
      dispensingNumber: 1,
    },
    {
      displayName: '점심약',
      timesPerDay: 3,
      doseBasis: '식후',
      offsetMin: 30,
      pillCount: 2,
      dispensedDays: 30,
      dispensingNumber: 2,
    },
    {
      displayName: '저녁약',
      timesPerDay: 3,
      doseBasis: '식후',
      offsetMin: 30,
      pillCount: 3,
      dispensedDays: 30,
      dispensingNumber: 3,
    },
  ],
};

// Small inline placeholder image so the gallery renders without network access (demo + tests).
// A single flat-color SVG data-URI reused as both thumbnail and full photo.
function placeholderPhoto(label: string, bg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="320" height="320" fill="${bg}"/><text x="160" y="170" font-family="sans-serif" font-size="32" fill="#ffffff" text-anchor="middle">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Demo-fallback fixture for the caregiver photo gallery (WP2). One photo per dose_event.
export const dosePhotos: DosePhoto[] = [
  {
    doseEventId: 'de-morning',
    doseLabel: '아침약',
    takenAtLabel: '오전 8:32',
    status: 'done',
    method: 'voice',
    reviewStatus: 'reviewed',
    photoUrl: placeholderPhoto('아침약', '#3b5bdb'),
    thumbnailUrl: placeholderPhoto('아침약', '#3b5bdb'),
  },
  {
    doseEventId: 'de-lunch',
    doseLabel: '점심약',
    takenAtLabel: '오후 12:08',
    status: 'done',
    method: 'button',
    reviewStatus: 'pending',
    photoUrl: placeholderPhoto('점심약', '#1c8f4d'),
    thumbnailUrl: placeholderPhoto('점심약', '#1c8f4d'),
  },
  {
    doseEventId: 'de-dinner',
    doseLabel: '저녁약',
    takenAtLabel: '오후 7:41',
    status: 'done',
    method: 'button',
    reviewStatus: 'flagged',
    photoUrl: placeholderPhoto('저녁약', '#b45309'),
    thumbnailUrl: placeholderPhoto('저녁약', '#b45309'),
  },
  {
    doseEventId: 'de-morning-prev',
    doseLabel: '아침약',
    takenAtLabel: '어제 오전 8:29',
    status: 'done',
    method: 'voice',
    reviewStatus: 'reviewed',
    photoUrl: placeholderPhoto('아침약', '#4f6bed'),
    thumbnailUrl: placeholderPhoto('아침약', '#4f6bed'),
  },
];

export const inviteLink: InviteLink = {
  token: 'demo-invite-token',
  expiresAt: null,
  maxUses: null,
  useCount: 0,
};

export const changeLog: ChangeLog[] = [
  {
    id: 'log-1',
    action: 'MEAL_TIMES_UPDATED',
    actorName: '김영수',
    detail: '저녁 식사시간을 오후 7:00으로 변경',
    createdAt: '2026-06-25T08:00:00',
  },
  {
    id: 'log-2',
    action: 'MEMBER_JOINED',
    actorName: '김지은',
    detail: '가족방에 참여',
    createdAt: '2026-06-21T10:00:00',
  },
];
