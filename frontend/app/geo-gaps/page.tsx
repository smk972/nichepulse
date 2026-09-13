"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { usePlatform } from "@/lib/PlatformContext";

export default function GeoGapsPage() {
  const { platform, setPlatform, platformLabel } = usePlatform();
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getMarketGaps(platform)
      .then((res) => setGaps(res))
      .catch((err) => console.error("Erreur market gaps:", err))
      .finally(() => setLoading(false));
  }, [platform]);

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-telemetry text-[11px] uppercase px-2 py-0.5 rounded bg-[#4cd7f6]/15 text-[#4cd7f6] font-bold border border-[#4cd7f6]/30">
              ARBITRAGE GÉOGRAPHIQUE
            </span>
            <span className="font-telemetry text-[11px] text-[#4edea3]">TRANSFERTS US → FRANCE &amp; EU</span>
            <span className="font-telemetry text-[11px] px-2 py-0.5 rounded bg-[#282a30] text-[#d0bcff] font-bold">
              {platformLabel}
            </span>
          </div>
          <h1 className="font-headline text-[26px] text-[#e2e2eb] font-extrabold tracking-tight mt-1">
            Marchés &amp; Écarts Géographiques
          </h1>
          <p className="text-[13px] text-[#cbc3d7]">
            Identifiez les concepts validés avec succès dans les pays anglophones avant leur saturation sur les marchés francophones.
          </p>
        </div>

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
      </div>

      {/* Gaps List */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-[#958ea0] font-telemetry text-[13px]">
          <span className="animate-spin mr-2">⟳</span> Chargement des écarts de marché...
        </div>
      ) : gaps.length === 0 ? (
        <div className="p-12 text-center text-[#958ea0] font-telemetry bg-[#191b22] rounded-2xl border border-[#282a30]">
          Aucun écart détecté pour cette configuration.
        </div>
      ) : (
        <div className="space-y-4">
          {gaps.map((gap) => (
            <div
              key={gap.id}
              className="p-6 rounded-2xl bg-[#191b22] border border-[#282a30] hover:border-[#4cd7f6]/40 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-telemetry text-[11px] px-2 py-0.5 rounded bg-[#282a30] text-[#d0bcff] font-bold">
                      {gap.origin_country} → {gap.target_country}
                    </span>
                    <span className="font-telemetry text-[10px] px-2 py-0.5 rounded bg-[#111319] text-[#cbc3d7] border border-[#282a30]">
                      {gap.platform === "ios" ? "🍎 iOS" : gap.platform === "android" ? "🤖 Android" : "⚡ Multi-Platform"}
                    </span>
                    <span className="font-telemetry text-[10px] text-[#4edea3] font-bold">
                      OPPORTUNITÉ ÉLEVÉE
                    </span>
                  </div>
                  <h3 className="font-headline text-[18px] font-bold text-[#e2e2eb] mt-1.5">
                    {gap.title}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="font-telemetry text-[26px] font-bold text-[#4cd7f6]">
                    {Math.round(gap.gap_score)}
                  </span>
                  <span className="font-telemetry text-[9px] text-[#958ea0] uppercase block">
                    SCORE DE GAP / 100
                  </span>
                </div>
              </div>

              <p className="text-[13px] text-[#cbc3d7] leading-relaxed">
                {gap.description}
              </p>

              {/* Comparison Metrics Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-[#111319] border border-[#1e1f26] font-telemetry text-[12px]">
                <div className="space-y-1">
                  <span className="text-[#958ea0] text-[10px] uppercase block">
                    🇺🇸 Marché d'origine ({gap.origin_country}) :
                  </span>
                  <div className="flex justify-between">
                    <span className="text-[#cbc3d7]">Demande :</span>
                    <strong className="text-[#4edea3]">{gap.origin_demand}/100</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#cbc3d7]">Concurrence :</span>
                    <strong className="text-[#ffb4ab]">{gap.origin_competition}/100 (Saturé)</strong>
                  </div>
                </div>

                <div className="space-y-1 md:border-l md:border-[#282a30] md:pl-4">
                  <span className="text-[#958ea0] text-[10px] uppercase block">
                    🇫🇷 Marché cible ({gap.target_country}) :
                  </span>
                  <div className="flex justify-between">
                    <span className="text-[#cbc3d7]">Demande émergente :</span>
                    <strong className="text-[#4edea3]">{gap.target_demand}/100</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#cbc3d7]">Concurrence locale :</span>
                    <strong className="text-[#4cd7f6]">{gap.target_competition}/100 (Très faible !)</strong>
                  </div>
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="p-3.5 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#d0bcff] text-[18px] mt-0.5">lightbulb</span>
                <div className="text-[12px] leading-relaxed">
                  <strong className="text-[#d0bcff] block font-telemetry text-[11px] uppercase">
                    Recommandation Solo Dev :
                  </strong>
                  <span className="text-[#e2e2eb]">{gap.recommended_action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
