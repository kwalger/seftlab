'use client';

import { createJSONStorage, type StateStorage } from 'zustand/middleware';

const asyncSafeStateStorage: StateStorage = {
  getItem: (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') {
      return Promise.resolve(null);
    }
    return Promise.resolve().then(() => {
      try {
        return window.localStorage.getItem(name);
      } catch {
        return null;
      }
    });
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // تجاهل أخطاء التخزين في التصفح الخاص أو عند امتلاء السعة
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      // تجاهل أخطاء التخزين
    }
  },
};

/**
 * تخزين مؤجّل بمهمة صغرى واحدة يمنع تضارب التصيير (Hydration Mismatch) مع Next.js
 */
export const ssrSafeLocalStorage = createJSONStorage(
  () => asyncSafeStateStorage
);
