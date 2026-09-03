import { Budget, Category, Enterprise, Transaction } from "./types";

// Three enterprises, matching the multi-enterprise pattern Ambrook already
// supports (profit by enterprise/location) — this prototype extends that
// existing model forward instead of inventing a parallel one.
export const enterprises: Enterprise[] = [
  { id: "cattle", name: "Cattle", unit: "head" },
  { id: "hay", name: "Hay", unit: "acres" },
  { id: "equip", name: "Equipment Rental", unit: "units" },
];

export const categories: Category[] = [
  { id: "feed", name: "Feed", kind: "expense", scheduleFLine: "Feed purchased" },
  { id: "vet", name: "Vet & Health", kind: "expense", scheduleFLine: "Veterinary, breeding, medicine" },
  { id: "fuel", name: "Fuel", kind: "expense", scheduleFLine: "Gasoline, fuel, and oil" },
  { id: "repairs", name: "Repairs & Maintenance", kind: "expense", scheduleFLine: "Repairs and maintenance" },
  { id: "seed", name: "Seed & Chemicals", kind: "expense", scheduleFLine: "Seeds and plants / chemicals" },
  { id: "labor", name: "Labor", kind: "expense", scheduleFLine: "Labor hired" },
  { id: "lease", name: "Equipment Lease", kind: "expense", scheduleFLine: "Rent or lease of equipment" },
  { id: "insurance", name: "Insurance", kind: "expense", scheduleFLine: "Insurance (other than health)" },
  { id: "livestock-sales", name: "Livestock Sales", kind: "revenue", scheduleFLine: "Sales of livestock" },
  { id: "hay-sales", name: "Hay Sales", kind: "revenue", scheduleFLine: "Sales of raised crops" },
  { id: "rental-income", name: "Rental Income", kind: "revenue", scheduleFLine: "Custom hire income" },
];

