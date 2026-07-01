import { env } from './env';
import { caregiverBoard, seniorDay } from './mock';
import type { CaregiverBoard, SeniorDay } from './types';

// BE wraps every response as { data, error }.
type ApiEnvelope<T> = { data: T | null; error: { code?: string; message?: string } | null };

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  const body = (await response.json()) as ApiEnvelope<T>;
  if (body.error) {
    throw new Error(body.error.message ?? body.error.code ?? 'API error');
  }
  if (body.data === null || body.data === undefined) {
    throw new Error('API response has no data');
  }
  return body.data;
}

// Demo mode returns fixtures. Otherwise call the backend and fall back to fixtures on failure.
// Real endpoints will be specified at https://api.stdiodh.xyz/swagger-ui/index.html
async function load<T>(path: string, fixture: T): Promise<T> {
  if (env.demoMode) {
    return fixture;
  }
  try {
    return await getJson<T>(path);
  } catch {
    return fixture;
  }
}

export function fetchSeniorDay(): Promise<SeniorDay> {
  return load('/senior/today', seniorDay);
}

export function fetchCaregiverBoard(): Promise<CaregiverBoard> {
  return load('/caregiver/board', caregiverBoard);
}
