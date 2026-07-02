import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 앱 최초 진입(스플래시): 메인화면.svg를 약 3초 노출 후 온보딩으로 자동 전환.
// 배경 그라데이션(--gjb-bg-main)이 먼저 그려져 1.6MB 마스코트 디코드가 첫 페인트를 막지 않는다.
const SPLASH_MS = 3000;

export function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/onboarding', { replace: true }), SPLASH_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  const skip = () => navigate('/onboarding', { replace: true });

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="고찌봄 시작 화면 · 눌러서 넘어가기"
      onClick={skip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') skip();
      }}
      className="gjb-splash relative flex min-h-full w-full cursor-pointer flex-col"
    >
      <img
        src="/brand/메인화면.svg"
        alt="고찌봄 — 제주가 함께 챙기는 복약 안부"
        decoding="async"
        className="gjb-splash-intro m-auto h-full w-full object-contain"
      />
      <p className="gjb-splash-intro absolute inset-x-0 bottom-8 text-center text-sm font-medium text-ink-soft">
        화면을 누르면 바로 시작해요
      </p>
    </div>
  );
}
