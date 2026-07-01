import { BackHeader } from '../../components/ui';
import { caregiverBoard } from '../../lib/mock';

const meds = [
  { name: '혈압약', remaining: 3, perDay: 1 },
  { name: '당뇨약', remaining: 8, perDay: 2 },
  { name: '위장약', remaining: 5, perDay: 1 },
];

export function PillDetailPage() {
  const { pills } = caregiverBoard;

  return (
    <div className="flex min-h-full flex-col pb-8">
      <BackHeader title="약 개수 상세" />
      <div className="px-6">
        <div className="grid grid-cols-3 gap-2">
          {[
            { big: `${pills.remaining}개`, small: '남은 개수' },
            { big: pills.runOutDate, small: '예상 소진일' },
            { big: pills.refillDDay, small: '재처방 D-day' },
          ].map((stat) => (
            <div key={stat.small} className="rounded-2xl bg-stone-50 px-2 py-3 text-center">
              <p className="text-lg font-extrabold text-stone-900">{stat.big}</p>
              <p className="mt-1 text-xs text-stone-400">{stat.small}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-2 mt-5 text-base font-bold text-stone-500">약별 남은 개수</h2>
        <ul className="space-y-2.5">
          {meds.map((med) => (
            <li
              key={med.name}
              className="flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-bold text-stone-900">{med.name}</p>
                <p className="text-sm text-stone-400">하루 {med.perDay}회</p>
              </div>
              <span className="text-lg font-extrabold text-stone-900">{med.remaining}개</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-400">
          개수는 복용 확인 기록으로 추정한 값이에요. 약국 재처방 시 갱신됩니다.
        </p>
      </div>
    </div>
  );
}
