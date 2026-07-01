import { useSyncExternalStore } from 'react';

export type DosePhoto = { dataUrl: string; doseLabel: string; at: string };

// In-memory session store: senior shares a dose photo, caregiver reads it.
// Real cross-device propagation will go through the backend (see specs/003 §6).
let current: DosePhoto | null = null;
const listeners = new Set<() => void>();

export function shareDosePhoto(photo: DosePhoto): void {
  current = photo;
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
