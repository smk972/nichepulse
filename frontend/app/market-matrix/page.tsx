"use client";

import React, { useState, useEffect } from "react";
import ScoreGauge from "@/components/ScoreGauge";
import ScoreExplanationModal from "@/components/ScoreExplanationModal";
import { api } from "@/lib/api";
import { usePlatform } from "@/lib/PlatformContext";

export default function MarketMatrixPage() {
  const { platform, setPlatform, platformLabel } = usePlatform();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    api.getOpportunities(filterStatus || undefined, platform)
      .then((res) => setOpportunities(res))
      .catch((err) => console.error("Erreur opportunities:", err))
      .finally(() => setLoading(false));
  }, [filterStatus, platform]);

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-telemetry text-[11px] uppercase px-2 py-0.5 rounded bg-[#7c3aed]/15 text-[#d0bcff] font-bold border border-[#7c3aed]/30">
              MATRICE DE DÉCISION
            </span>
            <span className="font-telemetry text-[11px] text-[#4edea3]">BUILD SCORE / 100</span>
            <span className="font-telemetry text-[11px] px-2 py-0.5 rounded bg-[#282a30] text-[#4cd7f6] font-bold">
              {platformLabel}
            </span>
          </div>
          <h1 className="font-headline text-[26px] text-[#e2e2eb] font-extrabold tracking-tight mt-1">
            Matrice des Opportunités &amp; Recommandations
          </h1>
          <p className="text-[13px] text-[#cbc3d7]">
            Quelle application devriez-vous développer maintenant ? Réponse chiffrée selon demande et faisabilité solo.
          </p>
        </div>

        {/* Dual Filters: Platform + Status */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Platform filter buttons */}
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

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 bg-[#191b22] p-1 rounded-xl border border-[#282a30]">
            {[
              { label: "Toutes", val: "" },
              { label: "🔥 BUILD IT", val: "BUILD IT" },
              { label: "🔍 INVESTIGATE", val: "INVESTIGATE" },
              { label: "⛔ AVOID", val: "AVOID" },
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => setFilterStatus(item.val)}
                className={`px-3 py-1.5 rounded-lg font-telemetry text-[11px] font-bold transition-colors ${
                  filterStatus === item.val
                    ? "bg-[#7c3aed] text-white"
                    : "text-[#cbc3d7] hover:text-[#e2e2eb]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Opportunities Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-[#958ea0] font-telemetry text-[13px]">
          <span className="animate-spin mr-2">⟳</span> Chargement des opportunités {platformLabel}...
        </div>
      ) : opportunities.length === 0 ? (
        <div className="p-12 text-center text-[#958ea0] font-telemetry bg-[#191b22] rounded-2xl border border-[#282a30]">
          Aucune opportunité trouvée pour les filtres sélectionnés.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="glass-card-interactive p-6 rounded-2xl border border-[#1e2536] space-y-4 group shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-telemetry text-[10px] px-2 py-0.5 rounded-md bg-[#161b26] text-[#d0bcff] font-bold border border-[#2a344d]">
                        {opp.niche}
                      </span>
                      <span
                        className={`font-telemetry text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          opp.status === "BUILD IT"
                            ? "bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30"
                            : opp.status === "INVESTIGATE"
                            ? "bg-[#06b6d4]/15 text-[#38bdf8] border border-[#06b6d4]/30"
                            : "bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/30"
                        }`}
                      >
                        {opp.status === "BUILD IT" ? "🔥 BUILD IT" : opp.status}
                      </span>
                      <span className="font-telemetry text-[10px] px-2 py-0.5 rounded-md bg-[#0d1117] text-[#94a3b8] border border-[#1e2536]">
                        {opp.platform === "ios" ? "🍎 iOS" : opp.platform === "android" ? "🤖 Android" : "⚡ Multi-Platform"}
                      </span>
                    </div>
                    <h3 className="font-headline text-[19px] font-bold text-white mt-2 group-hover:text-[#38bdf8] transition-colors">
                      {opp.title}
                    </h3>
                  </div>

                  <ScoreGauge
                    score={opp.build_score}
                    size="md"
                    onClick={() => setSelectedOpp(opp)}
                  />
                </div>

                <p className="text-[13px] text-[#cbd5e1] leading-relaxed font-sans font-normal">
                  {opp.summary}
                </p>

                {/* Sub metrics grid */}
                <div className="grid grid-cols-3 gap-2 font-telemetry text-[11px] p-3 rounded-xl bg-[#0d1117] border border-[#1e2536]">
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block font-medium">Demande</span>
                    <strong className="text-[#34d399]">{opp.search_demand_score}/100</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block font-medium">Momentum</span>
                    <strong className="text-[#38bdf8]">{opp.momentum_score}/100</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block font-medium">Market Gap</span>
                    <strong className="text-[#d0bcff]">{opp.market_gap_score}/100</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block font-medium">Concurrence</span>
                    <strong className="text-[#34d399]">{opp.competition_score}/100</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block font-medium">Facilité Dev</span>
                    <strong className="text-white">{opp.easy_build_score}/100</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block font-medium">MVP Estimé</span>
                    <strong className="text-[#d0bcff]">{opp.mvp_days}</strong>
                  </div>
                </div>
              </div>

              {/* Action Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#282a30]">
                <span className="font-telemetry text-[11px] text-[#958ea0]">
                  ARPU : <strong className="text-[#4edea3]">{opp.estimated_arpu}</strong>
                </span>
                <button
                  onClick={() => setSelectedOpp(opp)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[12px] font-bold shadow-md shadow-[#7c3aed]/20 transition-all flex items-center gap-1.5"
                >
                  <span>Pourquoi {Math.round(opp.build_score)}/100 ?</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Explanation Modal */}
      {selectedOpp && (
        <ScoreExplanationModal
          isOpen={Boolean(selectedOpp)}
          onClose={() => setSelectedOpp(null)}
          opportunity={selectedOpp}
        />
      )}
    </div>
  );
}
