"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const monitorLinks = [
  {
    number: "01",
    name: "Dashboard",
    href: "/",
  },
  {
    number: "02",
    name: "Projects",
    href: "/projects",
  },
  {
    number: "03",
    name: "GIS Map",
    href: "/gis-map",
  },
  {
    number: "04",
    name: "Analytics",
    href: "/analytics",
  },
];

const insightLinks = [
  {
    number: "05",
    name: "Predictive",
    href: "/predictive",
  },
  {
    number: "06",
    name: "Alerts",
    href: "/alerts",
  },
  {
    number: "07",
    name: "Reports",
    href: "/reports",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* MOBILE HEADER */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center border-b border-slate-200 bg-[#050a1c] px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center text-white"
        >
          <span className="text-2xl leading-none">
            {mobileOpen ? "×" : "☰"}
          </span>
        </button>

        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="ml-3 text-lg font-semibold tracking-wide text-white"
        >
          CIVIXA
        </Link>
      </header>

      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden bg-[#050a1c] text-white transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRAND */}
        <div className="shrink-0 border-b border-slate-800 px-8 py-9">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block"
          >
            <div className="text-[28px] font-semibold tracking-wide">
              CIVIXA
            </div>

            <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Infrastructure
              <br />
              Intelligence
            </div>
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav
          className="flex-1 overflow-y-auto px-5 py-8"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}

        >
          {/* MONITOR */}
          <div>
            <p className="mb-4 px-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600">
              Monitor
            </p>

            <div className="space-y-1">
              {monitorLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition ${
                    isActive(link.href)
                      ? "bg-[#1d2940] text-white"
                      : "text-slate-400 hover:bg-[#111a30] hover:text-white"
                  }`}
                >
                  <span className="w-5 text-[10px] text-slate-600">
                    {link.number}
                  </span>

                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* INSIGHTS */}
          <div className="mt-8">
            <p className="mb-4 px-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600">
              Insights
            </p>

            <div className="space-y-1">
              {insightLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition ${
                    isActive(link.href)
                      ? "bg-[#1d2940] text-white"
                      : "text-slate-400 hover:bg-[#111a30] hover:text-white"
                  }`}
                >
                  <span className="w-5 text-[10px] text-slate-600">
                    {link.number}
                  </span>

                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* SYSTEM STATUS */}
        <div className="shrink-0 border-t border-slate-800 px-8 py-7">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
            Monitoring system
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-xs text-slate-400">
              System operational
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}