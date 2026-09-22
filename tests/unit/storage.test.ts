import { afterEach, describe, expect, it } from 'vitest';
import { loadFromStorage, saveToStorage } from '../../src/utils/storage';

const originalWindow = globalThis.window;

afterEach(() => {
  Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
});

describe('storage resilience', () => {
  it('returns the fallback when browser storage is absent or malformed', () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: undefined });
    expect(loadFromStorage('missing', { ready: false })).toEqual({ ready: false });
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: { getItem: () => '{invalid' } } });
    expect(loadFromStorage('broken', ['fallback'])).toEqual(['fallback']);
  });

  it('keeps the caller usable when a quota error prevents writing', () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: { setItem: () => { throw new Error('quota'); } } } });
    expect(() => saveToStorage('state', { value: 1 })).not.toThrow();
  });
});
