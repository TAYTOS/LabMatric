// Deliberately isolate browser persistence. localStorage can throw when it is
// blocked, full, unavailable in private browsing, or contains malformed JSON.
// Callers always receive an in-memory fallback, so a storage failure never
// prevents the laboratory demo from remaining usable during this session.

export const STORAGE_KEYS = {
  session: 'courselab_session_user_id',
  onboardingDone: 'courselab_onboarding_done',
  users: 'courselab_users',
  groups: 'courselab_groups',
  enrollments: 'courselab_enrollments',
  notifications: 'courselab_notifications',
  preferences: 'labmatric_preferences'
} as const;

export function loadFromStorage<T>(key: string, fallback: T, validate?: (value: unknown) => value is T): T {
  try {
    if (typeof window === 'undefined') return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const value: unknown = JSON.parse(raw);
    if (validate ? !validate(value) : typeof value !== typeof fallback || value === null && fallback !== null || Array.isArray(value) !== Array.isArray(fallback)) return fallback;
    return value as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is optional for this local-only demonstration.
  }
}

export function removeFromStorage(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  } catch {
    // See loadFromStorage: callers continue with their in-memory state.
  }
}
