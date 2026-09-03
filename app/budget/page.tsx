"use client";

import { useEffect, useState } from "react";
import { useBudget } from "@/components/BudgetContext";
import { EnterpriseTabs } from "@/components/EnterpriseTabs";
import { categories, enterprises } from "@/lib/mockData";
import { BudgetScope } from "@/lib/types";
import { formatUSD } from "@/lib/variance";

function BudgetLineInput({
  amount,
  kind,
  onCommit,
}: {
  amount: number | undefined;
  kind: "expense" | "revenue";
  onCommit: (amount: number) => void;
}) {
  const [text, setText] = useState(
    amount !== undefined ? String(Math.abs(amount)) : ""
  );

  // Resync from the server-confirmed amount when it changes from outside
  // this field (e.g. switching enterprise tabs and back).
  useEffect(() => {
    setText(amount !== undefined ? String(Math.abs(amount)) : "");
  }, [amount]);

  return (
    <input
      type="number"
      min={0}
      placeholder="0"
      value={text}
      onChange={(e) => {
        let nextText = e.target.value;
        // Strip a leading zero instead of appending after it, e.g. typing
        // "1" into a field showing "0" should give "1", not "01".
        if (nextText.length > 1 && nextText.startsWith("0") && nextText[1] !== ".") {
          nextText = nextText.replace(/^0+(?=\d)/, "");
        }
        setText(nextText);
        const raw = nextText === "" ? 0 : Number(nextText);
        const signed = kind === "expense" ? -Math.abs(raw) : Math.abs(raw);
        onCommit(signed);
      }}
    />
  );
}

export default function BudgetBuilderPage() {
  const { budget, loading, updateLineItem, lastSavedAt } = useBudget();
  const [scope, setScope] = useState<BudgetScope>("cattle");

  const scopeLabel =
    scope === "company"
      ? "Whole farm"
      : enterprises.find((e) => e.id === scope)?.name ?? scope;

  if (loading || !budget) {
    return (
      <>
        <div className="eyebrow">Budget builder — prototype</div>
        <p className="page-sub">Loading budget from the server…</p>
      </>
    );
  }

  return (
    <>
      <div className="eyebrow">Budget builder — prototype</div>
      <h1 className="page-title">{budget.name}</h1>
      <p className="page-sub">
        Set a season target per category, by enterprise or for the whole farm.
        Targets are pre-populated from your existing chart of accounts and
        enterprises — nothing here touches your actual ledger. This screen is
        what replaces exporting a report and building the comparison in an
        outside spreadsheet.
      </p>

      <EnterpriseTabs value={scope} onChange={setScope} />

      <div className="card">
        <div className="card-title">{scopeLabel} — season targets</div>
        <div className="card-sub">
          Jan 1 – Dec 31, 2026 · enter a full-season target for each category
          that applies here
        </div>

        {categories.map((cat) => {
          const existing = budget.lineItems.find(
            (li) => li.categoryId === cat.id && li.scope === scope
          );

          return (
            <div className="budget-form-row" key={cat.id}>
              <div>
                <div className="field-label">{cat.name}</div>
                {cat.scheduleFLine && (
                  <div className="field-sub">Sch. F: {cat.scheduleFLine}</div>
                )}
              </div>
              <div className="kind-tag">
                {cat.kind === "expense" ? "Expense target" : "Revenue target"}
              </div>
              <BudgetLineInput
                amount={existing?.amount}
                kind={cat.kind}
                onCommit={(signed) => updateLineItem(cat.id, scope, signed)}
              />
            </div>
          );
        })}

        <div className="save-bar">
          <div className="save-note">
            {lastSavedAt ? "Saved to the server" : "No changes yet"}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
            {scopeLabel} total budgeted:{" "}
            {formatUSD(
              budget.lineItems
                .filter((li) => li.scope === scope)
                .reduce((sum, li) => sum + li.amount, 0)
            )}
          </div>
        </div>
      </div>

      <p className="footnote">
        Each edit here is a real <code>POST /api/budget</code> request,
        persisted server-side (see <code>lib/budgetStore.ts</code>) and kept
        structurally separate from transaction data — never merged into the
        ledger — so forecasted numbers can never distort actual bookkeeping
        or reporting, the same constraint Ambrook&rsquo;s own support docs
        call out for the current spreadsheet-based workaround. A shipped
        version would swap the storage layer for Ambrook&rsquo;s actual
        PostgreSQL data layer; the API shape and the ledger-separation rule
        would stay the same.
      </p>
    </>
  );
}
