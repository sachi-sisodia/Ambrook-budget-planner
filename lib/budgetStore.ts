import { promises as fs } from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { Budget, BudgetLineItem, BudgetScope } from "./types";
import { initialBudget } from "./mockData";

// Server-side persistence for the budget entity.
//
// Locally (no DATABASE_URL set) this falls back to a JSON file, so the app
// still runs with zero setup. In production it uses Postgres (Neon, via
// Vercel's storage integration) — the swap the footnote on the budget
// builder page describes. Either way, budget writes happen on the server,
// survive a restart, and are never mixed into transaction/actuals data,
// which lives only in mockData.ts and is never written to by this store.

const CONNECTION_STRING = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

// ---- File-backed store (local dev, no DB configured) ----

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "budget.json");

async function ensureSeededFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(initialBudget, null, 2), "utf-8");
  }
}

async function readBudgetFromFile(): Promise<Budget> {
  await ensureSeededFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as Budget;
}

async function upsertLineItemInFile(
  categoryId: string,
  scope: BudgetScope,
  amount: number
): Promise<Budget> {
  const budget = await readBudgetFromFile();
  const existingIndex = budget.lineItems.findIndex(
    (li) => li.categoryId === categoryId && li.scope === scope
  );

  if (existingIndex >= 0) {
    budget.lineItems[existingIndex] = { ...budget.lineItems[existingIndex], amount };
  } else {
    budget.lineItems.push({
      id: `${categoryId}-${scope}-${Date.now()}`,
      categoryId,
      scope,
      amount,
    });
  }

  await fs.writeFile(DATA_FILE, JSON.stringify(budget, null, 2), "utf-8");
  return budget;
}

// ---- Postgres-backed store (production) ----

const sql = CONNECTION_STRING ? neon(CONNECTION_STRING) : null;

let schemaReady: Promise<void> | null = null;

async function ensureSchema(): Promise<void> {
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS budget_line_items (
      id TEXT PRIMARY KEY,
      budget_id TEXT NOT NULL REFERENCES budgets(id),
      category_id TEXT NOT NULL,
      scope TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      UNIQUE (budget_id, category_id, scope)
    )
  `;

  const existing = await sql`SELECT id FROM budgets WHERE id = ${initialBudget.id}`;
  if (existing.length === 0) {
    await sql`
      INSERT INTO budgets (id, name, period_start, period_end)
      VALUES (${initialBudget.id}, ${initialBudget.name}, ${initialBudget.periodStart}, ${initialBudget.periodEnd})
    `;
    for (const li of initialBudget.lineItems) {
      await sql`
        INSERT INTO budget_line_items (id, budget_id, category_id, scope, amount)
        VALUES (${li.id}, ${initialBudget.id}, ${li.categoryId}, ${li.scope}, ${li.amount})
      `;
    }
  }
}

async function withSchema(): Promise<void> {
  if (!schemaReady) schemaReady = ensureSchema();
  await schemaReady;
}

async function readBudgetFromPostgres(): Promise<Budget> {
  await withSchema();
  const budgetRows = await sql!`SELECT * FROM budgets WHERE id = ${initialBudget.id}`;
  const budgetRow = budgetRows[0];
  const lineItemRows = await sql!`
    SELECT id, category_id, scope, amount
    FROM budget_line_items
    WHERE budget_id = ${initialBudget.id}
  `;

  const lineItems: BudgetLineItem[] = lineItemRows.map((r) => ({
    id: r.id as string,
    categoryId: r.category_id as string,
    scope: r.scope as BudgetScope,
    amount: Number(r.amount),
  }));

  return {
    id: budgetRow.id as string,
    name: budgetRow.name as string,
    periodStart: budgetRow.period_start as string,
    periodEnd: budgetRow.period_end as string,
    lineItems,
  };
}

async function upsertLineItemInPostgres(
  categoryId: string,
  scope: BudgetScope,
  amount: number
): Promise<Budget> {
  await withSchema();
  const id = `${categoryId}-${scope}-${Date.now()}`;
  await sql!`
    INSERT INTO budget_line_items (id, budget_id, category_id, scope, amount)
    VALUES (${id}, ${initialBudget.id}, ${categoryId}, ${scope}, ${amount})
    ON CONFLICT (budget_id, category_id, scope)
    DO UPDATE SET amount = EXCLUDED.amount
  `;
  return readBudgetFromPostgres();
}

// ---- Public API ----

export async function readBudget(): Promise<Budget> {
  return sql ? readBudgetFromPostgres() : readBudgetFromFile();
}

export async function upsertLineItem(
  categoryId: string,
  scope: BudgetScope,
  amount: number
): Promise<Budget> {
  return sql
    ? upsertLineItemInPostgres(categoryId, scope, amount)
    : upsertLineItemInFile(categoryId, scope, amount);
}
