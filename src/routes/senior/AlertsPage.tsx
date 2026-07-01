import { BackHeader } from '../../components/ui';

const notifications = [
  { time: '오후 7:30', title: '저녁약 드실 시간이에요', body: '1번 봉지 약 3개를 드세요.' },
  { time: '오후 12:08', title: '점심약 확인됨', body: '버튼으로 복용을 확인했어요.' },
  { time: '오전 8:32', title: '아침약 확인됨', body: '음성으로 복용을 확인했어요.' },
];

export function AlertsPage() {
  return (
    <div className="flex min-h-full flex-col pb-8">
      <BackHeader title="알림함" />
      <ul className="space-y-3 px-6">
        {notifications.map((item) => (
          <li key={item.time} className="rounded-3xl border border-stone-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900">{item.title}</span>
              <span className="text-sm text-stone-400">{item.time}</span>
            </div>
            <p className="mt-1 text-base text-stone-500">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
