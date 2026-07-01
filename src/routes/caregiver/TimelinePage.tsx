import { BackHeader } from '../../components/ui';

type Tone = 'neutral' | 'done' | 'warn';

const events: { time: string; label: string; tone: Tone }[] = [
  { time: '오전 8:30', label: '아침약 알림', tone: 'neutral' },
  { time: '오전 8:32', label: '아침약 복용 확인 (음성)', tone: 'done' },
  { time: '오후 12:00', label: '점심약 알림', tone: 'neutral' },
  { time: '오후 12:08', label: '점심약 복용 확인 (버튼)', tone: 'done' },
  { time: '오후 7:30', label: '저녁약 알림', tone: 'neutral' },
  { time: '오후 7:35', label: '재알림 1차', tone: 'warn' },
  { time: '오후 7:40', label: '재알림 2차', tone: 'warn' },
  { time: '오후 7:45', label: '재알림 3차 · 보호자 알림', tone: 'warn' },
];

const DOT: Record<Tone, string> = {
  neutral: 'bg-stone-300',
  done: 'bg-success-500',
  warn: 'bg-warn-500',
};

export function TimelinePage() {
  return (
    <div className="flex min-h-full flex-col pb-8">
      <BackHeader title="오늘 타임라인" />
      <ol className="px-6">
        {events.map((event, index) => (
          <li key={event.time + event.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className={`mt-1.5 h-3 w-3 rounded-full ${DOT[event.tone]}`} />
              {index < events.length - 1 && <span className="w-px flex-1 bg-stone-200" />}
            </div>
            <div className="pb-5">
              <p className="text-sm text-stone-400">{event.time}</p>
              <p className="text-base font-semibold text-stone-800">{event.label}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
