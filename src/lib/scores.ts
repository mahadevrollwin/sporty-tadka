"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadBest(key: string): number | null {
  try {
    const value = localStorage.getItem(key);
    return value ? Number.parseInt(value, 10) : null;
  } catch {
    return null;
  }
}

export function saveBest(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value));
    emit();
  } catch {
    /* storage can be blocked */
  }
}

export function useBest(key: string) {
  return useSyncExternalStore(
    subscribe,
    () => loadBest(key),
    () => null,
  );
}
