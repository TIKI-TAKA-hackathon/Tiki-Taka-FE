import type { ConfirmMedsSchedule, MealTimes } from './types';

type MealKey = 'breakfast' | 'lunch' | 'dinner';

export type PrescriptionAlarmPreview = {
  id: string;
  displayName: string;
  basisLabel: string;
  mealLabel: string;
  alarmLabel: string;
  pillText: string;
  packetLabel: string;
  repeatLabel: string;
};

const MEAL_LABEL: Record<MealKey, string> = {
  breakfast: '아침 식사',
  lunch: '점심 식사',
  dinner: '저녁 식사',
};

export function buildPrescriptionAlarmPreviews(
  schedules: ConfirmMedsSchedule[],
  mealTimes: MealTimes,
): PrescriptionAlarmPreview[] {
  return schedules.map((schedule) => {
    const mealKey = mealKeyForSchedule(schedule.displayName);
    const mealMinutes = timeToMinutes(mealTimes[mealKey]);
    const offset = offsetForBasis(schedule.doseBasis, schedule.offsetMin);
    const alarmMinutes = mealMinutes + offset;
    const mealLabel = `${MEAL_LABEL[mealKey]} ${formatKoreanTime(mealMinutes)} 기준`;

    return {
      id: `${schedule.displayName}-${schedule.dispensingNumber}`,
      displayName: schedule.displayName,
      basisLabel: basisLabel(schedule.doseBasis, schedule.offsetMin),
      mealLabel,
      alarmLabel: `${formatKoreanTime(alarmMinutes)} 알림`,
      pillText: `약 ${schedule.pillCount}개`,
      packetLabel: pouchLabelForSchedule(schedule.displayName, schedule.dispensingNumber),
      repeatLabel:
        schedule.dispensedDays > 1
          ? `${schedule.dispensedDays}일 동안 매일 같은 순서로 반복돼요.`
          : '오늘 복용할 봉지예요.',
    };
  });
}

export function pouchLabelForSchedule(displayName: string, fallbackNumber?: number): string {
  if (displayName.includes('아침')) {
    return '아침용 봉지';
  }
  if (displayName.includes('점심')) {
    return '점심용 봉지';
  }
  if (displayName.includes('저녁')) {
    return '저녁용 봉지';
  }
  if (displayName.includes('취침')) {
    return '취침 전 봉지';
  }
  return fallbackNumber ? `${fallbackNumber}번 봉지` : '복용 봉지';
}

function mealKeyForSchedule(displayName: string): MealKey {
  if (displayName.includes('아침')) {
    return 'breakfast';
  }
  if (displayName.includes('점심')) {
    return 'lunch';
  }
  return 'dinner';
}

function offsetForBasis(doseBasis: string, offsetMin: number): number {
  if (doseBasis.includes('식전')) {
    return -offsetMin;
  }
  if (doseBasis.includes('식후')) {
    return offsetMin;
  }
  return 0;
}

function basisLabel(doseBasis: string, offsetMin: number): string {
  return offsetMin > 0 ? `${doseBasis} ${offsetMin}분` : doseBasis;
}

function timeToMinutes(time: string): number {
  const [hour = '0', minute = '0'] = time.split(':');
  return Number(hour) * 60 + Number(minute);
}

function formatKoreanTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const period = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 || 12;
  return minute === 0 ? `${period} ${hour12}시` : `${period} ${hour12}시 ${minute}분`;
}
