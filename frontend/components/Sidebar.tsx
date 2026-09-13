"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();

  const navSections: NavSection[] = [
    {
      title: "STRATÉGIE & RADAR",
      items: [
        { name: "Vue d'ensemble", href: "/overview", icon: "space_dashboard" },
        { name: "Matrice d'opportunités", href: "/market-matrix", icon: "grid_view", badge: "TOP", badgeColor: "bg-[#7c3aed]/25 text-[#d0bcff] border-[#7c3aed]/40" },
        { name: "Écarts Géographiques", href: "/geo-gaps", icon: "public" },
      ]
    },
    {
      title: "DÉTECTION STORES",
      items: [
        { name: "Lancements Récents", href: "/new-launches", icon: "new_releases", badge: "24", badgeColor: "bg-[#10b981]/20 text-[#34d399] border-[#10b981]/30" },
        { name: "Explorateur d'Apps", href: "/app-explorer", icon: "apps", badge: "200", badgeColor: "bg-[#06b6d4]/20 text-[#38bdf8] border-[#06b6d4]/30" },
        { name: "Breakouts Rapides", href: "/fast-movers", icon: "rocket_launch", badge: "🔥", badgeColor: "bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b]/30" },
        { name: "Tendances Stores", href: "/market-trends", icon: "trending_up" },
        { name: "Momentum de Recherche", href: "/search-momentum", icon: "query_stats" },
      ]
    },
    {
      title: "ANALYSE & EXÉCUTION",
      items: [
        { name: "Radar des Frustrations", href: "/frustrations", icon: "psychology_alt" },
        { name: "Idées d'Applications", href: "/idea-backlog", icon: "lightbulb", badge: "SOLO", badgeColor: "bg-[#10b981]/20 text-[#34d399] border-[#10b981]/30" },
        { name: "Watchlist", href: "/watchlist", icon: "bookmark_border" },
        { name: "Flux d'Alertes", href: "/signal-feed", icon: "notifications_active", badge: "4", badgeColor: "bg-[#7c3aed]/25 text-[#d0bcff] border-[#7c3aed]/40" },
      ]
    }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#07090e] border-r border-[#1a202c] z-50 flex flex-col justify-between select-none shadow-2xl">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Brand Header */}
        <div className="px-5 pt-4 pb-3.5 border-b border-[#161b26]">
          <Link href="/overview" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#06b6d4] flex items-center justify-center shadow-md shadow-[#7c3aed]/25 group-hover:scale-105 transition-transform duration-200">
              <span className="material-symbols-outlined text-white text-[18px]">insights</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-[16.5px] font-extrabold tracking-tight bg-gradient-to-r from-white via-[#e2e8f0] to-[#94a3b8] bg-clip-text text-transparent group-hover:from-white group-hover:to-[#38bdf8] transition-colors">
                NICHEPULSE
              </span>
              <span className="font-telemetry text-[9px] text-[#64748b] tracking-wider uppercase font-semibold">
                Intelligence Solo Dev
              </span>
            </div>
          </Link>

          {/* Live Telemetry Heartbeat Pill */}
          <div className="mt-3 flex items-center justify-between px-2.5 py-1 bg-[#0d1117] rounded-lg border border-[#1e2536]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
              </span>
              <span className="font-telemetry text-[9.5px] text-[#10b981] font-bold tracking-wider uppercase">
                TÉLÉMÉTRIE LIVE
              </span>
            </div>
            <span className="font-telemetry text-[9px] text-[#64748b]">US • EU</span>
          </div>
        </div>

        {/* Categorized Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <span className="font-telemetry text-[9.5px] font-bold tracking-widest text-[#475569] px-2.5 uppercase block">
                {section.title}
              </span>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href === "/overview" && pathname === "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] transition-all duration-150 ${
                        isActive
                          ? "bg-gradient-to-r from-[#7c3aed]/20 to-[#06b6d4]/10 text-white font-semibold border border-[#7c3aed]/40 shadow-sm"
                          : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#131722]"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-gradient-to-b from-[#8b5cf6] to-[#06b6d4] rounded-r-full shadow-sm shadow-[#8b5cf6]"></span>
                      )}
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`material-symbols-outlined text-[17px] transition-colors ${
                            isActive
                              ? "text-[#38bdf8]"
                              : "text-[#64748b] group-hover:text-[#94a3b8]"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`font-telemetry text-[9px] px-1.5 py-0.2 rounded font-bold border ${item.badgeColor || "bg-[#1e2536] text-[#94a3b8]"}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Navigation & Status */}
      <div className="p-3 border-t border-[#161b26] space-y-2 bg-[#0a0c12]">
        <div className="px-2.5 py-2 rounded-lg bg-[#0d1117] border border-[#1e2536] flex flex-col gap-1">
          <div className="flex items-center justify-between font-telemetry text-[9.5px]">
            <span className="text-[#64748b] uppercase tracking-wider font-semibold">Stores Connectés</span>
            <span className="text-[#10b981] flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>100% OPÉRATIONNEL
            </span>
          </div>
          <span className="font-telemetry text-[10px] text-[#94a3b8] truncate">
            Apple App Store • Google Play Store
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <Link
            href="/data-sources"
            className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-telemetry border transition-all ${
              pathname === "/data-sources"
                ? "bg-[#131722] text-[#38bdf8] border-[#06b6d4]/40 font-semibold"
                : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#131722] border-transparent"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">hub</span>
            <span>Sources</span>
          </Link>

          <Link
            href="/settings"
            className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-telemetry border transition-all ${
              pathname === "/settings"
                ? "bg-[#131722] text-[#d0bcff] border-[#7c3aed]/40 font-semibold"
                : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#131722] border-transparent"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">tune</span>
            <span>Réglages</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
