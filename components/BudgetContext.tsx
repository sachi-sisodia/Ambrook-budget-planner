"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Budget } from "@/lib/types";

interface BudgetContextValue {
  budget: Budget | null;
  loading: boolean;
  updateLineItem: (categoryId: string, scope: string, amount: number) => Promise<void>;
  lastSavedAt: number | null;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  // Load the persisted budget from the server on first mount, instead of
  // seeding straight from the mock data module — this is the difference
  // between "looks like it works" and actually round-tripping through an API.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/budget")
      .then((res) => res.json())
      .then((data: Budget) => {
        if (!cancelled) setBudget(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateLineItem = async (categoryId: string, scope: string, amount: number) => {
    // Optimistic update so the input feels instant, reconciled with the
    // server's response once it lands.
    setBudget((prev) => {
      if (!prev) return prev;
      const existingIndex = prev.lineItems.findIndex(
        (li) => li.categoryId === categoryId && li.scope === scope
      );
      const nextLineItems = [...prev.lineItems];
      if (existingIndex >= 0) {
        nextLineItems[existingIndex] = { ...nextLineItems[existingIndex], amount };
      } else {
        nextLineItems.push({ id: `${categoryId}-${scope}-temp`, categoryId, scope, amount });
      }
      return { ...prev, lineItems: nextLineItems };
    });

    const res = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, scope, amount }),
    });
    const saved: Budget = await res.json();
    setBudget(saved);
    setLastSavedAt(Date.now());
  };

  const value = useMemo(
    () => ({ budget, loading, updateLineItem, lastSavedAt }),
    [budget, loading, lastSavedAt]
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used within BudgetProvider");
  return ctx;
}
