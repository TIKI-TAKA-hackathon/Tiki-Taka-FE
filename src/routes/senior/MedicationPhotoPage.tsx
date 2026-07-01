import { BackHeader } from '../../components/ui';
import { seniorDay } from '../../lib/mock';

export function MedicationPhotoPage() {
  const { nextDose } = seniorDay;

  return (
    <div className="flex min-h-full flex-col pb-8">
      <BackHeader title="약 사진" />
      <div className="flex flex-1 flex-col px-6">
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl bg-stone-100">
          <span className="text-7xl">💊</span>
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-stone-900">{nextDose.label}</h2>
        <p className="mt-1 text-base text-stone-500">
          🍽 {nextDose.mealTag} · 약 {nextDose.pillCount}개
        </p>
        <div className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-base font-semibold text-brand-700">
          💊 {nextDose.includesNote}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-400">
          약국에서 등록한 사진과 정보만 보여드려요. 실제 약과 다르면 약국에 문의하세요.
        </p>
      </div>
    </div>
  );
}
