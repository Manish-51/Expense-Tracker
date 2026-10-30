import { Injectable } from '@angular/core';

/**
 * Thin wrapper around window.localStorage with JSON (de)serialization
 * and safe fallbacks for SSR / storage errors.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  get<T>(key: string, fallback: T): T {
    if (!this.isBrowser()) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isBrowser()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable — fail silently, app still works in-memory
    }
  }

  remove(key: string): void {
    if (!this.isBrowser()) return;
    window.localStorage.removeItem(key);
  }
}
