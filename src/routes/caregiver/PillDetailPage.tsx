import { BackHeader, Card, DemoImage } from '../../components/ui';
import { caregiverBoard, confirmMedsView, refillStatus } from '../../lib/mock';

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
      <div className="space-y-4 px-6">
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

        <Card className="p-4">
          <h2 className="text-base font-bold text-stone-900">처방·조제 정보</h2>
          <dl className="mt-3 space-y-3">
            <InfoRow label="처방 병원" value={refillStatus.hospitalName} />
            <InfoRow label="조제 약국" value={refillStatus.pharmacyName} />
            <InfoRow label="처방·조제일" value={confirmMedsView.prescribedDateLabel} />
            <InfoRow label="약국 주소" value={refillStatus.pharmacyAddress ?? '주소 준비 중'} />
          </dl>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <a
              href={`tel:${refillStatus.hospitalPhone.replace(/-/g, '')}`}
              className="flex min-h-12 items-center justify-center rounded-2xl bg-brand-600 px-2 text-sm font-bold text-white"
            >
              병원 전화
            </a>
            <a
              href={`tel:${(refillStatus.pharmacyPhone ?? '').replace(/-/g, '')}`}
              className="flex min-h-12 items-center justify-center rounded-2xl bg-brand-50 px-2 text-sm font-bold text-brand-700"
            >
              약국 전화
            </a>
            <button
              type="button"
              onClick={() => {}}
              className="min-h-12 rounded-2xl border border-stone-200 bg-white px-2 text-sm font-bold text-stone-700"
            >
              지도 보기
            </button>
          </div>
        </Card>

        <section>
          <h2 className="mb-2 text-base font-bold text-stone-500">약별 남은 개수</h2>
          <ul className="space-y-2.5">
            {meds.map((med) => {
              const medicine = confirmMedsView.medicines?.find((item) => item.name === med.name);
              return (
                <li
                  key={med.name}
                  className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm"
                >
                  <DemoImage
                    src={medicine?.image ?? ''}
                    alt={`${med.name} 사진`}
                    className="h-16 w-16 rounded-2xl object-cover"
                    fallback={
                      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-3xl">
                        💊
                      </span>
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-stone-900">{med.name}</p>
                    <p className="mt-0.5 text-sm text-stone-500">{medicine?.description}</p>
                    <p className="mt-1 text-sm text-stone-400">하루 {med.perDay}회</p>
                  </div>
                  <span className="text-lg font-extrabold text-stone-900">{med.remaining}개</span>
                </li>
              );
            })}
          </ul>
        </section>

        <p className="text-sm leading-relaxed text-stone-400">
          개수는 복용 확인 기록으로 추정한 값이에요. 약국 재처방 시 갱신됩니다.
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-sm font-semibold text-stone-400">{label}</dt>
      <dd className="text-right text-sm font-bold text-stone-800">{value}</dd>
    </div>
  );
}
