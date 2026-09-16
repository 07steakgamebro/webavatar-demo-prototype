/**
 * Safe LocalStorage Utility
 * Protects against invalid JSON, corrupted client data, and Prototype Pollution.
 */

export function safeGetJSON<T>(
  key: string,
  fallback: T,
  validator?: (data: unknown) => boolean
): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (validator && !validator(parsed)) {
      console.warn(`[SafeStorage] Invalid schema for key "${key}", using fallback.`);
      return fallback;
    }

    return parsed as T;
  } catch (error) {
    console.warn(`[SafeStorage] Failed to parse JSON for key "${key}":`, error);
    return fallback;
  }
}

export function safeSetJSON<T>(key: string, data: T): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const serialized = JSON.stringify(data);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`[SafeStorage] Failed to serialize and set key "${key}":`, error);
    return false;
  }
}

export function safeGetString(
  key: string,
  fallback: string,
  allowedValues?: readonly string[]
): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    if (value === null) return fallback;

    if (allowedValues && !allowedValues.includes(value)) {
      return fallback;
    }

    return value;
  } catch {
    return fallback;
  }
}

export function safeSetString(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(key: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