// Season-to-date transactions: Jan 1 – Sep 1 of the current year, so the
// variance view has a realistic amount of "actuals" to compare against a
// full-season budget partway through the year.
export const transactions: Transaction[] = [
  // Cattle
  { id: "t1", date: "2026-01-14", categoryId: "feed", enterpriseId: "cattle", amount: -4200, description: "Winter hay + mineral supplement" },
  { id: "t2", date: "2026-02-18", categoryId: "feed", enterpriseId: "cattle", amount: -3800, description: "Feed store — cottonseed cake" },
  { id: "t3", date: "2026-03-22", categoryId: "vet", enterpriseId: "cattle", amount: -1650, description: "Spring vaccinations, herd of 84" },
  { id: "t4", date: "2026-04-09", categoryId: "feed", enterpriseId: "cattle", amount: -3100, description: "Feed store — supplement" },
  { id: "t5", date: "2026-05-02", categoryId: "vet", enterpriseId: "cattle", amount: -2200, description: "Vet call — pinkeye treatment" },
  { id: "t6", date: "2026-05-27", categoryId: "labor", enterpriseId: "cattle", amount: -2800, description: "Branding day help, 3 hands" },
  { id: "t7", date: "2026-06-11", categoryId: "feed", enterpriseId: "cattle", amount: -2600, description: "Feed store" },
  { id: "t8", date: "2026-07-03", categoryId: "vet", enterpriseId: "cattle", amount: -980, description: "Fly control treatment" },
  { id: "t9", date: "2026-07-30", categoryId: "livestock-sales", enterpriseId: "cattle", amount: 41500, description: "Spring calf sale — 38 head" },
  { id: "t10", date: "2026-08-14", categoryId: "feed", enterpriseId: "cattle", amount: -3400, description: "Feed store" },
  { id: "t11", date: "2026-08-26", categoryId: "insurance", enterpriseId: "cattle", amount: -1200, description: "Livestock mortality insurance, Q3" },

  // Hay
  { id: "t12", date: "2026-02-05", categoryId: "seed", enterpriseId: "hay", amount: -2100, description: "Alfalfa seed order" },
  { id: "t13", date: "2026-03-11", categoryId: "seed", enterpriseId: "hay", amount: -1450, description: "Fertilizer" },
  { id: "t14", date: "2026-04-19", categoryId: "fuel", enterpriseId: "hay", amount: -980, description: "Diesel for planting" },
  { id: "t15", date: "2026-05-14", categoryId: "repairs", enterpriseId: "hay", amount: -3200, description: "Baler belt replacement" },
  { id: "t16", date: "2026-06-02", categoryId: "labor", enterpriseId: "hay", amount: -1900, description: "First cutting crew" },
  { id: "t17", date: "2026-06-28", categoryId: "hay-sales", enterpriseId: "hay", amount: 18400, description: "First cutting — 460 bales" },
  { id: "t18", date: "2026-07-08", categoryId: "fuel", enterpriseId: "hay", amount: -1120, description: "Diesel, second cutting" },
  { id: "t19", date: "2026-07-22", categoryId: "repairs", enterpriseId: "hay", amount: -640, description: "Mower blade sharpening" },
  { id: "t20", date: "2026-08-05", categoryId: "hay-sales", enterpriseId: "hay", amount: 15200, description: "Second cutting — 380 bales" },
  { id: "t21", date: "2026-08-19", categoryId: "labor", enterpriseId: "hay", amount: -1600, description: "Second cutting crew" },

  // Equipment rental
  { id: "t22", date: "2026-01-28", categoryId: "repairs", enterpriseId: "equip", amount: -2900, description: "Tractor hydraulic repair" },
  { id: "t23", date: "2026-03-15", categoryId: "insurance", enterpriseId: "equip", amount: -1800, description: "Equipment insurance, annual" },
  { id: "t24", date: "2026-04-22", categoryId: "rental-income", enterpriseId: "equip", amount: 6400, description: "Baler rental — neighboring farm" },
  { id: "t25", date: "2026-05-18", categoryId: "fuel", enterpriseId: "equip", amount: -540, description: "Fuel, rental returns" },
  { id: "t26", date: "2026-06-09", categoryId: "rental-income", enterpriseId: "equip", amount: 5100, description: "Tractor rental — 2 weeks" },
  { id: "t27", date: "2026-07-14", categoryId: "repairs", enterpriseId: "equip", amount: -1750, description: "Transmission service" },
  { id: "t28", date: "2026-08-02", categoryId: "rental-income", enterpriseId: "equip", amount: 7200, description: "Combine rental, harvest season" },
  { id: "t29", date: "2026-08-21", categoryId: "lease", enterpriseId: "equip", amount: -2200, description: "New attachment lease payment" },

  // Company-wide
  { id: "t30", date: "2026-01-10", categoryId: "insurance", enterpriseId: "cattle", amount: -900, description: "General liability, Q1" },
  { id: "t31", date: "2026-04-01", categoryId: "labor", enterpriseId: "cattle", amount: -3600, description: "Full-time hand, April" },
  { id: "t32", date: "2026-07-01", categoryId: "labor", enterpriseId: "cattle", amount: -3600, description: "Full-time hand, July" },
];

// A single season budget, set once at the start of the year — this is the
// object the "Budget Builder" screen edits and the "Variance" screen reads.
export const initialBudget: Budget = {
  id: "b1",
  name: "2026 Season Budget",
  periodStart: "2026-01-01",
  periodEnd: "2026-12-31",
  lineItems: [
    // Cattle
    { id: "l1", categoryId: "feed", scope: "cattle", amount: -16000 },
    { id: "l2", categoryId: "vet", scope: "cattle", amount: -6000 },
    { id: "l3", categoryId: "labor", scope: "cattle", amount: -10000 },
    { id: "l4", categoryId: "insurance", scope: "cattle", amount: -2200 },
    { id: "l5", categoryId: "livestock-sales", scope: "cattle", amount: 78000 },
    // Hay
    { id: "l6", categoryId: "seed", scope: "hay", amount: -3800 },
    { id: "l7", categoryId: "fuel", scope: "hay", amount: -2400 },
    { id: "l8", categoryId: "repairs", scope: "hay", amount: -3500 },
    { id: "l9", categoryId: "labor", scope: "hay", amount: -4200 },
    { id: "l10", categoryId: "hay-sales", scope: "hay", amount: 36000 },
    // Equipment
    { id: "l11", categoryId: "repairs", scope: "equip", amount: -4000 },
    { id: "l12", categoryId: "insurance", scope: "equip", amount: -1800 },
    { id: "l13", categoryId: "lease", scope: "equip", amount: -4400 },
    { id: "l14", categoryId: "fuel", scope: "equip", amount: -1200 },
    { id: "l15", categoryId: "rental-income", scope: "equip", amount: 24000 },
  ],
};

// "Today" for the demo, kept fixed so the variance numbers are stable and
// reproducible rather than depending on the actual system clock.
export const asOfDate = "2026-09-01";
