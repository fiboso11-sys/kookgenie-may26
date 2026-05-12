"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "kookgenie-grocery";

type GroceryContextValue = {
  items: string[];
  addItems: (next: string[]) => void;
  removeItem: (item: string) => void;
  clear: () => void;
};

const GroceryContext = createContext<GroceryContextValue | null>(null);

function loadInitial(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function GroceryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadInitial());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItems = useCallback((next: string[]) => {
    setItems((prev) => {
      const set = new Set(prev.map((s) => s.toLowerCase()));
      const merged = [...prev];
      for (const n of next) {
        const t = n.trim();
        if (!t) continue;
        const key = t.toLowerCase();
        if (!set.has(key)) {
          set.add(key);
          merged.push(t);
        }
      }
      return merged;
    });
  }, []);

  const removeItem = useCallback((item: string) => {
    setItems((prev) => prev.filter((i) => i !== item));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, addItems, removeItem, clear }),
    [items, addItems, removeItem, clear],
  );

  return <GroceryContext.Provider value={value}>{children}</GroceryContext.Provider>;
}

export function useGrocery() {
  const ctx = useContext(GroceryContext);
  if (!ctx) throw new Error("useGrocery must be used within GroceryProvider");
  return ctx;
}
