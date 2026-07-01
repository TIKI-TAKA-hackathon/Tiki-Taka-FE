import { useNavigate } from 'react-router-dom';

export function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col px-6 pb-8 pt-2">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-brand-50 text-5xl">
          💊
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-stone-900">고찌봄</h1>
        <p className="mt-3 text-lg text-stone-500">가족이 함께 챙기는 복약 안부</p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => navigate('/caregiver')}
          className="w-full rounded-2xl bg-brand-600 py-4 text-lg font-bold text-white shadow-sm transition active:scale-[0.99]"
        >
          보호자·복지사로 시작하기
        </button>
        <button
          type="button"
          onClick={() => navigate('/senior/register')}
          className="w-full rounded-2xl border-2 border-stone-200 py-4 text-lg font-bold text-stone-800 transition active:scale-[0.99]"
        >
          어르신 기기로 시작하기
        </button>
      </div>

      <button
        type="button"
        onClick={() => navigate('/senior/login')}
        className="mt-6 text-base font-semibold text-stone-500 underline underline-offset-4"
      >
        이미 계정이 있어요 · 로그인
      </button>
      <p className="mt-4 text-center text-sm leading-relaxed text-stone-400">
        약을 추천하지 않습니다. 약국에서 등록한 복약 정보만 안내합니다.
      </p>
    </div>
  );
}
