import type { Metadata } from "next";
import "./globals.css";
import { BudgetProvider } from "@/components/BudgetContext";
import { TopBar } from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Budget Planner — Ambrook prototype",
  description:
    "A prototype of native, production-linked budgeting for Ambrook, built as an application project.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BudgetProvider>
          <div className="shell">
            <TopBar />
            {children}
          </div>
        </BudgetProvider>
      </body>
    </html>
  );
}
