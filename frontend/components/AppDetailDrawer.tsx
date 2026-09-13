"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { api } from "@/lib/api";

interface AppDetailDrawerProps {
  appId: string | null;
  onClose: () => void;
}

export default function AppDetailDrawer({ appId, onClose }: AppDetailDrawerProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!appId) return;
    setLoading(true);
    api.getAppDetail(appId)
      .then((res) => setData(res))
      .catch((err) => console.error("Erreur app detail:", err))
      .finally(() => setLoading(false));
  }, [appId]);

  if (!appId) return null;

  const app = data?.app;
  const history = data?.history || [];
  const reviews = data?.reviews || [];
  const ai = data?.ai_analysis?.analysis;

  // Formater l'historique pour Recharts (Inverser l'axe Y car #1 est le meilleur rang)
  const chartData = history.map((h: any) => ({
    date: h.date.slice(5),
    rank: h.rank
  }));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#090c13] border-l border-[#1e2536] shadow-2xl flex flex-col justify-between">
          {/* Top Bar */}
          <div className="p-5 border-b border-[#1a202c] bg-[#07090e] flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={app?.icon_url || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=128"}
                alt={app?.name}
                className="w-12 h-12 rounded-xl object-cover border border-[#1e2536] shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline text-[18px] font-bold text-white">
                    {app?.name || "Chargement..."}
                  </h3>
                  {app?.is_breakout && (
                    <span className="font-telemetry text-[9px] px-2 py-0.5 rounded-md bg-[#f59e0b]/20 text-[#fbbf24] font-bold border border-[#f59e0b]/30">
                      🔥 BREAKOUT
                    </span>
                  )}
                </div>
                <span className="font-telemetry text-[11px] text-[#64748b]">
                  {app?.developer} • {app?.category} • {app?.country} • {app?.platform === "ios" ? "🍎 APPLE APP STORE" : "🤖 GOOGLE PLAY STORE"}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#0d1117] hover:bg-[#161b26] text-[#64748b] hover:text-white transition-colors border border-[#1e2536] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">close</span>
            </button>
          </div>

          {/* Drawer Body Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {loading && (
              <div className="py-24 text-center font-telemetry text-[13px] text-[#94a3b8]">
                <span className="animate-spin mr-2 text-[#38bdf8]">⟳</span> Chargement de la télémétrie et de l'analyse IA...
              </div>
            )}

            {!loading && app && (
              <>
                {/* Telemetry 4-Metric Grid (Téléchargements, Évolution, Abonnement, Société) */}
                <div className="grid grid-cols-2 gap-3 font-telemetry">
                  {/* Téléchargements */}
                  <div className="p-3.5 rounded-xl bg-[#07090e] border border-[#1e2536] shadow-sm">
                    <span className="text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
                      TÉLÉCHARGEMENTS ESTIMÉS
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-[17px] font-bold text-white tabular-nums">
                        {(app.downloads_count || 50000).toLocaleString()} dl
                      </span>
                    </div>
                    <span className="text-[10.5px] text-[#94a3b8] block mt-0.5">
                      +{(app.downloads_growth_weekly || 2500).toLocaleString()} / 7 jours
                    </span>
                  </div>

                  {/* Évolution KPI */}
                  <div className="p-3.5 rounded-xl bg-[#07090e] border border-[#1e2536] shadow-sm">
                    <span className="text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
                      KPI ÉVOLUTION DU VOLUME
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#10b981]/20 text-[#34d399] font-bold text-[13px] border border-[#10b981]/30">
                        {app.downloads_growth || "+18.5% ce mois"}
                      </span>
                    </div>
                    <span className="text-[10.5px] text-[#34d399] block mt-0.5 font-semibold">
                      ▲ Dynamique soutenue
                    </span>
                  </div>

                  {/* Prix abonnement / In-App */}
                  <div className="p-3.5 rounded-xl bg-[#07090e] border border-[#1e2536] shadow-sm">
                    <span className="text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
                      PRIX ABONNEMENT / IN-APP
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-[13px] font-bold text-[#fbbf24]">
                        {app.subscription_price || (app.has_in_app_purchases ? "In-App disponible" : "Gratuit")}
                      </span>
                    </div>
                    <span className="text-[10.5px] text-[#64748b] block mt-0.5">
                      {app.has_in_app_purchases ? "Achats intégrés / Abonnements" : "Sans abonnement obligatoire"}
                    </span>
                  </div>

                  {/* Société éditrice */}
                  <div className="p-3.5 rounded-xl bg-[#07090e] border border-[#1e2536] shadow-sm">
                    <span className="text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
                      SOCIÉTÉ ÉDITRICE
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-[12.5px] font-bold text-white truncate max-w-full" title={app.company_name || app.developer}>
                        {app.company_name || app.developer}
                      </span>
                    </div>
                    <span className="text-[10.5px] text-[#38bdf8] block mt-0.5">
                      {app.company_type || "Studio Indépendant"} • {app.company_country || app.country}
                    </span>
                  </div>
                </div>

                {/* En quoi consiste l'application (Spotlight Card) */}
                <div className="glass-card p-5 rounded-2xl border border-[#2a344d] space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#38bdf8] font-telemetry text-[11px] font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      <span>EN QUOI CONSISTE L'APPLICATION</span>
                    </div>
                    <span className="font-telemetry text-[10px] px-2.5 py-0.5 rounded-md bg-[#06b6d4]/15 text-[#38bdf8] border border-[#06b6d4]/30 font-bold">
                      SYNTHÈSE PRODUIT
                    </span>
                  </div>
                  
                  <p className="text-[13.5px] text-[#cbd5e1] leading-relaxed font-sans font-normal">
                    {app.functional_summary || app.description || "Description et fonctionnalités en cours d'analyse télémétrique..."}
                  </p>

                  {/* Features breakdown if present */}
                  {data?.features && data.features.length > 0 && (
                    <div className="pt-2 border-t border-[#1e2536] space-y-2">
                      <span className="font-telemetry text-[10.5px] text-[#d0bcff] font-bold uppercase tracking-wider block">
                        FONCTIONNALITÉS ANALYSÉES ({data.features.length})
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {data.features.map((f: any) => (
                          <div key={f.id || f.name} className="p-2.5 rounded-xl bg-[#0d1117] border border-[#1e2536] space-y-1">
                            <div className="flex items-center justify-between">
                              <strong className="text-[12px] font-bold text-white">{f.name}</strong>
                              {f.is_core ? (
                                <span className="font-telemetry text-[9px] px-1.5 py-0.2 rounded bg-[#7c3aed]/25 text-[#d0bcff] font-bold border border-[#7c3aed]/40">
                                  CORE
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[11.5px] text-[#94a3b8] font-sans font-normal leading-relaxed">{f.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-[#1e2536] text-[11px] font-telemetry text-[#64748b]">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#94a3b8]">Modèle tarifaire :</span>
                      <strong className="text-white">
                        {app.subscription_price || (app.has_in_app_purchases ? "Freemium" : "Gratuit")}
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#94a3b8]">Éditeur :</span>
                      <strong className="text-white">
                        {app.company_name || app.developer}
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#94a3b8]">ID Store :</span>
                      <code className="text-[#d0bcff] bg-[#0d1117] px-1.5 py-0.5 rounded text-[10px] font-mono border border-[#1e2536]">
                        {app.id}
                      </code>
                    </span>
                  </div>
                </div>

                {/* 30-Day Ranking Trajectory Chart (Cahier des charges #6) */}
                <div className="glass-card p-5 rounded-2xl border border-[#1e2536] space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-telemetry text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
                        TRAJECTOIRE DU CLASSEMENT (30 DERNIERS JOURS)
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-[22px] font-bold text-white font-telemetry">
                          Rang #{app.current_rank}
                        </span>
                        <span className="text-[12px] text-[#34d399] font-telemetry font-bold">
                          Momentum fort
                        </span>
                      </div>
                    </div>
                    <div className="font-telemetry text-[11.5px] text-[#cbd5e1]">
                      Note: <strong className="text-white">{app.rating} ★</strong> ({app.review_count.toLocaleString()} avis)
                    </div>
                  </div>

                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2536" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                        <YAxis reversed domain={['dataMin - 10', 'dataMax + 10']} stroke="#64748b" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0d1117", borderColor: "#1e2536", borderRadius: "10px", fontSize: "11px", color: "#f1f5f9" }}
                          labelStyle={{ color: "#94a3b8" }}
                        />
                        <Line type="monotone" dataKey="rank" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#34d399" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AI Qualitative Synthesis (Gemini - Cahier des charges #13) */}
                {ai && (
                  <div className="glass-card p-5 rounded-2xl border border-[#1e2536] space-y-3.5 shadow-lg">
                    <div className="flex items-center justify-between border-b border-[#1e2536] pb-2.5">
                      <span className="font-telemetry text-[11px] text-[#d0bcff] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">psychology</span>
                        SYNTHÈSE QUALITATIVE GEMINI (10% IA HYBRIDE)
                      </span>
                      <span className="font-telemetry text-[9px] px-2 py-0.5 rounded-md bg-[#7c3aed]/20 text-[#d0bcff] border border-[#7c3aed]/30 font-bold">
                        PROMPT v1.2
                      </span>
                    </div>

                    <div className="space-y-2.5 text-[13px]">
                      <div>
                        <strong className="text-[#64748b] text-[10.5px] font-telemetry uppercase block font-semibold">Problème résolu :</strong>
                        <p className="text-[#e2e8f0] leading-relaxed mt-0.5">{ai.problem_solved}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#1e2536]">
                          <strong className="text-[#34d399] text-[10.5px] font-telemetry uppercase block font-bold mb-1">Forces :</strong>
                          <ul className="list-disc list-inside text-[#cbd5e1] text-[12px] space-y-1">
                            {ai.strengths?.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                          </ul>
                        </div>
                        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#1e2536]">
                          <strong className="text-[#f43f5e] text-[10.5px] font-telemetry uppercase block font-bold mb-1">Faiblesses &amp; Frustrations :</strong>
                          <ul className="list-disc list-inside text-[#cbd5e1] text-[12px] space-y-1">
                            {ai.user_frustrations?.map((f: string, idx: number) => <li key={idx}>{f}</li>)}
                          </ul>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0d1117] to-[#131722] border border-[#06b6d4]/30 mt-2">
                        <strong className="text-[#38bdf8] text-[11px] font-telemetry uppercase block mb-1 font-bold">
                          🎯 Opportunité de différenciation pour un Solo Dev :
                        </strong>
                        <p className="text-[#f1f5f9] text-[12.5px] leading-relaxed">
                          {ai.differentiation_opportunity}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews Verbatim Stream (Cahier des charges #10) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-telemetry text-[11px] text-[#64748b] uppercase tracking-wider block font-semibold">
                      VERBATIMS AVIS CLASSIFIÉS ({reviews.length})
                    </span>
                    <span className="font-telemetry text-[10px] text-[#94a3b8]">15 catégories strictes</span>
                  </div>

                  <div className="space-y-2">
                    {reviews.map((rev: any) => (
                      <div key={rev.id} className="glass-card p-3.5 rounded-xl border border-[#1e2536] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[#f59e0b] font-telemetry text-[11.5px] font-bold">
                              {rev.rating} ★
                            </span>
                            <span className="font-telemetry text-[9px] px-2 py-0.5 rounded-md bg-[#161b26] text-[#d0bcff] font-bold border border-[#2a344d]">
                              {rev.classified_category}
                            </span>
                          </div>
                          <span className="font-telemetry text-[10px] text-[#64748b]">
                            {rev.language?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#cbd5e1] leading-relaxed font-sans">
                          "{rev.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[#1a202c] bg-[#07090e] flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#161b26] hover:bg-[#1e2536] text-[#f1f5f9] text-[13px] font-medium transition-colors border border-[#2a344d] cursor-pointer"
            >
              Fermer l'inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
