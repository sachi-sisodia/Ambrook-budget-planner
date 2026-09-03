# Ambrook Budget Planner (prototype)

Hi, I'm Sachi Sisodia, a Computer Science student at Western University ([resume attached](./Sachi_Sisodia_Resume.pdf)). I'm applying for Ambrook's **Software Engineering Intern** role, and instead of just sending a resume and cover letter, I wanted to build something that actually shows how I'd approach the job.

I've also worked on agriculture-adjacent software before. I spent a summer as a Full-Stack Engineer Intern at FarmSetu Technologies in India, building Python/Django features on their Setu Care platform for 10,000+ users and designing a Visitor Management System end to end. So this problem space felt like a natural fit.

So here's an unsolicited project: a native budgeting and live budget-vs-actuals tool. It's real, end to end. There's a real backend behind it that actually saves your data. I built it in the same stack Ambrook uses: Next.js, React, TypeScript. And it goes after a gap Ambrook has told its own customers is coming, but hasn't shipped yet.

![Variance view](screenshots/variance-view.png)

## Why this, specifically

Ambrook's help center says it directly:

> "Ambrook does not currently have a built-in budgeting feature, so budgets cannot be loaded or uploaded directly into the platform." Users are told to "keep your budget entirely outside of Ambrook," export a report, and build the budget-vs-actuals comparison "in your spreadsheet." From [Tracking Budgets and Comparing Actuals in Ambrook](https://support.ambrook.com/en/articles/14707419-tracking-budgets-and-comparing-actuals-in-ambrook) (Ambrook Help Center, Apr 21 2026)

The same article adds that "native budget-vs-actuals functionality is actively on our product roadmap." Ambrook's closest analog in a market it hasn't entered, [Figured](https://www.figured.com/en-nz/planning-budgeting), the dominant farm-finance platform in NZ/AU/UK, has built much of its business around exactly this: rolling, production-linked budgets with an advisor-collaboration tier layered on top.

This prototype is a first slice of that: a **budget builder** (set a season target per category, by enterprise or for the whole farm) and a **live variance view** (budgeted vs. actual, recalculated from bookkeeping data instead of a manual monthly export). The full reasoning, UX flow, technical approach, and revenue argument is written up in [`design-plan.md`](./design-plan.md).

## What's actually built vs. what's a stand-in

This is a scoped proof of concept. Worth being upfront about that as an intern applicant:

- **Real:** the data model (`lib/types.ts`), the variance-calculation logic (`lib/variance.ts`), two Next.js API routes (`app/api/budget/route.ts`, `app/api/variance/route.ts`), a server-side persistence layer (`lib/budgetStore.ts`), the budget builder UI (`app/budget/page.tsx`), and the variance dashboard UI (`app/page.tsx`) are all working code. The UI talks to the API over real `fetch` calls.
- **Stand-in:** the "actuals" are hand-written mock transactions (`lib/mockData.ts`) shaped like Ambrook's real chart-of-accounts and multi-enterprise model (Cattle / Hay / Equipment Rental), not a live connection to Ambrook's actual data. I don't have access to that.
- **Real, both locally and in production:** budget writes go through a real API endpoint (`POST /api/budget`), validated server-side, and are persisted server-side instead of held in React state. Locally that's a JSON file (`data/budget.json`, auto-created, gitignored), so the project needs zero setup to run. In production (`lib/budgetStore.ts` picks this automatically based on whether a `DATABASE_URL` is present), it's real Postgres, via Neon.
- **Deliberate constraint carried over from the real problem:** budget data is never merged into the transaction ledger. It's joined against actuals only at read time, on the server (see the comment in `lib/variance.ts` and `app/api/variance/route.ts`). Ambrook's own help docs warn that entering hypothetical numbers directly can "impact your balances and reporting accuracy," so this prototype treats that as a hard boundary enforced by the data model.

## Running it

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. Two pages: `/` (variance view) and `/budget` (budget builder), both talking to the API routes (`/api/budget`, `/api/variance`) instead of holding their own copy of the truth. An edit on the builder page does a real `POST /api/budget`, persists to `data/budget.json` on the server, and the variance page picks up the change on its next fetch. No database install, account, or environment variables needed, the data file is created automatically on first run.

## Stack

Matched deliberately to Ambrook's own stack, as described in their engineering job postings and their "In the Weeds" engineering blog post:

- Next.js (App Router) + React + TypeScript, front end and back end (API routes) in the same framework
- No external UI library. Plain CSS, styled to sit close to Ambrook's actual product (cream background, dark green primary, serif wordmark)
- Persistence: Postgres (Neon) in production, a JSON file locally. Same API shape either way (`GET`/`POST /api/budget`, `GET /api/variance`), only `lib/budgetStore.ts` switches implementation based on environment

## Files

```
app/
  page.tsx              variance dashboard (home), fetches from /api/variance
  budget/page.tsx        budget builder, fetches/writes via /api/budget
  api/budget/route.ts     GET current budget, POST an upsert (server-validated)
  api/variance/route.ts   GET computed variance for a scope
  layout.tsx             shared shell + nav
  globals.css             styling
components/
  BudgetContext.tsx      loads budget from the API, exposes updateLineItem()
  EnterpriseTabs.tsx      whole-farm / per-enterprise scope switcher
  TopBar.tsx              nav
lib/
  types.ts                data model
  mockData.ts              mock enterprises, categories, transactions, starting budget
  variance.ts              budget-vs-actual calculation (pure, runs server-side)
  budgetStore.ts           server-side persistence (Postgres in prod, JSON file locally, both auto-seeded)
design-plan.md             full written proposal: problem, competitive context, UX flow, technical approach, edge cases, revenue argument
screenshots/               rendered screenshots of both pages
```
