import { Outlet } from 'react-router-dom';
import { env } from '../lib/env';

// Real-service shell: full-screen app on mobile, centered app surface on desktop.
// No device bezel / fake status bar / role toggle — role is chosen at onboarding (auth later).
export function AppLayout() {
  return (
    <div className="min-h-[100dvh] bg-stone-100 sm:flex sm:items-center sm:justify-center sm:p-6">
      <div
        className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white sm:h-[min(880px,94vh)] sm:w-[430px] sm:rounded-[2.25rem] sm:shadow-xl sm:ring-1 sm:ring-black/5"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex flex-1 flex-col overflow-y-auto">
          <Outlet />
        </div>
      </div>
      <footer className="sr-only" data-testid="api-base">
        API base: {env.apiBaseUrl}
      </footer>
    </div>
  );
}
