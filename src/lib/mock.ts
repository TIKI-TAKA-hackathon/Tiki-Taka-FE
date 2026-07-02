import type {
  AppNotification,
  CareGroup,
  CaregiverBoard,
  ChangeLog,
  ConfirmMedsView,
  Dose,
  DosePhoto,
  InviteLink,
  MealTimes,
  NotificationSettings,
  RefillStatus,
  SeniorDay,
  Weather,
} from './types';
import { DEMO_DAYS, DEMO_IMG } from './demoImages';

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

// 약 소진 → 병원 재처방 안내 (mock-only). Demo set: 약이 다 떨어진 상태(depleted).
export const refillStatus: RefillStatus = {
  daysTotal: 30,
  daysRemaining: 0,
  depleted: true,
  hospitalName: '제주한라병원',
  hospitalAddress: '제주특별자치도 제주시 도령로 65',
  hospitalPhone: '064-740-5000',
  pharmacyName: '늘푸른약국',
};

// 제주 우천 알림 (mock weather). Demo set: 비.
// TODO: 실제 날씨는 기상청 동네예보 / 제주 지자체 오픈 API로 대체 (현재는 데모용 고정값).
export const jejuWeather: Weather = {
  region: '제주',
  condition: 'rain',
  label: '비',
  tempC: 19,
  advisory: '오늘 제주에 비가 와요. 외출·병원 방문은 내일로 미루세요.',
};

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
      { id: 'p1', name: '흰색 동그란 약', shape: 'round', note: '작은 알약', image: DEMO_IMG.pillWhite },
      { id: 'p2', name: '노란색 긴 약', shape: 'oval', note: '타원형 알약', image: DEMO_IMG.pillYellow },
      { id: 'p3', name: '파란색 캡슐', shape: 'capsule', note: '긴 캡슐', image: DEMO_IMG.pillBlue },
    ],
  },
  doses,
  refill: refillStatus,
  weather: jejuWeather,
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

// Demo-fallback fixture for the caregiver photo gallery (WP2). One photo per dose_event,
// built from the real 7-day "복용 완료(taken)" 인증 set (see src/lib/demoImages.ts).
// Newest first (day7 → day1); every item is 복용 완료 (status 'done', reviewStatus 'reviewed').
export const dosePhotos: DosePhoto[] = [...DEMO_DAYS]
  .reverse()
  .map((day) => ({
    doseEventId: `de-${day.id}`,
    doseLabel: `${day.slot} · ${day.mgmtNo}`,
    takenAtLabel: day.takenAtLabel,
    status: 'done',
    reviewStatus: 'reviewed',
    photoUrl: day.path,
    thumbnailUrl: day.path,
  }));

export const inviteLink: InviteLink = {
  token: 'demo-invite-token',
  expiresAt: null,
  maxUses: null,
  useCount: 0,
};

// Demo-fallback fixture for in-app notifications (newest first, mixed read state).
export const notifications: AppNotification[] = [
  {
    id: 'notif-refill',
    type: 'escalation',
    level: 'high',
    title: '어머니 약이 소진됐어요',
    body: `${refillStatus.hospitalName} 재처방이 필요해요. 처방을 도와주세요.`,
    createdAtLabel: '오전 9:00',
    read: false,
  },
  {
    id: 'notif-weather',
    type: 'reminder',
    level: 'info',
    title: '☔ 제주 우천 — 재처방 방문 내일 권장',
    body: '오늘 제주에 비가 와요. 병원 방문은 내일로 권해요.',
    createdAtLabel: '오전 9:00',
    read: false,
  },
  {
    id: 'notif-1',
    type: 'escalation',
    level: 'high',
    title: '저녁약 확인이 아직 없어요',
    body: '재알림 3회 후에도 확인이 없어 가족에게 안내를 보냈어요.',
    createdAtLabel: '오후 7:45',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'missed',
    level: 'warn',
    title: '저녁약 미확인',
    body: '오후 7:30 저녁약 알림에 아직 확인이 없어요.',
    createdAtLabel: '오후 7:35',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'reminder',
    level: 'info',
    title: '저녁약 드실 시간이에요',
    body: '1번 봉지 약 3개를 드세요.',
    createdAtLabel: '오후 7:30',
    read: true,
  },
  {
    id: 'notif-4',
    type: 'reminder',
    level: 'info',
    title: '점심약 확인됨',
    body: '버튼으로 복용을 확인했어요.',
    createdAtLabel: '오후 12:08',
    read: true,
  },
];

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
