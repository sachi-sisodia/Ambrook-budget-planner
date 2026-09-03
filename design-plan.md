# Native Budgeting & Production-Linked Forecasting for Ambrook
### A product & engineering plan — prepared as an application project for Ambrook's Software Engineer role

---

## 1. The problem, in Ambrook's own words

Ambrook's analytics are entirely retrospective — enterprise profitability, breakeven by acre/head, margins, cashflow tracking — all reporting on what already happened ([overview/platform](https://ambrook.com/overview/platform), [features/all](https://ambrook.com/features/all)).

For forward-looking planning, Ambrook's own help center is direct about the gap:

> "Ambrook does not currently have a built-in budgeting feature, so budgets cannot be loaded or uploaded directly into the platform." The recommended workaround: "keep your budget entirely outside of Ambrook," export a report, and build the budget-vs-actuals comparison "in your spreadsheet." — [Tracking Budgets and Comparing Actuals in Ambrook](https://support.ambrook.com/en/articles/14707419-tracking-budgets-and-comparing-actuals-in-ambrook)

The same article confirms this isn't an oversight — it's a known, prioritized gap: "native budget-vs-actuals functionality is actively on our product roadmap." A separate marketing post, ["Budgets and Goals"](https://ambrook.com/education/product/budgets-and-goals), describes a concierge version of this ("Contact us to set up your first budget") — a human at Ambrook manually configures a goal for you. That's a real signal of demand, not a shipped self-serve feature.

## 2. Why this is the right feature, not just an available one

Ambrook's closest analog in a market it hasn't entered yet — Figured, the dominant farm-finance platform in NZ/AU/UK — has built almost its entire product around exactly this gap, and around one detail Ambrook hasn't reached yet: **production-linked** planning, not just dollars-in/dollars-out.

Figured's model, concretely ([figured.com/en-nz/planning-budgeting](https://www.figured.com/en-nz/planning-budgeting), [figured.com/en-nz/farmers](https://www.figured.com/en-nz/farmers)):

- Non-calendar, rolling budgets with unlimited reforecasting and version history — a budget isn't a static January–December document, it's a living plan.
- Production-to-finance mapping: actual livestock movements, crop activity, or milk output automatically drive the financial plan, reported in farm-native units ("$ per hectare, per kg milk solids, per carcass weight") instead of generic accounting categories.
- Multi-year scenario modeling — "what if commodity prices drop 20%," "what if I expand the herd by 50 head."
- A shared advisor workspace where the farm's accountant/consultant sees live data and leaves comments — Figured monetizes both the farm *and* the advisor seat off this one feature.

Ambrook already has two of the three prerequisites this would need: enterprise-level unit economics (profit by enterprise, breakeven by acre/head) to build the production link on top of, and an existing "Accountant Access" role in its permissions system to build the advisor workspace on top of. The forward-looking half is the piece it's missing — and it's the piece Figured's whole business is built on.

## 3. Goals (v1)

- Let a user build a real budget inside Ambrook — by account category, enterprise, or company-wide — instead of being told to leave the platform.
- Automatically compare actuals against the budget as bookkeeping happens, live, not via a monthly manual re-export.
- Lay groundwork for production-linked forecasting (v2) without over-building v1.

## 4. Non-goals (v1)

- Full production-to-finance mapping (livestock/crop/yield-driven forecasting) — v1 is dollars-based budgeting; production linking is a clearly-scoped v2 that reuses the same budget engine.
- Multi-year scenario modeling — same reasoning; v1 proves the core loop (set a budget, see variance live) before adding scenario branching.

## 5. Proposed UX flow

**Step 1 — Build a budget, not a spreadsheet.** A budget builder inside the existing Analytics area, pre-populated from the user's actual chart of accounts and enterprises (Ambrook already has this data — no cold start). Set a target per category, per enterprise, or roll up company-wide, for a season or a rolling period — deliberately not locked to a calendar year, matching how farm seasons actually run.

**Step 2 — Live variance, not a monthly refresh.** Since Ambrook already ingests transactions in real time (bank feeds, receipts, invoicing), the budget-vs-actual view updates as bookkeeping happens — replacing the current "re-download the export every month or quarter" workflow the help article describes.

**Step 3 — Enterprise-level drill-down.** Because Ambrook already tracks profitability by enterprise/location, the same budget view can show "hay enterprise: 84% of budgeted expense used, on pace" alongside the company-wide number — extending a feature they've already built rather than bolting on something foreign.

**Step 4 (v2 groundwork, not v1) — Accountant visibility.** Since Accountant Access already exists as a role, the budget view should be visible (read, then comment) to that role from day one, even if full collaboration tooling is v2 — this is the seed of Figured's advisor-monetization model.

## 6. Technical approach (matched to Ambrook's actual stack)

- **Frontend:** Next.js + React + TypeScript, reusing the existing Analytics dashboard's data-fetching patterns rather than introducing a parallel system.
- **Data model:** A `Budget` entity (Postgres) scoped to a business + optional enterprise, with line items per chart-of-accounts category and a time range; kept structurally separate from the transaction ledger — this directly respects Ambrook's own stated caution in the help article, that hypothetical/forecasted numbers must never pollute actual bookkeeping data or reporting accuracy.
- **Variance calculation:** A read-side aggregation (likely resolved via their GraphQL API, joining actual transaction totals per category/enterprise against the stored budget line items) — computed on read, not duplicated into the ledger, again for the same data-integrity reason.
- **Rollout to the roadmap:** Since Ambrook has already told customers this is coming, this isn't a "why would you build this" pitch — it's a "here's a working start on what you've already promised."

## 7. Edge cases

- Multi-enterprise farms where budget targets need to roll up correctly without double-counting shared/company-wide costs.
- Mid-season budget starts (a farm switching from QuickBooks or from a spreadsheet mid-year, with only partial-year actuals to compare against).
- Category or enterprise renames/restructuring after a budget is already set — the budget shouldn't silently break.

## 8. The revenue argument

Figured's model proves farms and their accountants will pay for exactly this. Ambrook already has the permission structure (Accountant Access) to extend a budget/variance view to an advisor seat as a new tier — the same wedge Figured used to build a category-leading position in three other English-speaking ag markets Ambrook hasn't touched. This isn't a "nice to have" UX polish item; it's a feature category with a proven willingness-to-pay right next door.

## 9. What I'd build as the actual demo

A scoped v1 slice: a budget-builder screen (set per-category/per-enterprise targets) plus a live variance view (budgeted vs. actual, with an over/under indicator), built in Next.js/TypeScript against a mock version of Ambrook's chart-of-accounts and enterprise data. Small enough to build convincingly, but it's the literal first slice of a feature they've publicly said is on their roadmap — not a speculative idea, a head start on a stated priority.

---
*Prepared as an unsolicited project for Ambrook's Software Engineer application — grounded in Ambrook's own help documentation and roadmap admission, and in Figured's proven market model, rather than a hypothetical problem.*
