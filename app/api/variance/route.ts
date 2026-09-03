import { NextRequest, NextResponse } from "next/server";
import { readBudget } from "@/lib/budgetStore";
import { categories, transactions, asOfDate } from "@/lib/mockData";
import { computeVariance } from "@/lib/variance";
import { BudgetScope } from "@/lib/types";

// GET /api/variance?scope=cattle|hay|equip|company
//
// The variance computation itself (lib/variance.ts) is plain TypeScript
// with no framework dependency, so the exact same function that could run
// client-side also runs here, server-side, against the persisted budget —
// this route is what makes it a real read endpoint instead of a
// client-only calculation.
export async function GET(req: NextRequest) {
  const scopeParam = req.nextUrl.searchParams.get("scope") ?? "company";
  const scope: BudgetScope = scopeParam;

  const budget = await readBudget();
  const rows = computeVariance(budget, transactions, categories, scope, asOfDate);

  return NextResponse.json({ scope, asOfDate, rows });
}
