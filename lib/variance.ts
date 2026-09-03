import { Budget, BudgetScope, Category, Transaction, VarianceRow } from "./types";

/**
 * Joins a Budget against actual Transactions at read time.
 *
 * Deliberately a pure, read-side computation — nothing here writes back to
 * the transaction ledger or mutates budget data. This mirrors a constraint
 * Ambrook's own help docs state explicitly: forecasted/budgeted figures must
 * never be entered as real transactions, since that would corrupt actual
 * bookkeeping and reporting. Keeping variance as a derived view (Budget +
 * Transactions -> VarianceRow[]) rather than a stored/merged value is what
 * makes that guarantee hold structurally, not just by convention.
 */
export function computeVariance(
  budget: Budget,
  transactions: Transaction[],
  categories: Category[],
  scope: BudgetScope,
  asOfDate: string
): VarianceRow[] {
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const relevantTx = transactions.filter((t) => {
    const inScope = scope === "company" ? true : t.enterpriseId === scope;
    const inPeriod =
      t.date >= budget.periodStart && t.date <= budget.periodEnd && t.date <= asOfDate;
    return inScope && inPeriod;
  });

  const relevantLineItems = budget.lineItems.filter((li) =>
    scope === "company" ? true : li.scope === scope
  );

  // One row per category that appears in either the budget or the actuals,
  // so a category with actuals but no budget still surfaces (an unbudgeted
  // expense is exactly the kind of thing a farmer would want flagged, not
  // silently dropped).
  const categoryIds = new Set<string>([
    ...relevantLineItems.map((li) => li.categoryId),
    ...relevantTx.map((t) => t.categoryId),
  ]);

  const rows: VarianceRow[] = Array.from(categoryIds).map((categoryId) => {
    const budgeted = relevantLineItems
      .filter((li) => li.categoryId === categoryId)
      .reduce((sum, li) => sum + li.amount, 0);

    const actual = relevantTx
      .filter((t) => t.categoryId === categoryId)
      .reduce((sum, t) => sum + t.amount, 0);

    const variance = actual - budgeted;
    const percentUsed = budgeted !== 0 ? Math.abs(actual / budgeted) * 100 : null;

    return {
      categoryId,
      categoryName: categoryById.get(categoryId)?.name ?? categoryId,
      scope,
      budgeted,
      actual,
      variance,
      percentUsed,
    };
  });

  // Expenses first (most actionable — "am I overspending"), then revenue,
  // each sorted by magnitude of variance so the biggest surprises float up.
  return rows.sort((a, b) => {
    const aIsExpense = a.budgeted <= 0 && a.actual <= 0;
    const bIsExpense = b.budgeted <= 0 && b.actual <= 0;
    if (aIsExpense !== bIsExpense) return aIsExpense ? -1 : 1;
    return Math.abs(b.variance) - Math.abs(a.variance);
  });
}

export function formatUSD(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
