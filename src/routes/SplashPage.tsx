import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../components/ui';

export function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="gjb-splash relative flex min-h-full w-full flex-col overflow-hidden px-6 pb-8 pt-6">
      <img
        src="/brand/메인화면.svg"
        alt="고찌봄 — 제주가 함께 챙기는 복약 안부"
        decoding="async"
        className="gjb-splash-intro gjb-splash-art pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/90 to-white/0" />
      <div className="relative z-10 mt-auto w-full">
        <PrimaryButton onClick={() => navigate('/onboarding', { replace: true })}>고찌봄 시작하기</PrimaryButton>
      </div>
    </div>
  );
}
