import { env } from './env';
import { caregiverBoard, seniorDay } from './mock';
import type { CaregiverBoard, SeniorDay } from './types';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
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
