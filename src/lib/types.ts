export type DoseStatus = 'done' | 'upcoming' | 'missed';
export type ConfirmMethod = 'voice' | 'button';

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
