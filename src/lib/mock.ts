import type { CaregiverBoard, Dose, SeniorDay } from './types';

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
