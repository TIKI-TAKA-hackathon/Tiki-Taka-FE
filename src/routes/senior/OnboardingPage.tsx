import { useNavigate } from 'react-router-dom';
import { PrimaryButton, SecondaryButton } from '../../components/ui';

export function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="gjb-hero-gradient relative isolate flex min-h-full flex-col overflow-hidden px-6 py-8">
      <img
        src="/brand/고찌봄 인사.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-[-4.75rem] top-14 z-0 h-72 w-auto opacity-95 drop-shadow-[var(--gjb-shadow-float)]"
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute inset-x-8 bottom-2 h-8 rounded-full bg-sea/20 blur-xl"
          />
          <img
            src="/brand/고찌봄 로고 잉크.svg"
            alt="고찌봄"
            className="relative h-24 w-auto drop-shadow-[0_6px_16px_rgba(42,39,36,.10)]"
          />
        </div>
        <p className="mt-6 text-lg text-ink-soft">보호자가 함께 챙기는 복약 안부</p>

        <div className="mt-10 w-full space-y-3">
          <PrimaryButton onClick={() => navigate('/caregiver/signup')}>보호자·복지사로 시작하기</PrimaryButton>
          <SecondaryButton onClick={() => navigate('/senior/register')}>어르신 기기로 시작하기</SecondaryButton>
        </div>
      </div>

      <div className="relative z-10 mt-6 flex flex-col items-center">
        <p className="text-center text-sm leading-relaxed text-stone-400">
          약을 추천하지 않습니다. 약국에서 등록한 복약 정보만 안내합니다.
        </p>
      </div>
    </div>
  );
}
