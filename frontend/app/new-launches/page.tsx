"use client";

import React, { useState, useEffect } from "react";
import AppDetailDrawer from "@/components/AppDetailDrawer";
import { api } from "@/lib/api";
import { usePlatform, PlatformType } from "@/lib/PlatformContext";

interface Feature {
  id: number;
  name: string;
  description: string;
  is_core: boolean;
}

interface NewLaunchApp {
  id: string;
  name: string;
  developer: string;
  icon_url: string;
  category: string;
  platform: string;
  country: string;
  current_rank: number;
  rating: number;
  review_count: number;
  price: number;
  has_in_app_purchases: boolean;
  subscription_price: string;
  downloads_count: number;
  downloads_growth: string;
  downloads_growth_weekly: number;
  company_name: string;
  company_country: string;
  company_type: string;
  release_date: string;
  store_url?: string;
  functional_summary: string;
  description: string;
  features: Feature[];
}

export default function NewLaunchesPage() {
  const { platform, setPlatform, platformLabel } = usePlatform();
  const [data, setData] = useState<{ radar: any; apps: NewLaunchApp[] }>({
    radar: null,
    apps: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("downloads_growth");
  const [search, setSearch] = useState("");
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    api.getNewLaunches({
      platform: platform !== "all" ? platform : undefined,
      category: category || undefined,
      sort_by: sortBy,
      search: search || undefined
    })
      .then((res) => {
        setData(res);
        // Expand top 2 by default
        if (res.apps && res.apps.length > 0) {
          const initial: Record<string, boolean> = {};
          res.apps.slice(0, 3).forEach((a: NewLaunchApp) => {
            initial[a.id] = true;
          });
          setExpandedFeatures(initial);
        }
      })
      .catch((err) => console.error("Erreur new launches:", err))
      .finally(() => setLoading(false));
  }, [platform, category, sortBy, search]);

  const toggleExpand = (id: string) => {
    setExpandedFeatures((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const radar = data.radar;
  const apps = data.apps || [];

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-6">
      {/* Header & Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-telemetry text-[11px] uppercase px-2.5 py-0.5 rounded-md bg-[#10b981]/15 text-[#34d399] font-bold border border-[#10b981]/30 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">new_releases</span>
              RADAR LANCEMENTS RÉCENTS
            </span>
            <span className="font-telemetry text-[11px] text-[#38bdf8] font-semibold">
              STORES TELEMETRY (15-60 JOURS)
            </span>
            <span className="font-telemetry text-[11px] px-2 py-0.5 rounded bg-[#1e2536] text-[#cbd5e1] font-bold">
              {platformLabel}
            </span>
          </div>
          <h1 className="font-headline text-[26px] text-white font-extrabold tracking-tight mt-1.5">
            Nouvelles Applications &amp; Analyse Fonctionnelle
          </h1>
          <p className="text-[13px] text-[#94a3b8] max-w-3xl">
            Détectez les applications récemment lancées sur iOS et Android : volume de téléchargements, KPI d'évolution, tarif d'abonnement in-app, société éditrice et décorticage approfondi de leurs fonctionnalités clés.
          </p>
        </div>

        {/* Global Store Switcher (iOS / Android / Combiné) */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <div className="flex items-center bg-[#0d1117] p-1 rounded-xl border border-[#1e2536] font-telemetry text-[11px]">
            <button
              onClick={() => setPlatform("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                platform === "all"
                  ? "bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/30"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              ⚡ Combiné
            </button>
            <button
              onClick={() => setPlatform("ios")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                platform === "ios"
                  ? "bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/30"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              🍎 iOS ({radar?.ios_count ?? 12})
            </button>
            <button
              onClick={() => setPlatform("android")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                platform === "android"
                  ? "bg-[#06b6d4] text-[#07090e] shadow-md shadow-[#06b6d4]/30"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              🤖 Android ({radar?.android_count ?? 12})
            </button>
          </div>

          <div className="font-telemetry text-[12px] text-[#34d399] bg-[#0d1117] px-3 py-1.5 rounded-lg border border-[#1e2536] font-bold">
            {apps.length} NOUVEAUTÉS
          </div>
        </div>
      </div>

      {/* Radar Summary Metrics Bar */}
      {radar && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card p-3.5 rounded-xl border border-[#1e2536] bg-[#090c13]">
            <span className="font-telemetry text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
              APPLICATIONS RÉCENTES DÉTECTÉES
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-telemetry text-[20px] font-bold text-white tabular-nums">
                {radar.total_new_launches}
              </span>
              <span className="font-telemetry text-[10.5px] text-[#34d399] font-bold">
                {radar.ios_count} iOS • {radar.android_count} Android
              </span>
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-xl border border-[#1e2536] bg-[#090c13]">
            <span className="font-telemetry text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
              RATIO SOLO DEV &amp; STUDIOS INDIES
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-telemetry text-[20px] font-bold text-[#38bdf8] tabular-nums">
                {radar.indie_ratio}
              </span>
              <span className="font-telemetry text-[10.5px] text-[#94a3b8]">
                Opportunités solos fortes
              </span>
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-xl border border-[#1e2536] bg-[#090c13]">
            <span className="font-telemetry text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
              CATÉGORIE LA PLUS ACTIVE
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-telemetry text-[18px] font-bold text-[#d0bcff]">
                {radar.top_active_category}
              </span>
              <span className="font-telemetry text-[10.5px] text-[#64748b]">
                Forte traction
              </span>
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-xl border border-[#1e2536] bg-[#090c13]">
            <span className="font-telemetry text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
              ANCIENNETÉ MOYENNE SUR STORE
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-telemetry text-[20px] font-bold text-[#fbbf24] tabular-nums">
                {radar.avg_days_since_launch} jours
              </span>
              <span className="font-telemetry text-[10.5px] text-[#94a3b8]">
                Cycle ultra-récent
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Sorting Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-[#0d1117] rounded-xl border border-[#1e2536]">
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[17px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par application, société ou mot-clé fonctionnel..."
            className="w-full bg-[#07090e] border border-[#1e2536] text-white text-[13px] pl-9 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-[#7c3aed]"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[#07090e] border border-[#1e2536] text-white text-[12px] font-telemetry px-3 py-1.5 rounded-lg focus:outline-none"
        >
          <option value="">Toutes catégories</option>
          <option value="Productivity">⚡ Productivité</option>
          <option value="Finance">💰 Finance</option>
          <option value="Health & Fitness">🏃 Santé &amp; Fitness</option>
          <option value="Utilities">🛠️ Utilitaires</option>
          <option value="Business">💼 Business &amp; Facturation</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-[#07090e] border border-[#1e2536] text-white text-[12px] font-telemetry px-3 py-1.5 rounded-lg focus:outline-none"
        >
          <option value="downloads_growth">📈 Plus forte croissance (% d'évolution)</option>
          <option value="release_date">📅 Plus récentes en premier</option>
          <option value="downloads_count">📥 Nombre total de téléchargements</option>
        </select>

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as PlatformType)}
          className="bg-[#07090e] border border-[#1e2536] text-white text-[12px] font-telemetry px-3 py-1.5 rounded-lg focus:outline-none"
        >
          <option value="all">⚡ Toutes plateformes</option>
          <option value="ios">🍎 iOS uniquement</option>
          <option value="android">🤖 Android uniquement</option>
        </select>
      </div>

      {/* Main Apps List / Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-[#94a3b8] font-telemetry text-[13px] glass-card rounded-2xl border border-[#1e2536]">
          <span className="animate-spin mr-2 text-[#38bdf8]">⟳</span> Chargement de la télémétrie des nouvelles applications...
        </div>
      ) : apps.length === 0 ? (
        <div className="p-16 text-center text-[#94a3b8] font-telemetry glass-card rounded-2xl border border-[#1e2536]">
          Aucune nouvelle application trouvée pour ces filtres.
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => {
            const isExpanded = !!expandedFeatures[app.id];
            return (
              <div
                key={app.id}
                className="glass-card rounded-2xl border border-[#1e2536] hover:border-[#2a344d] transition-all bg-[#090c13] overflow-hidden shadow-xl"
              >
                {/* App Top Row */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#161b26]">
                  {/* Left: Icon, App Name, Publisher / Company, Country */}
                  <div className="flex items-start gap-4">
                    <img
                      src={app.icon_url || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=128"}
                      alt={app.name}
                      className="w-13 h-13 rounded-2xl object-cover border border-[#1e2536] shadow-md shrink-0 mt-0.5"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-[17px] font-bold text-white font-headline">
                          {app.name}
                        </h2>
                        {app.platform === "ios" ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#7c3aed]/20 text-[#d0bcff] font-bold font-telemetry text-[10px] border border-[#7c3aed]/30 flex items-center gap-1">
                            🍎 iOS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-[#06b6d4]/15 text-[#38bdf8] font-bold font-telemetry text-[10px] border border-[#06b6d4]/30 flex items-center gap-1">
                            🤖 Android
                          </span>
                        )}
                        <span className="font-telemetry text-[10px] px-2 py-0.5 rounded bg-[#10b981]/15 text-[#34d399] font-bold border border-[#10b981]/30">
                          NOUVEAUTÉ STORE
                        </span>
                        <span className="font-telemetry text-[10px] text-[#94a3b8]">
                          Lancée le <strong className="text-white">{app.release_date}</strong>
                        </span>
                      </div>

                      {/* Publisher Company Details (Requested by User) */}
                      <div className="flex items-center gap-2 flex-wrap text-[12px] font-telemetry text-[#cbd5e1]">
                        <span className="text-[#64748b]">Société éditrice :</span>
                        <strong className="text-white flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-[#38bdf8]">apartment</span>
                          {app.company_name || app.developer}
                        </strong>
                        <span className="text-[#64748b]">•</span>
                        <span className="px-2 py-0.5 rounded bg-[#161b26] text-[#94a3b8] text-[10.5px] border border-[#1e2536]">
                          {app.company_type || "Studio Indépendant"}
                        </span>
                        <span className="text-[#64748b]">•</span>
                        <span className="text-[#94a3b8] text-[11px]">
                          {app.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-auto flex-wrap">
                    {app.store_url && (
                      <a
                        href={app.store_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#0d1117] hover:bg-[#161b26] text-[11.5px] font-telemetry font-bold text-[#34d399] border border-[#1e2536] hover:border-[#10b981]/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Ouvrir la fiche officielle sur le store"
                      >
                        <span>{app.platform === "ios" ? "🍎 Fiche App Store" : "🤖 Fiche Google Play"}</span>
                        <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      </a>
                    )}

                    <button
                      onClick={() => toggleExpand(app.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#0d1117] hover:bg-[#161b26] text-[11.5px] font-telemetry font-bold text-[#38bdf8] border border-[#1e2536] hover:border-[#06b6d4]/40 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isExpanded ? "unfold_less" : "analytics"}
                      </span>
                      <span>{isExpanded ? "Masquer fonctionnalités" : "Analyser les fonctionnalités"}</span>
                    </button>

                    <button
                      onClick={() => setSelectedAppId(app.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-[11.5px] font-telemetry font-bold text-white shadow-md shadow-[#7c3aed]/25 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>Inspecter l'app</span>
                    </button>
                  </div>
                </div>

                {/* Telemetry Strip: 4 Mandatory User KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#07090e]/70 border-b border-[#161b26] font-telemetry">
                  {/* KPI 1: Nombre de téléchargements */}
                  <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#1e2536]">
                    <span className="text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
                      TÉLÉCHARGEMENTS ESTIMÉS
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-[16px] font-bold text-white tabular-nums">
                        {app.downloads_count.toLocaleString()} dl
                      </span>
                    </div>
                    <span className="text-[10px] text-[#94a3b8] block mt-0.5">
                      +{(app.downloads_growth_weekly || 0).toLocaleString()} ces 7 derniers jours
                    </span>
                  </div>

                  {/* KPI 2: Évolution du nombre de téléchargements */}
                  <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#1e2536]">
                    <span className="text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
                      KPI ÉVOLUTION DU VOLUME
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#10b981]/20 text-[#34d399] font-bold text-[13px] border border-[#10b981]/30">
                        {app.downloads_growth}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#34d399] block mt-0.5 font-semibold">
                      ▲ Momentum de croissance soutenu
                    </span>
                  </div>

                  {/* KPI 3: Prix de l'abonnement in-app ou achat unique */}
                  <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#1e2536]">
                    <span className="text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
                      PRIX DE L'ABONNEMENT / IN-APP
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <strong className="text-[13px] text-[#fbbf24] font-bold">
                        {app.subscription_price || (app.has_in_app_purchases ? "In-App disponible" : "Gratuit")}
                      </strong>
                    </div>
                    <span className="text-[10px] text-[#64748b] block mt-0.5">
                      {app.has_in_app_purchases ? "Modèle avec achats intégrés" : "Achat unique / Sans in-app"}
                    </span>
                  </div>

                  {/* KPI 4: Note & Rang Store */}
                  <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#1e2536]">
                    <span className="text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
                      RANG &amp; NOTATION STORE
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-[15px] font-bold text-[#d0bcff]">
                        Rang #{app.current_rank}
                      </span>
                      <span className="text-[12px] text-[#f59e0b] font-bold">
                        {app.rating} ★
                      </span>
                    </div>
                    <span className="text-[10px] text-[#64748b] block mt-0.5">
                      {app.review_count.toLocaleString()} avis vérifiés
                    </span>
                  </div>
                </div>

                {/* Functional Analysis Section (Analyse de leurs fonctionnalités) */}
                <div className="p-5 space-y-3.5 bg-[#090c13]">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-telemetry text-[11px] text-[#38bdf8] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px]">description</span>
                        EN QUOI CONSISTE L'APPLICATION &amp; PROPOSITION DE VALEUR
                      </span>
                      <span className="font-telemetry text-[10px] text-[#64748b]">
                        ID: <code className="text-[#94a3b8]">{app.id}</code>
                      </span>
                    </div>
                    <p className="text-[13px] text-[#cbd5e1] leading-relaxed font-sans font-normal">
                      {app.functional_summary || app.description}
                    </p>
                  </div>

                  {/* Detailed Features Cards */}
                  {app.features && app.features.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-telemetry text-[11px] text-[#d0bcff] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px]">extension</span>
                          DÉCORTICAGE DES FONCTIONNALITÉS CLÉS ({app.features.length})
                        </span>
                        <span className="font-telemetry text-[10px] text-[#34d399] font-bold">
                          100% ANALYSÉES
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {app.features.map((feat) => (
                          <div
                            key={feat.id || feat.name}
                            className="p-3 rounded-xl bg-[#0d1117] border border-[#1e2536] hover:border-[#2a344d] transition-colors space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <strong className="text-[12.5px] font-bold text-white truncate">
                                {feat.name}
                              </strong>
                              {feat.is_core ? (
                                <span className="font-telemetry text-[9px] px-1.5 py-0.2 rounded bg-[#7c3aed]/25 text-[#d0bcff] font-bold border border-[#7c3aed]/40 shrink-0">
                                  CORE FEATURE
                                </span>
                              ) : (
                                <span className="font-telemetry text-[9px] px-1.5 py-0.2 rounded bg-[#1e2536] text-[#94a3b8] font-bold shrink-0">
                                  SECONDAIRE
                                </span>
                              )}
                            </div>
                            <p className="text-[11.5px] text-[#94a3b8] leading-relaxed font-sans font-normal">
                              {feat.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Solo Developer Takeaway / Opportunité Solo Dev */}
                  <div className="p-3 rounded-xl bg-[#0d1117]/80 border border-[#1e2536] flex items-center justify-between gap-3 text-[12px] font-telemetry">
                    <div className="flex items-center gap-2 text-[#cbd5e1]">
                      <span className="material-symbols-outlined text-[#34d399] text-[18px]">verified</span>
                      <span>
                        <strong className="text-white">Opportunité Solo Dev :</strong> Reproductible en 2-4 semaines avec une stack moderne (React Native/Flutter + SQLite local + IA On-Device).
                      </span>
                    </div>
                    <span className="font-bold text-[#d0bcff] px-2.5 py-1 rounded bg-[#7c3aed]/15 border border-[#7c3aed]/30 whitespace-nowrap">
                      Idée validée par la traction
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* App Detail Drawer */}
      {selectedAppId && (
        <AppDetailDrawer
          appId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
        />
      )}
    </div>
  );
}
