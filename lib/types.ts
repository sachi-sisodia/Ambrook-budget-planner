// Data model, deliberately kept separate from any "actuals"/ledger concept.
//
// This mirrors a real design constraint Ambrook's own support docs call out:
// hypothetical/budgeted numbers must never be entered into the ledger itself,
// because that would corrupt real bookkeeping and reporting accuracy. So a
// Budget here is its own entity that *references* categories and enterprises,
// and is only ever joined against actuals at read time — never merged with them.

export type EntityId = string;

export interface Enterprise {
  id: EntityId;
  name: string;
  // A short unit label used in production-linked framing (v2 groundwork).
  // e.g. "head" for cattle, "acres" for hay, "units" for equipment rental.
  unit: string;
}

export type CategoryKind = "expense" | "revenue";

export interface Category {
  id: EntityId;
  name: string;
  kind: CategoryKind;
  // Loosely mirrors an IRS Schedule F line, matching Ambrook's existing
  // chart-of-accounts / Schedule F alignment rather than inventing a new taxonomy.
  scheduleFLine?: string;
}

export interface Transaction {
  id: EntityId;
  date: string; // ISO date
  categoryId: EntityId;
  enterpriseId: EntityId;
  amount: number; // positive = revenue, negative = expense, in USD
  description: string;
}

export type BudgetScope = "company" | EntityId; // "company" or a specific enterprise id

export interface BudgetLineItem {
  id: EntityId;
  categoryId: EntityId;
  scope: BudgetScope;
  amount: number; // planned amount for the period, signed like Transaction.amount
}

export interface Budget {
  id: EntityId;
  name: string;
  // Deliberately not locked to a calendar year — farm seasons don't run
  // January-December, and Figured's model treats this as a first-class
  // requirement rather than an edge case.
  periodStart: string;
  periodEnd: string;
  lineItems: BudgetLineItem[];
}

export interface VarianceRow {
  categoryId: EntityId;
  categoryName: string;
  scope: BudgetScope;
  budgeted: number;
  actual: number;
  variance: number; // actual - budgeted
  percentUsed: number | null; // null when budgeted is 0 (avoid div/0)
}
