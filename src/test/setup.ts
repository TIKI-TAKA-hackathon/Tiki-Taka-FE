import '@testing-library/jest-dom/vitest';

const storageState = new Map<string, string>();

const testStorage: Storage = {
  get length() {
    return storageState.size;
  },
  clear: () => storageState.clear(),
  getItem: (key: string) => storageState.get(key) ?? null,
  key: (index: number) => Array.from(storageState.keys())[index] ?? null,
  removeItem: (key: string) => {
    storageState.delete(key);
  },
  setItem: (key: string, value: string) => {
    storageState.set(key, value);
  },
};

Object.defineProperty(window, 'localStorage', {
  value: testStorage,
  configurable: true,
});
