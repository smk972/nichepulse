"use client";

import React, { useState, useEffect } from "react";
import Sparkline from "@/components/Sparkline";
import { api } from "@/lib/api";
import { usePlatform } from "@/lib/PlatformContext";

export default function MarketTrendsPage() {
  const { platform, setPlatform, platformLabel } = usePlatform();
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    api.getTrends(selectedCat || undefined, platform)
      .then((res) => setTrends(res))
      .catch((err) => console.error("Erreur trends:", err))
      .finally(() => setLoading(false));
  }, [selectedCat, platform]);

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-telemetry text-[11px] uppercase px-2 py-0.5 rounded bg-[#7c3aed]/15 text-[#d0bcff] font-bold border border-[#7c3aed]/30">
              MACRO-TENDANCES
            </span>
            <span className="font-telemetry text-[11px] text-[#4edea3]">LIVE SCAN</span>
            <span className="font-telemetry text-[11px] px-2 py-0.5 rounded bg-[#282a30] text-[#4cd7f6] font-bold">
              {platformLabel}
            </span>
          </div>
          <h1 className="font-headline text-[26px] text-[#e2e2eb] font-extrabold tracking-tight mt-1">
            Tendances de Marché &amp; Segments Émergents
          </h1>
          <p className="text-[13px] text-[#cbc3d7]">
            Surveillance des mouvements de fond calculés par accélération de rangs et croissance de recherche.
          </p>
        </div>

        {/* Dual Filters: Platform & Categories */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Platform Switcher */}
          <div className="flex items-center bg-[#191b22] p-1 rounded-xl border border-[#282a30] font-telemetry text-[11px]">
            <button
              onClick={() => setPlatform("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                platform === "all" ? "bg-[#7c3aed] text-white" : "text-[#cbc3d7] hover:text-[#e2e2eb]"
              }`}
            >
              ⚡ Combiné
            </button>
            <button
              onClick={() => setPlatform("ios")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                platform === "ios" ? "bg-[#7c3aed] text-white" : "text-[#cbc3d7] hover:text-[#e2e2eb]"
              }`}
            >
              🍎 iOS
            </button>
            <button
              onClick={() => setPlatform("android")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                platform === "android" ? "bg-[#06b6d4] text-[#0c0e14]" : "text-[#cbc3d7] hover:text-[#e2e2eb]"
              }`}
            >
              🤖 Android
            </button>
          </div>

          {/* Filter Categories */}
          <div className="flex items-center gap-1.5 bg-[#191b22] p-1 rounded-xl border border-[#282a30]">
            {["", "Finance", "Health & Fitness", "Productivity", "Lifestyle"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg font-telemetry text-[11px] font-semibold transition-colors ${
                  selectedCat === cat
                    ? "bg-[#7c3aed] text-white"
                    : "text-[#cbc3d7] hover:text-[#e2e2eb]"
                }`}
              >
                {cat || "Toutes"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trends Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-[#958ea0] font-telemetry text-[13px]">
          <span className="animate-spin mr-2">⟳</span> Chargement des tendances {platformLabel}...
        </div>
      ) : trends.length === 0 ? (
        <div className="p-12 text-center text-[#958ea0] font-telemetry bg-[#191b22] rounded-2xl border border-[#282a30]">
          Aucune macro-tendance pour cette sélection.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trends.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-[#191b22] border border-[#282a30] hover:border-[#7c3aed]/40 transition-all space-y-4 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-telemetry text-[10px] px-2 py-0.5 rounded bg-[#282a30] text-[#d0bcff] font-bold">
                      {t.category}
                    </span>
                    <span className="font-telemetry text-[10px] px-2 py-0.5 rounded bg-[#111319] text-[#cbc3d7] border border-[#282a30]">
                      {t.platform === "ios" ? "🍎 iOS" : t.platform === "android" ? "🤖 Android" : "⚡ Multi"}
                    </span>
                  </div>
                  <h3 className="font-headline text-[18px] font-bold text-[#e2e2eb] mt-2 group-hover:text-[#d0bcff] transition-colors">
                    {t.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-telemetry text-[22px] font-bold text-[#4edea3] block">
                    {Math.round(t.trend_score)}
                  </span>
                  <span className="font-telemetry text-[9px] text-[#958ea0] uppercase">
                    SCORE TENDANCE
                  </span>
                </div>
              </div>

              <p className="text-[12px] text-[#cbc3d7] leading-relaxed">
                {t.description}
              </p>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111319] border border-[#1e1f26]">
                <div>
                  <span className="font-telemetry text-[10px] text-[#958ea0] block">TRAJECTOIRE 30J</span>
                  <span className="font-telemetry text-[12px] text-[#4edea3] font-bold">+287% volume</span>
                </div>
                <Sparkline data={t.sparkline_data || [15, 25, 40, 60, 85]} color="emerald" width={100} height={32} />
              </div>

              <div className="flex items-center justify-between font-telemetry text-[11px] text-[#958ea0] pt-1">
                <span>{t.apps_count} applications associées</span>
                <span className="text-[#4cd7f6] font-semibold">{t.breakout_count} breakouts actifs</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
