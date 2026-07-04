import { Outlet, useNavigate } from 'react-router-dom';
import { env } from '../lib/env';

// Real-service shell: full-screen app on mobile, centered app surface on desktop.
// No device bezel / fake status bar / role toggle — role is chosen at onboarding (auth later).
export function AppLayout() {
  const navigate = useNavigate();

  function resetDemo() {
    const keysToRemove: string[] = [];

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);

      if (key?.startsWith('gojjibom.')) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
    }

    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-[100dvh] bg-stone-100 sm:flex sm:items-center sm:justify-center sm:p-6">
      <div
        className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white sm:h-[min(880px,94vh)] sm:w-[430px] sm:rounded-[2.25rem] sm:shadow-xl sm:ring-1 sm:ring-black/5"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Outlet />
        </div>
        {env.demoMode ? (
          <div className="shrink-0 bg-white/95 px-4 pb-3 pt-2">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={resetDemo}
                className="rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[11px] font-semibold text-stone-400 shadow-sm backdrop-blur underline-offset-2 hover:text-stone-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sea-deep"
                aria-label="데모 발표용 초기화 버튼. 처음 화면으로 돌아가기"
              >
                데모용 · 처음 화면으로
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <footer className="sr-only" data-testid="api-base">
        API base: {env.apiBaseUrl}
      </footer>
    </div>
  );
}
