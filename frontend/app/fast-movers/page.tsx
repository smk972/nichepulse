"use client";

import React, { useState, useEffect } from "react";
import Sparkline from "@/components/Sparkline";
import AppDetailDrawer from "@/components/AppDetailDrawer";
import { api } from "@/lib/api";
import { usePlatform } from "@/lib/PlatformContext";

export default function FastMoversPage() {
  const { platform, setPlatform, platformLabel } = usePlatform();
  const [breakouts, setBreakouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getBreakouts(platform)
      .then((res) => setBreakouts(res))
      .catch((err) => console.error("Erreur breakouts:", err))
      .finally(() => setLoading(false));
  }, [platform]);

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-telemetry text-[11px] uppercase px-2 py-0.5 rounded bg-[#06b6d4]/15 text-[#4cd7f6] font-bold border border-[#06b6d4]/30">
              DÉTECTION ALGORYTHMIQUE
            </span>
            <span className="font-telemetry text-[11px] text-[#4edea3]">VÉLOCITÉ &gt; 5.0 PLACES/JOUR</span>
            <span className="font-telemetry text-[11px] px-2 py-0.5 rounded bg-[#282a30] text-[#d0bcff] font-bold">
              {platformLabel}
            </span>
          </div>
          <h1 className="font-headline text-[26px] text-[#e2e2eb] font-extrabold tracking-tight mt-1">
            Breakouts : Applications en Forte Progression
          </h1>
          <p className="text-[13px] text-[#cbc3d7]">
            Applications qui gravissent rapidement les échelons des classements avant d'atteindre la saturation.
          </p>
        </div>

        {/* Quick Platform Switcher */}
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

      {/* Breakouts Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-[#94a3b8] font-telemetry text-[13px] glass-card rounded-2xl border border-[#1e2536]">
          <span className="animate-spin mr-2 text-[#38bdf8]">⟳</span> Détection des vélocités et classements {platformLabel}...
        </div>
      ) : breakouts.length === 0 ? (
        <div className="p-16 text-center text-[#94a3b8] font-telemetry glass-card rounded-2xl border border-[#1e2536]">
          Aucun breakout actif détecté pour {platformLabel}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {breakouts.map(({ app, metrics, history }) => {
            const sparklineRanks = history?.map((h: any) => h.rank) || [200, 150, 100, 60, 20];
            return (
              <div
                key={app.id}
                onClick={() => setSelectedAppId(app.id)}
                className="glass-card-interactive p-5 rounded-2xl border border-[#1e2536] cursor-pointer group space-y-3.5 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={app.icon_url || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=128"}
                      alt={app.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#1e2536] group-hover:border-[#7c3aed]/50 transition-colors shadow-sm"
                    />
                    <div>
                      <h3 className="font-headline text-[15.5px] font-bold text-white group-hover:text-[#38bdf8] transition-colors line-clamp-1">
                        {app.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-telemetry text-[#38bdf8]">
                        <span className="material-symbols-outlined text-[13px] text-[#64748b]">apartment</span>
                        <span className="truncate max-w-[180px]" title={app.company_name || app.developer}>
                          {app.company_name || app.developer}
                        </span>
                        <span className="text-[#64748b] text-[10px]">({app.company_country || app.country})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-telemetry text-[11px] text-[#64748b]">
                          {app.category}
                        </span>
                        <span className="font-telemetry text-[9px] px-1.5 py-0.2 rounded-md bg-[#06b6d4]/15 text-[#38bdf8] font-bold uppercase border border-[#06b6d4]/25">
                          {app.platform === "ios" ? "🍎 iOS" : "🤖 Android"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-telemetry text-[24px] font-bold text-[#34d399] tracking-tight">
                      {metrics.momentum_score}
                    </span>
                    <span className="font-telemetry text-[8.5px] text-[#64748b] uppercase block font-semibold">
                      MOMENTUM
                    </span>
                  </div>
                </div>

                {app.description && (
                  <p className="text-[12px] text-[#94a3b8] line-clamp-2 leading-relaxed font-sans">
                    {app.functional_summary || app.description}
                  </p>
                )}

                {/* Telemetry Strip: Téléchargements, Évolution, Abonnement */}
                <div className="grid grid-cols-3 gap-2 font-telemetry text-[10.5px] p-2.5 rounded-xl bg-[#07090e] border border-[#1e2536]">
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block font-semibold">Téléchargements</span>
                    <strong className="text-white">{(app.downloads_count || 50000).toLocaleString()} dl</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block font-semibold">KPI Évolution</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#10b981]/20 text-[#34d399] font-bold text-[10px] inline-block">
                      {app.downloads_growth || "+18.5% ce mois"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block font-semibold">Tarif In-App</span>
                    <strong className="text-[#fbbf24] truncate block" title={app.subscription_price}>
                      {app.subscription_price || (app.has_in_app_purchases ? "In-App" : "Gratuit")}
                    </strong>
                  </div>
                </div>

                {/* Ranks Delta Strip */}
                <div className="grid grid-cols-3 gap-2 font-telemetry text-[11px] p-2.5 rounded-xl bg-[#0d1117] border border-[#1e2536]">
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block font-medium">Gain 24h</span>
                    <strong className="text-[#34d399]">+{metrics.rank_change_1d}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block font-medium">Gain 7j</span>
                    <strong className="text-[#38bdf8]">+{metrics.rank_change_7d}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b] text-[9px] uppercase block font-medium">Gain 30j</span>
                    <strong className="text-[#d0bcff]">+{metrics.rank_change_30d}</strong>
                  </div>
                </div>

                {/* Sparkline & Velocity */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-telemetry text-[9.5px] text-[#64748b] block font-semibold">VÉLOCITÉ 7J</span>
                    <span className="font-telemetry text-[12px] font-bold text-white">
                      {metrics.velocity_7d} places/j
                    </span>
                  </div>
                  <Sparkline data={sparklineRanks} color="cyan" width={90} height={30} />
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-[#1e2536] text-[11px] text-[#64748b] font-telemetry">
                  <span>Rang actuel : <strong className="text-white">#{app.current_rank}</strong></span>
                  <span className="text-[#38bdf8] font-semibold group-hover:underline flex items-center gap-1">
                    Inspecter <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      {selectedAppId && (
        <AppDetailDrawer
          appId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
        />
      )}
    </div>
  );
}
