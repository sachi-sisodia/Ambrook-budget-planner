"use client";

import { useEffect, useMemo, useState } from "react";
import { EnterpriseTabs } from "@/components/EnterpriseTabs";
import { useBudget } from "@/components/BudgetContext";
import { categories, enterprises } from "@/lib/mockData";
import { BudgetScope, VarianceRow } from "@/lib/types";
import { formatUSD } from "@/lib/variance";

export default function VariancePage() {
  const { budget } = useBudget();
  const [scope, setScope] = useState<BudgetScope>("company");
  const [rows, setRows] = useState<VarianceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const scopeLabel =
    scope === "company"
      ? "Whole farm"
      : enterprises.find((e) => e.id === scope)?.name ?? scope;

  // Fetches computed variance from the server on every scope change (and
  // whenever the budget changes elsewhere, e.g. after an edit on the
  // Budget Builder page) rather than recomputing client-side — this is the
  // actual network round trip a "live" dashboard implies, not a simulation
  // of one.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/variance?scope=${encodeURIComponent(scope)}`)
      .then((res) => res.json())
      .then((data: { rows: VarianceRow[] }) => {
        if (!cancelled) setRows(data.rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // budget is included so a save on the Budget Builder page (which updates
    // the shared context after the server confirms it) triggers a refetch here.
  }, [scope, budget]);

  const totals = useMemo(() => {
    const expenseRows = rows.filter((r) => r.budgeted <= 0 && r.actual <= 0);
    const revenueRows = rows.filter((r) => !(r.budgeted <= 0 && r.actual <= 0));
    const budgetedExpense = expenseRows.reduce((s, r) => s + r.budgeted, 0);
    const actualExpense = expenseRows.reduce((s, r) => s + r.actual, 0);
    const actualRevenue = revenueRows.reduce((s, r) => s + r.actual, 0);
    return { budgetedExpense, actualExpense, actualRevenue };
  }, [rows]);

  const expenseVariance = totals.actualExpense - totals.budgetedExpense;
  const isOverspent = expenseVariance < 0;

  return (
    <>
      <div className="eyebrow">Budget vs. actuals — live, as of Sep 1, 2026</div>
      <h1 className="page-title">{budget?.name ?? "Season Budget"}</h1>
      <p className="page-sub">
        Replaces the current workflow of exporting a P&amp;L and comparing it
        against a spreadsheet by hand. Each view here is a real{" "}
        <code>GET /api/variance</code> request — the server joins the
        persisted budget against actual transactions at read time, never
        merging them.
      </p>

      <EnterpriseTabs value={scope} onChange={setScope} />

      {loading ? (
        <p className="page-sub">Loading…</p>
      ) : (
        <>
          <div className="summary-row">
            <div className="stat">
              <div className="stat-label">Season expense budget</div>
              <div className="stat-value">{formatUSD(Math.abs(totals.budgetedExpense))}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Actual spend to date</div>
              <div className={`stat-value ${isOverspent ? "over" : ""}`}>
                {formatUSD(Math.abs(totals.actualExpense))}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Revenue booked to date</div>
              <div className="stat-value under">{formatUSD(totals.actualRevenue)}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">{scopeLabel} — by category</div>
            <div className="card-sub">Season-to-date, Jan 1 – Sep 1, 2026</div>

            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="num">Budgeted</th>
                  <th className="num">Actual</th>
                  <th className="num">Variance</th>
                  <th>Used</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const category = categories.find((c) => c.id === row.categoryId);
                  const isExpenseRow = row.budgeted <= 0 && row.actual <= 0;
                  const overBudget = isExpenseRow && row.actual < row.budgeted;
                  const pct = row.percentUsed ?? 0;
                  const barWidth = Math.min(pct, 100);

                  return (
                    <tr key={row.categoryId}>
                      <td>
                        <div className="category-label">{row.categoryName}</div>
                        {category?.scheduleFLine && (
                          <div className="schedule-f">Sch. F: {category.scheduleFLine}</div>
                        )}
                      </td>
                      <td className="num">{formatUSD(Math.abs(row.budgeted))}</td>
                      <td className="num">{formatUSD(Math.abs(row.actual))}</td>
                      <td className="num">
                        {row.budgeted === 0 ? (
                          <span className="pill neutral">No budget set</span>
                        ) : (
                          <span className={`pill ${overBudget ? "over" : "under"}`}>
                            {overBudget ? "Over" : "Under"} {formatUSD(Math.abs(row.variance))}
                          </span>
                        )}
                      </td>
                      <td>
                        {row.percentUsed !== null ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="bar-track" style={{ flex: 1 }}>
                              <div
                                className={`bar-fill ${overBudget ? "over" : ""}`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                            <span style={{ fontSize: 12, color: "var(--ink-soft)", minWidth: 34 }}>
                              {Math.round(pct)}%
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="footnote">
        Prototype for Ambrook&rsquo;s Software Engineering Intern application.
        Ambrook&rsquo;s own help center confirms native budgeting is{" "}
        <a href="https://support.ambrook.com/en/articles/14707419-tracking-budgets-and-comparing-actuals-in-ambrook" target="_blank" rel="noreferrer">
          &ldquo;actively on our product roadmap&rdquo;
        </a>{" "}
        but not yet built — this is a first slice of that, with a real
        Next.js API layer (<code>/api/budget</code>, <code>/api/variance</code>)
        behind the UI, not just client-side state.
      </p>
    </>
  );
}
