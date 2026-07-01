import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackHeader } from '../../components/ui';

export function LoginPage() {
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate('/senior');
  }

  return (
    <div className="flex min-h-full flex-col pb-8">
      <BackHeader title="로그인" />
      <form className="flex flex-1 flex-col px-6" onSubmit={handleSubmit}>
        <label className="mt-2 text-base font-semibold text-stone-700" htmlFor="phone">
          휴대폰 번호
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          placeholder="010-0000-0000"
          className="mt-2 rounded-2xl border border-stone-200 px-4 py-3 text-lg"
        />
        <label className="mt-4 text-base font-semibold text-stone-700" htmlFor="code">
          인증 코드
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          placeholder="6자리 숫자"
          className="mt-2 rounded-2xl border border-stone-200 px-4 py-3 text-lg"
        />
        <button
          type="submit"
          className="mt-6 w-full rounded-2xl bg-brand-600 py-4 text-lg font-bold text-white shadow-sm"
        >
          로그인
        </button>
        <p className="mt-4 text-center text-sm text-stone-400">
          어르신 기기는 로그인 없이 QR·연결 코드로 시작할 수 있어요.
        </p>
      </form>
    </div>
  );
}
