import { NextRequest, NextResponse } from "next/server";
import { readBudget, upsertLineItem } from "@/lib/budgetStore";

// GET /api/budget — current budget, read from the server-side store.
export async function GET() {
  const budget = await readBudget();
  return NextResponse.json(budget);
}

// POST /api/budget — upsert a single line item { categoryId, scope, amount }.
// Validated server-side rather than trusting the client shape blindly.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { categoryId, scope, amount } = body ?? {};

  if (typeof categoryId !== "string" || !categoryId) {
    return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
  }
  if (typeof scope !== "string" || !scope) {
    return NextResponse.json({ error: "scope is required" }, { status: 400 });
  }
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "amount must be a finite number" }, { status: 400 });
  }

  const budget = await upsertLineItem(categoryId, scope, amount);
  return NextResponse.json(budget);
}
