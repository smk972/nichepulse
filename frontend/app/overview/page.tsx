"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sparkline from "@/components/Sparkline";
import ScoreGauge from "@/components/ScoreGauge";
import ScoreExplanationModal from "@/components/ScoreExplanationModal";
import AppDetailDrawer from "@/components/AppDetailDrawer";
import { api } from "@/lib/api";
import { usePlatform, PlatformType } from "@/lib/PlatformContext";

export default function OverviewPage() {
  const { platform, setPlatform, platformLabel } = usePlatform();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [period, setPeriod] = useState("30j");

  useEffect(() => {
    setLoading(true);
    api.getOverview(platform)
      .then((res) => setData(res))
      .catch((err) => console.error("Erreur overview:", err))
      .finally(() => setLoading(false));
  }, [platform]);

  const topOpp = data?.top_opportunity;
  const kpis = data?.kpis;
  const breakouts = data?.recent_breakouts || [];
  const alerts = data?.recent_alerts || [];
  const telemetry = data?.live_telemetry;

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-8">
      {/* Top Context Bar & Active Filters */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-telemetry text-[11px] uppercase px-2 py-0.5 rounded bg-[#7c3aed]/15 text-[#d0bcff] font-bold border border-[#7c3aed]/30">
              NichePulse Engine v3.4
            </span>
            <span className="font-telemetry text-[11px] text-[#958ea0]">/</span>
            <span className="font-telemetry text-[11px] text-[#4edea3] flex items-center gap-1.5 font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
              {telemetry?.status || "LIVE TELEMETRY"}
            </span>
          </div>
          <h1 className="font-headline text-[28px] text-[#e2e2eb] font-extrabold tracking-tight">
            Intelligence de Marché — <span className="text-[#4cd7f6]">{platformLabel}</span>
          </h1>
          <p className="text-[13px] text-[#cbc3d7] max-w-2xl">
            Découvrez quelle application développer en solo dev. Analyse en continu de{" "}
            <span className="font-telemetry text-[#e2e2eb] font-semibold">
              {telemetry?.apps_analyzed?.toLocaleString() || "24 890"} applications
            </span>{" "}
            sur {platform === "ios" ? "Apple App Store" : platform === "android" ? "Google Play Store" : "App Store & Google Play"}.
          </p>
        </div>

        {/* Filter Ribbon */}
        <div className="flex flex-wrap items-center gap-2.5 p-1 bg-[#191b22] rounded-xl border border-[#282a30]">
          {/* Plateforme Selector Dedicated */}
          <div className="flex items-center bg-[#282a30] rounded-lg p-0.5 font-telemetry text-[11px]">
            <button
              onClick={() => setPlatform("all")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                platform === "all"
                  ? "bg-[#7c3aed] text-white font-bold shadow-sm"
                  : "text-[#cbc3d7] hover:text-[#e2e2eb]"
              }`}
            >
              ⚡ Combiné
            </button>
            <button
              onClick={() => setPlatform("ios")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                platform === "ios"
                  ? "bg-[#7c3aed] text-white font-bold shadow-sm"
                  : "text-[#cbc3d7] hover:text-[#e2e2eb]"
              }`}
            >
              🍎 iOS
            </button>
            <button
              onClick={() => setPlatform("android")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                platform === "android"
                  ? "bg-[#06b6d4] text-[#0c0e14] font-bold shadow-sm"
                  : "text-[#cbc3d7] hover:text-[#e2e2eb]"
              }`}
            >
              🤖 Android
            </button>
          </div>

          {/* Périodes */}
          <div className="flex items-center bg-[#282a30] rounded-lg p-0.5 font-telemetry text-[11px]">
            {["7j", "30j", "90j", "1 an"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  period === p
                    ? "bg-[#7c3aed] text-white font-bold shadow-sm"
                    : "text-[#cbc3d7] hover:text-[#e2e2eb]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Pays */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1e1f26] text-[#e2e2eb] text-[12px] font-telemetry border border-[#282a30]">
            <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">public</span>
            <span>🇺🇸 US + 🇪🇺 FR, UK, DE</span>
          </div>
        </div>
      </div>

      {/* 6 MAIN TELEMETRY KPI CARDS (Bento Grid Style - UI/UX Pro Max) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* KPI 1 */}
        <div className="glass-card-interactive p-4 rounded-xl flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="font-telemetry text-[9.5px] text-[#94a3b8] uppercase tracking-wider font-semibold">
              {kpis?.trend_score?.label || "SCORE TENDANCE"}
            </span>
            <span className="font-telemetry text-[9.5px] px-1.5 py-0.5 rounded-md bg-[#10b981]/15 text-[#34d399] font-bold border border-[#10b981]/30">
              {kpis?.trend_score?.delta || "+14,8%"}
            </span>
          </div>
          <div className="my-2.5 flex items-baseline justify-between">
            <span className="font-telemetry text-[27px] font-bold text-white tracking-tight">
              {kpis?.trend_score?.value || 92}
              <span className="text-[12px] text-[#64748b] font-normal">/100</span>
            </span>
            <Sparkline data={kpis?.trend_score?.sparkline || [30, 42, 50, 68, 80, 92]} color="emerald" />
          </div>
          <span className="text-[11px] leading-snug text-[#94a3b8] line-clamp-2">
            {kpis?.trend_score?.description || "Assistants IA spécialisés micro-tâches en très nette accélération."}
          </span>
        </div>

        {/* KPI 2 */}
        <div className="glass-card-interactive p-4 rounded-xl flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="font-telemetry text-[9.5px] text-[#94a3b8] uppercase tracking-wider font-semibold">
              {kpis?.search_momentum?.label || "MOMENTUM SEARCH"}
            </span>
            <span className="font-telemetry text-[9.5px] px-1.5 py-0.5 rounded-md bg-[#10b981]/15 text-[#34d399] font-bold border border-[#10b981]/30">
              {kpis?.search_momentum?.delta || "+21,4%"}
            </span>
          </div>
          <div className="my-2.5 flex items-baseline justify-between">
            <span className="font-telemetry text-[27px] font-bold text-white tracking-tight">
              {kpis?.search_momentum?.value || 87}
              <span className="text-[12px] text-[#64748b] font-normal">/100</span>
            </span>
            <Sparkline data={kpis?.search_momentum?.sparkline || [25, 38, 45, 60, 72, 87]} color="cyan" />
          </div>
          <span className="text-[11px] leading-snug text-[#94a3b8] line-clamp-2">
            {kpis?.search_momentum?.description || "Volume de requêtes à forte intention d'achat."}
          </span>
        </div>

        {/* KPI 3 */}
        <div className="glass-card-interactive p-4 rounded-xl flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="font-telemetry text-[9.5px] text-[#94a3b8] uppercase tracking-wider font-semibold">
              {kpis?.new_apps?.label || "NOUVELLES APPS"}
            </span>
            <span className="font-telemetry text-[9.5px] px-1.5 py-0.5 rounded-md bg-[#10b981]/15 text-[#34d399] font-bold border border-[#10b981]/30">
              {kpis?.new_apps?.delta || "+18%"}
            </span>
          </div>
          <div className="my-2.5 flex items-baseline justify-between">
            <span className="font-telemetry text-[27px] font-bold text-[#d0bcff] tracking-tight">
              {kpis?.new_apps?.value || 128}
            </span>
            <Sparkline data={kpis?.new_apps?.sparkline || [40, 55, 70, 85, 102, 128]} color="violet" />
          </div>
          <span className="text-[11px] leading-snug text-[#94a3b8] line-clamp-2">
            {kpis?.new_apps?.description || "Applications indexées au cours des 14 derniers jours ouvrés."}
          </span>
        </div>

        {/* KPI 4 */}
        <div className="glass-card-interactive p-4 rounded-xl flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="font-telemetry text-[9.5px] text-[#94a3b8] uppercase tracking-wider font-semibold">
              {kpis?.fast_breakouts?.label || "BREAKOUTS RAPIDES"}
            </span>
            <span className="font-telemetry text-[9.5px] px-1.5 py-0.5 rounded-md bg-[#10b981]/15 text-[#34d399] font-bold border border-[#10b981]/30">
              {kpis?.fast_breakouts?.delta || "+33%"}
            </span>
          </div>
          <div className="my-2.5 flex items-baseline justify-between">
            <span className="font-telemetry text-[27px] font-bold text-[#38bdf8] tracking-tight">
              {kpis?.fast_breakouts?.value || 24}
            </span>
            <Sparkline data={kpis?.fast_breakouts?.sparkline || [8, 11, 14, 17, 20, 24]} color="cyan" />
          </div>
          <span className="text-[11px] leading-snug text-[#94a3b8] line-clamp-2">
            {kpis?.fast_breakouts?.description || "Applications gravissant >50 places dans les stores en 7 jours."}
          </span>
        </div>

        {/* KPI 5 */}
        <div className="glass-card-interactive p-4 rounded-xl flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="font-telemetry text-[9.5px] text-[#94a3b8] uppercase tracking-wider font-semibold">
              {kpis?.viable_niches?.label || "NICHES VIABLES"}
            </span>
            <span className="font-telemetry text-[9.5px] px-1.5 py-0.5 rounded-md bg-[#10b981]/15 text-[#34d399] font-bold border border-[#10b981]/30">
              {kpis?.viable_niches?.delta || "+42%"}
            </span>
          </div>
          <div className="my-2.5 flex items-baseline justify-between">
            <span className="font-telemetry text-[27px] font-bold text-[#34d399] tracking-tight">
              {kpis?.viable_niches?.value || 17}
            </span>
            <Sparkline data={kpis?.viable_niches?.sparkline || [5, 7, 9, 12, 14, 17]} color="emerald" />
          </div>
          <span className="text-[11px] leading-snug text-[#94a3b8] line-clamp-2">
            {kpis?.viable_niches?.description || "Segments sous-exploités avec un indice de saturation très bas."}
          </span>
        </div>

        {/* KPI 6 */}
        <div className="glass-card-interactive p-4 rounded-xl flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="font-telemetry text-[9.5px] text-[#94a3b8] uppercase tracking-wider font-semibold">
              {kpis?.mvp_opportunities?.label || "OPPORTUNITÉS MVP"}
            </span>
            <span className="font-telemetry text-[9.5px] px-1.5 py-0.5 rounded-md bg-[#10b981]/15 text-[#34d399] font-bold border border-[#10b981]/30">
              {kpis?.mvp_opportunities?.delta || "+27%"}
            </span>
          </div>
          <div className="my-2.5 flex items-baseline justify-between">
            <span className="font-telemetry text-[27px] font-bold text-[#d0bcff] tracking-tight">
              {kpis?.mvp_opportunities?.value || 31}
            </span>
            <Sparkline data={kpis?.mvp_opportunities?.sparkline || [10, 14, 18, 22, 27, 31]} color="violet" />
          </div>
          <span className="text-[11px] leading-snug text-[#94a3b8] line-clamp-2">
            {kpis?.mvp_opportunities?.description || "Idées faisables en solo dev avec un time-to-market < 10 jours."}
          </span>
        </div>
      </div>

      {/* HERO MODULE: OPPORTUNITÉ DU MOMENT (Bento Spotlight Card) */}
      <div className="relative overflow-hidden rounded-2xl glass-card border border-[#2a344d] p-7 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#7c3aed]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#06b6d4]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3.5 flex-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg font-telemetry text-[10.5px] font-extrabold bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white shadow-md shadow-[#7c3aed]/30">
                <span>🔥</span> OPPORTUNITÉ DU MOMENT • {platform === "ios" ? "N°1 APPLE APP STORE" : platform === "android" ? "N°1 GOOGLE PLAY" : "N°1 ALGORITHMIQUE COMBINÉ"}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#10b981]/15 text-[#34d399] font-telemetry text-[11px] font-bold border border-[#10b981]/30">
                CONFIDENCE SCORE: 98.4%
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#161b26] text-[#94a3b8] font-telemetry text-[11px] border border-[#2a344d]">
                CAT: {topOpp?.category || "FINANCE & PRODUCTIVITÉ"}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#06b6d4]/15 text-[#38bdf8] font-telemetry text-[11px] font-bold border border-[#06b6d4]/30">
                {platform === "ios" ? "🍎 iOS Only" : platform === "android" ? "🤖 Android Only" : "⚡ Multi-Platform"}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="font-headline text-[26px] text-white font-extrabold tracking-tight">
                {topOpp?.title || "AI Receipt Scanner & Expense Tagger"}
              </h2>
              <div className="flex items-center gap-2 text-[#34d399] font-telemetry text-[12px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
                <span>STATUT: 🔥 {topOpp?.status || "BUILD IT"} (RECOMMANDATION PRIORITAIRE)</span>
              </div>
            </div>

            <p className="text-[13.5px] text-[#cbd5e1] leading-relaxed font-sans">
              {topOpp?.summary ||
                "La demande de recherche progresse rapidement alors que les applications existantes reçoivent des critiques négatives concernant les abonnements exorbitants, les publicités intrusives et l'absence d'export CSV / Notion en 1 clic."}
            </p>

            {/* Quick Solo Dev Metrics Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-1 font-telemetry text-[11px]">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d1117] text-[#f1f5f9] border border-[#1e2536] shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-[#d0bcff]">schedule</span>
                <span>Taille MVP: <strong className="text-[#d0bcff]">5–8 jours</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d1117] text-[#f1f5f9] border border-[#1e2536] shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">architecture</span>
                <span>Complexité Solo: <strong className="text-[#38bdf8]">Faible / SQLite + Local AI</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d1117] text-[#f1f5f9] border border-[#1e2536] shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-[#34d399]">payments</span>
                <span>Monétisation: <strong className="text-[#34d399]">4,99$/mois ou 19,99€ Lifetime</strong></span>
              </div>
            </div>
          </div>

          {/* Radial Indicator & Action Cluster */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-center gap-4 p-5 bg-[#191b22]/90 border border-[#282a30] rounded-2xl shadow-xl">
            <div className="flex items-center gap-4">
              <ScoreGauge
                score={topOpp?.build_score || 94}
                size="lg"
                onClick={() => topOpp && setSelectedOpp(topOpp)}
              />
              <div className="space-y-1 font-telemetry text-[11px] min-w-[145px]">
                <div className="flex justify-between">
                  <span className="text-[#958ea0]">Demande:</span>
                  <span className="text-[#4edea3] font-bold">
                    {topOpp?.sub_scores?.demand_score || 94}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#958ea0]">Momentum:</span>
                  <span className="text-[#4cd7f6] font-bold">
                    {topOpp?.sub_scores?.momentum_score || 89}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#958ea0]">Niche libre:</span>
                  <span className="text-[#d0bcff] font-bold">
                    {topOpp?.sub_scores?.niche_viability_score || 91}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#958ea0]">Concurrence:</span>
                  <span className="text-[#4edea3] font-bold">
                    {topOpp?.sub_scores?.competition_score || 38}/100 (Faible)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#958ea0]">Facilité MVP:</span>
                  <span className="text-[#e2e2eb] font-bold">
                    {topOpp?.sub_scores?.solo_developer_feasibility_score || 93}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col w-full gap-2">
              <button
                onClick={() => topOpp && setSelectedOpp(topOpp)}
                className="w-full py-2.5 px-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[13px] font-bold rounded-lg shadow-lg shadow-[#7c3aed]/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Pourquoi {topOpp?.build_score || 94}/100 ? (Décomposition)</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
              <div className="flex gap-2 w-full">
                <Link
                  href="/watchlist"
                  className="flex-1 py-1.5 px-2 bg-[#282a30] hover:bg-[#33343b] text-[#e2e2eb] rounded-lg text-[12px] flex items-center justify-center gap-1 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#4edea3]">bookmark_add</span>
                  <span>Surveiller</span>
                </Link>
                <Link
                  href="/idea-backlog"
                  className="flex-1 py-1.5 px-2 bg-[#282a30] hover:bg-[#33343b] text-[#e2e2eb] rounded-lg text-[12px] flex items-center justify-center gap-1 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#4cd7f6]">lightbulb</span>
                  <span>Voir l'Idée</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: TOP BREAKOUTS & LIVE SIGNAL FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Breakouts Rapides */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">rocket_launch</span>
              <h3 className="font-headline text-[18px] font-bold text-[#e2e2eb]">
                Breakouts en forte progression ({platformLabel})
              </h3>
            </div>
            <Link href="/fast-movers" className="font-telemetry text-[11px] text-[#4cd7f6] hover:underline flex items-center gap-1">
              <span>Voir tous les breakouts</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-2.5">
            {breakouts.map((item: any) => (
              <div
                key={item.id}
                onClick={() => setSelectedAppId(item.id)}
                className="glass-card-interactive p-4 rounded-xl flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.icon_url || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=128"}
                    alt={item.name}
                    className="w-11 h-11 rounded-xl object-cover border border-[#1e2536] shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-[14px] text-white group-hover:text-[#38bdf8] transition-colors">
                        {item.name}
                      </strong>
                      <span className="font-telemetry text-[9px] px-1.5 py-0.2 rounded bg-[#7c3aed]/20 text-[#d0bcff] font-bold border border-[#7c3aed]/30">
                        {item.category}
                      </span>
                      <span className="font-telemetry text-[9px] px-1.5 py-0.2 rounded bg-[#06b6d4]/15 text-[#38bdf8] font-bold uppercase border border-[#06b6d4]/25">
                        {item.platform === "ios" ? "🍎 iOS" : "🤖 Android"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="font-telemetry text-[11px] text-[#38bdf8] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-[#64748b]">apartment</span>
                        {item.company_name || item.developer}
                      </span>
                      <span className="text-[#64748b] text-[10px]">•</span>
                      <span className="font-telemetry text-[11px] text-[#94a3b8]">
                        {(item.downloads_count || 50000).toLocaleString()} dl
                      </span>
                      <span className="text-[#64748b] text-[10px]">•</span>
                      <span className="font-telemetry text-[10.5px] px-1.5 py-0.2 rounded bg-[#10b981]/15 text-[#34d399] font-bold">
                        {item.downloads_growth || "+18.5% ce mois"}
                      </span>
                      <span className="text-[#64748b] text-[10px]">•</span>
                      <span className="font-telemetry text-[10.5px] text-[#fbbf24] font-semibold">
                        {item.subscription_price || (item.has_in_app_purchases ? "In-App" : "Gratuit")}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[12px] text-[#94a3b8] line-clamp-1 mt-0.5 max-w-xl font-sans">
                        {item.functional_summary || item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-telemetry text-[11px]">
                    <span className="text-[#34d399] font-bold block">+126 places</span>
                    <span className="text-[#64748b] text-[10px]">Vélocité: Rapide</span>
                  </div>
                  <span className="material-symbols-outlined text-[#64748b] group-hover:text-white transition-colors">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live Alerts Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#d0bcff] text-[20px]">notifications_active</span>
              <h3 className="font-headline text-[17px] font-bold text-white">
                Signaux &amp; Alertes
              </h3>
            </div>
            <Link href="/signal-feed" className="font-telemetry text-[11px] text-[#d0bcff] hover:underline">
              Historique
            </Link>
          </div>

          <div className="space-y-2.5">
            {alerts.map((al: any) => (
              <div
                key={al.id}
                className="glass-card p-3.5 rounded-xl space-y-1.5 border border-[#1e2536]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-telemetry text-[9.5px] px-2 py-0.5 rounded-md bg-[#7c3aed]/20 text-[#d0bcff] font-bold border border-[#7c3aed]/30">
                    {al.type}
                  </span>
                  <span className="font-telemetry text-[10px] text-[#64748b]">Il y a 18m</span>
                </div>
                <strong className="text-[13px] text-white block">
                  {al.title}
                </strong>
                <p className="text-[11.5px] text-[#94a3b8] leading-relaxed">
                  {al.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {selectedOpp && (
        <ScoreExplanationModal
          isOpen={Boolean(selectedOpp)}
          onClose={() => setSelectedOpp(null)}
          opportunity={selectedOpp}
        />
      )}

      {selectedAppId && (
        <AppDetailDrawer
          appId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
        />
      )}
    </div>
  );
}
