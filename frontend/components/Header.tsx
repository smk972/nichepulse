"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePlatform, PlatformType } from "@/lib/PlatformContext";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const { platform, setPlatform, platformLabel } = usePlatform();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) onSearch(val);
  };

  const platformOptions: { id: PlatformType; label: string; icon: string; shortLabel: string }[] = [
    { id: "all", label: "Combiné (iOS + Android)", shortLabel: "Tous Stores", icon: "devices" },
    { id: "ios", label: "Apple App Store", shortLabel: "iOS", icon: "phone_iphone" },
    { id: "android", label: "Google Play Store", shortLabel: "Android", icon: "android" },
  ];

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-[#07090e]/85 backdrop-blur-xl border-b border-[#1a202c] z-40 flex items-center justify-between px-8 select-none">
      {/* Telemetry Metrics Strip */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0d1117] border border-[#1e2536] font-telemetry text-[11px] shadow-sm">
          <span className="flex items-center gap-1.5 text-[#10b981] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            LIVE
          </span>
          <span className="text-[#334155]">•</span>
          {platform === "ios" ? (
            <span className="text-[#f1f5f9] font-medium">🍎 100 APPS (APP STORE)</span>
          ) : platform === "android" ? (
            <span className="text-[#f1f5f9] font-medium">🤖 100 APPS (PLAY STORE)</span>
          ) : (
            <span className="text-[#f1f5f9] font-medium">⚡ 200 APPS INDEXÉES</span>
          )}
          <span className="text-[#334155]">•</span>
          <span className="text-[#d0bcff] font-semibold">
            {platform === "all" ? "18 BREAKOUTS ACTIFS" : "9 BREAKOUTS"}
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[#64748b] text-[17px]">
            search
          </span>
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder={`Rechercher une app, mot-clé ou créneau ${platform === "ios" ? "sur iOS" : platform === "android" ? "sur Android" : "sur les stores"}...`}
            className="w-full bg-[#0d1117] text-[#f1f5f9] placeholder:text-[#64748b] text-[12.5px] pl-9 pr-14 py-1.5 rounded-lg border border-[#1e2536] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/50 transition-all"
          />
          <div className="absolute right-2.5 px-1.5 py-0.5 rounded bg-[#161b26] font-telemetry text-[9.5px] text-[#94a3b8] border border-[#2a344d]">
            ⌘K
          </div>
        </div>
      </div>

      {/* Action Strip & Platform Switcher */}
      <div className="flex items-center gap-3">
        {/* PLATFORM SELECTOR SWITCHER (Segmented control) */}
        <div className="flex items-center bg-[#0d1117] p-0.5 rounded-xl border border-[#1e2536] shadow-inner">
          {platformOptions.map((opt) => {
            const isActive = platform === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setPlatform(opt.id)}
                title={opt.label}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-telemetry text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? opt.id === "ios"
                      ? "bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white shadow-md shadow-[#7c3aed]/30"
                      : opt.id === "android"
                      ? "bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-[#07090e] shadow-md shadow-[#06b6d4]/30"
                      : "bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white shadow-md shadow-[#7c3aed]/25"
                    : "text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#161b26]"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {opt.icon}
                </span>
                <span>{opt.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Notifications Stream Link */}
        <Link
          href="/signal-feed"
          className="relative p-2 rounded-lg hover:bg-[#131722] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors border border-transparent hover:border-[#1e2536]"
          title="Flux d'alertes"
        >
          <span className="material-symbols-outlined text-[19px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7c3aed] rounded-full shadow-sm shadow-[#7c3aed]"></span>
        </Link>

        {/* User Identity Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1a202c]">
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-[12.5px] font-semibold text-[#f1f5f9]">Dimitri K.</span>
              <span className="font-telemetry text-[9px] px-1.5 py-0.2 bg-[#7c3aed]/20 text-[#d0bcff] rounded-md font-bold border border-[#7c3aed]/30">
                SOLO DEV
              </span>
            </div>
            <span className="font-telemetry text-[10px] text-[#64748b]">NichePulse Terminal</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#06b6d4] flex items-center justify-center text-white font-bold text-[12px] shadow-sm shadow-[#7c3aed]/30">
            DK
          </div>
        </div>
      </div>
    </header>
  );
}
