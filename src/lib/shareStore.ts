import { useSyncExternalStore } from 'react';

export type DosePhoto = { dataUrl: string; doseLabel: string; at: string };

// In-memory session store: senior shares a dose photo, caregiver reads it.
// Also persisted to localStorage so the photo survives a reload / navigating to
// the caregiver view during a demo. Real cross-device propagation will go through
// the backend (see specs/003 §6).
const STORAGE_KEY = 'gochibom.sharedDosePhoto';

function hasStorage(): boolean {
  // Guard for SSR/jsdom or blocked storage (private mode).
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStored(): DosePhoto | null {
  if (!hasStorage()) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<DosePhoto>;
    if (typeof parsed.dataUrl === 'string' && parsed.dataUrl.length > 0) {
      return {
        dataUrl: parsed.dataUrl,
        doseLabel: typeof parsed.doseLabel === 'string' ? parsed.doseLabel : '',
        at: typeof parsed.at === 'string' ? parsed.at : '',
      };
    }
  } catch {
    // Ignore malformed/blocked storage; fall back to in-memory.
  }
  return null;
}

let current: DosePhoto | null = readStored();
const listeners = new Set<() => void>();

export function shareDosePhoto(photo: DosePhoto): void {
  current = photo;
  if (hasStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(photo));
    } catch {
      // Storage may be full or blocked; the in-memory value still drives the UI.
    }
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): DosePhoto | null {
  return current;
}

export function useSharedDosePhoto(): DosePhoto | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
