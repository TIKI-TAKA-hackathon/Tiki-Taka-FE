import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { env } from '../lib/env';

function StatusBar() {
  return (
    <div className="relative flex h-11 shrink-0 items-center justify-between px-7 pt-2 text-sm font-semibold text-stone-900">
      <span>9:41</span>
      <div className="absolute left-1/2 top-2 h-7 w-24 -translate-x-1/2 rounded-full bg-black" />
      <div className="flex items-center gap-1.5">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2" width="3" height="10" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" opacity="0.35" />
        </svg>
        <svg width="26" height="13" viewBox="0 0 26 13" aria-hidden>
          <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" opacity="0.5" />
          <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
          <rect x="24" y="4.5" width="2" height="4" rx="1" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

const ROLE_TABS = [
  { key: 'senior', label: '어르신', to: '/senior' },
  { key: 'caregiver', label: '보호자·복지사', to: '/caregiver' },
] as const;

export function PhoneShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.pathname.startsWith('/caregiver') ? 'caregiver' : 'senior';

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 bg-stone-100 px-4 py-6">
      <div className="inline-flex rounded-full bg-stone-200/70 p-1">
        {ROLE_TABS.map((tab) => {
          const active = role === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(tab.to)}
              aria-pressed={active}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                active ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="w-[414px] max-w-full rounded-[3.2rem] bg-black p-3 shadow-2xl">
        <div className="relative flex h-[812px] w-full flex-col overflow-hidden rounded-[2.6rem] bg-white">
          <StatusBar />
          <div className="flex flex-1 flex-col overflow-y-auto">
            <Outlet />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
            <div className="h-1.5 w-32 rounded-full bg-black/70" />
          </div>
        </div>
      </div>

      <footer className="sr-only" data-testid="api-base">
        API base: {env.apiBaseUrl}
      </footer>
    </div>
  );
}
