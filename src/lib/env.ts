const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const DEFAULT_FRONTEND_BASE_URL = 'http://localhost:5173';

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') {
    return fallback;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error(`Invalid boolean env value: ${value}`);
}

function readUrl(value: string | undefined, fallback: string, key: string): string {
  const candidate = value && value.trim().length > 0 ? value : fallback;

  try {
    return new URL(candidate).toString().replace(/\/$/, '');
  } catch {
    throw new Error(`${key} must be a valid absolute URL.`);
  }
}

export const env = {
  apiBaseUrl: readUrl(import.meta.env.VITE_API_BASE_URL, DEFAULT_API_BASE_URL, 'VITE_API_BASE_URL'),
  frontendBaseUrl: readUrl(
    import.meta.env.VITE_FRONTEND_BASE_URL,
    typeof window === 'undefined' ? DEFAULT_FRONTEND_BASE_URL : window.location.origin,
    'VITE_FRONTEND_BASE_URL',
  ),
  demoMode: readBoolean(import.meta.env.VITE_DEMO_MODE, false),
} as const;
