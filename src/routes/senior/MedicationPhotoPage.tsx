import { useNavigate } from 'react-router-dom';
import { BackHeader } from '../../components/ui';
import { seniorDay } from '../../lib/mock';
import type { PillShape } from '../../lib/types';

function PillIcon({ shape }: { shape: PillShape }) {
  if (shape === 'round') {
    return (
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-100">
        <span className="h-9 w-9 rounded-full border-[3px] border-stone-300 bg-white" />
      </span>
    );
  }
  if (shape === 'oval') {
    return (
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
        <span className="h-4 w-9 rounded-full bg-amber-300" />
      </span>
    );
  }
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
      <span className="flex h-9 w-9 flex-col overflow-hidden rounded-full">
        <span className="h-1/2 bg-blue-400" />
        <span className="h-1/2 bg-blue-300" />
      </span>
    </span>
  );
}

export function MedicationPhotoPage() {
  const navigate = useNavigate();
  const { pills } = seniorDay.nextDose;

  return (
    <div className="flex min-h-full flex-col pb-8">
      <BackHeader title="약 사진" />
      <div className="flex flex-1 flex-col px-6">
        <h1 className="text-3xl font-extrabold leading-snug text-stone-900">
          이 약들이
          <br />
          들어 있어요
        </h1>

        <ul className="mt-6 space-y-3">
          {pills.map((pill) => (
            <li
              key={pill.id}
              className="flex items-center gap-4 rounded-3xl border border-stone-100 bg-white p-4 shadow-sm"
            >
              <PillIcon shape={pill.shape} />
              <div>
                <p className="text-xl font-bold text-stone-900">{pill.name}</p>
                <p className="mt-0.5 text-base text-stone-400">{pill.note}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          <div className="rounded-2xl bg-brand-50 px-5 py-4 text-center text-base font-semibold leading-relaxed text-brand-700">
            약 이름을 외우지 않아도 괜찮아요.
            <br />
            봉지 안 약을 모두 드시면 됩니다.
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 w-full rounded-2xl bg-brand-600 py-4 text-lg font-bold text-white shadow-sm"
          >
            알겠습니다
          </button>
        </div>
      </div>
    </div>
  );
}
