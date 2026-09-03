"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopBar() {
  const pathname = usePathname();

  return (
    <div className="topbar">
      <div className="wordmark serif">ambrook</div>
      <div className="nav">
        <Link href="/" className={pathname === "/" ? "active" : ""}>
          Variance
        </Link>
        <Link href="/budget" className={pathname === "/budget" ? "active" : ""}>
          Budget Builder
        </Link>
      </div>
    </div>
  );
}
