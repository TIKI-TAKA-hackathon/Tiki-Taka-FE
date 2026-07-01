import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { env } from '../lib/env';

const LARGE_TEXT_KEY = 'tikitaka-large-text';

export function Layout() {
  const [largeText, setLargeText] = useState(() => window.localStorage.getItem(LARGE_TEXT_KEY) === 'true');

  useEffect(() => {
    window.localStorage.setItem(LARGE_TEXT_KEY, String(largeText));
  }, [largeText]);

  return (
    <div className={largeText ? 'text-[1.16rem]' : 'text-base'}>
      <div className="min-h-screen bg-warm-50 text-stone-900">
        <header className="border-b border-warm-200 bg-white/85">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
            <Link to="/" className="text-xl font-bold text-warm-700">
              티키타카 기억카드
            </Link>
            <button
              type="button"
              aria-pressed={largeText}
              onClick={() => setLargeText((current) => !current)}
              className="rounded-lg border-2 border-leaf-500 bg-white px-4 py-3 font-semibold text-leaf-700 shadow-sm"
            >
              {largeText ? '기본 글씨' : '글씨 크게'}
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-8">
          <Outlet />
        </main>
        <footer className="sr-only" data-testid="api-base">
          API base: {env.apiBaseUrl}
        </footer>
      </div>
    </div>
  );
}
