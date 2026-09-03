"use client";

import { enterprises } from "@/lib/mockData";
import { BudgetScope } from "@/lib/types";

interface Props {
  value: BudgetScope;
  onChange: (scope: BudgetScope) => void;
  includeCompany?: boolean;
}

export function EnterpriseTabs({ value, onChange, includeCompany = true }: Props) {
  return (
    <div className="enterprise-tabs">
      {includeCompany && (
        <button
          className={`enterprise-tab ${value === "company" ? "active" : ""}`}
          onClick={() => onChange("company")}
        >
          Whole farm
        </button>
      )}
      {enterprises.map((e) => (
        <button
          key={e.id}
          className={`enterprise-tab ${value === e.id ? "active" : ""}`}
          onClick={() => onChange(e.id)}
        >
          {e.name}
        </button>
      ))}
    </div>
  );
}
