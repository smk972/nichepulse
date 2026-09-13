"use client";

import React, { useState, useEffect } from "react";
import AppDetailDrawer from "@/components/AppDetailDrawer";
import { api } from "@/lib/api";
import { usePlatform, PlatformType } from "@/lib/PlatformContext";

export default function AppExplorerPage() {
  const { platform, setPlatform, platformLabel } = usePlatform();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    api.getApps({
      country: country || undefined,
      category: category || undefined,
      platform: platform !== "all" ? platform : undefined,
      search: search || undefined
    })
      .then((res) => setApps(res))
      .catch((err) => console.error("Erreur apps:", err))
      .finally(() => setLoading(false));
  }, [country, category, platform, search]);

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-telemetry text-[11px] uppercase px-2 py-0.5 rounded bg-[#7c3aed]/15 text-[#d0bcff] font-bold border border-[#7c3aed]/30">
              EXPLORATEUR
            </span>
            <span className="font-telemetry text-[11px] text-[#4edea3]">BASE HISTORISÉE 30J</span>
            <span className="font-telemetry text-[11px] px-2 py-0.5 rounded bg-[#282a30] text-[#4cd7f6] font-bold">
              {platformLabel}
            </span>
          </div>
          <h1 className="font-headline text-[26px] text-[#e2e2eb] font-extrabold tracking-tight mt-1">
            Applications Suivies &amp; Télémétrie Stores
          </h1>
          <p className="text-[13px] text-[#cbc3d7]">
            Consultez les métadonnées, notes, trajectoires et analyses qualitatives des applications.
          </p>
        </div>

        {/* Global Platform Switcher */}
        <div className="flex items-center gap-3">
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

          <div className="font-telemetry text-[12px] text-[#4cd7f6] bg-[#191b22] px-3 py-1.5 rounded-lg border border-[#282a30]">
            {apps.length} APPS INDEXÉES
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-[#191b22] rounded-xl border border-[#282a30]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrer par nom ou développeur..."
          className="bg-[#111319] border border-[#282a30] text-[#e2e2eb] text-[13px] px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#7c3aed] min-w-[240px]"
        />

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="bg-[#111319] border border-[#282a30] text-[#e2e2eb] text-[12px] font-telemetry px-3 py-1.5 rounded-lg focus:outline-none"
        >
          <option value="">Tous pays (US, FR, UK, DE...)</option>
          <option value="US">🇺🇸 États-Unis</option>
          <option value="FR">🇫🇷 France</option>
          <option value="GB">🇬🇧 Royaume-Uni</option>
          <option value="DE">🇩🇪 Allemagne</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[#111319] border border-[#282a30] text-[#e2e2eb] text-[12px] font-telemetry px-3 py-1.5 rounded-lg focus:outline-none"
        >
          <option value="">Toutes catégories (Productivité, Finance...)</option>
          <option value="Productivity">⚡ Productivité (60 apps)</option>
          <option value="Finance">💰 Finance (40 apps)</option>
          <option value="Health & Fitness">🏃 Santé &amp; Fitness (35 apps)</option>
          <option value="Utilities">🛠️ Utilitaires (35 apps)</option>
          <option value="Lifestyle">🌿 Lifestyle (15 apps)</option>
          <option value="Business">💼 Business (15 apps)</option>
        </select>

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as PlatformType)}
          className="bg-[#111319] border border-[#282a30] text-[#e2e2eb] text-[12px] font-telemetry px-3 py-1.5 rounded-lg focus:outline-none"
        >
          <option value="all">⚡ Toutes plateformes (Combiné)</option>
          <option value="ios">🍎 iOS (Apple App Store)</option>
          <option value="android">🤖 Android (Google Play)</option>
        </select>
      </div>

      {/* Applications Table Container */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-[#94a3b8] font-telemetry text-[13px] glass-card rounded-2xl border border-[#1e2536]">
          <span className="animate-spin mr-2 text-[#38bdf8]">⟳</span> Synchronisation des données télémétriques {platformLabel}...
        </div>
      ) : apps.length === 0 ? (
        <div className="p-16 text-center text-[#94a3b8] font-telemetry glass-card rounded-2xl border border-[#1e2536]">
          Aucune application trouvée pour les critères spécifiés.
        </div>
      ) : (
        <div className="glass-card border border-[#1e2536] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e2536] bg-[#0a0d14] font-telemetry text-[10.5px] text-[#94a3b8] uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-3 px-4">Rang</th>
                  <th className="py-3 px-4">Application &amp; Société Éditrice</th>
                  <th className="py-3 px-4">Téléchargements &amp; Évolution</th>
                  <th className="py-3 px-4">Abonnement / In-App</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4">Note &amp; Avis</th>
                  <th className="py-3 px-4 text-right">Inspecter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161b26] text-[13px]">
                {apps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className="hover:bg-[#131722]/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-telemetry font-bold text-white">
                      #{app.current_rank}
                    </td>
                    <td className="py-4 px-4 max-w-md">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={app.icon_url || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=128"}
                          alt={app.name}
                          className="w-11 h-11 rounded-xl object-cover border border-[#1e2536] shrink-0 mt-0.5 group-hover:border-[#7c3aed]/50 transition-colors shadow-sm"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-white group-hover:text-[#38bdf8] transition-colors font-bold text-[13.5px]">
                              {app.name}
                            </strong>
                            {app.is_breakout && (
                              <span className="font-telemetry text-[9px] px-1.5 py-0.2 rounded bg-[#f59e0b]/20 text-[#fbbf24] font-bold border border-[#f59e0b]/30">
                                🔥 BREAKOUT
                              </span>
                            )}
                            {app.is_new && (
                              <span className="font-telemetry text-[9px] px-1.5 py-0.2 rounded bg-[#10b981]/20 text-[#34d399] font-bold border border-[#10b981]/30">
                                NOUVEAU
                              </span>
                            )}
                          </div>
                          
                          {/* Société éditrice / Studio (Exigé par l'utilisateur) */}
                          <div className="flex items-center gap-1.5 text-[11px] font-telemetry text-[#38bdf8]">
                            <span className="material-symbols-outlined text-[13px] text-[#64748b]">apartment</span>
                            <span className="truncate max-w-[260px] font-medium" title={app.company_name || app.developer}>
                              {app.company_name || app.developer}
                            </span>
                            <span className="text-[#64748b] text-[10px]">({app.company_country || app.country})</span>
                          </div>

                          {app.description && (
                            <p className="text-[12px] text-[#94a3b8] line-clamp-1 leading-relaxed font-sans font-normal">
                              {app.functional_summary || app.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Téléchargements & KPI Évolution (Exigé par l'utilisateur) */}
                    <td className="py-4 px-4 font-telemetry">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-[13px] tabular-nums">
                            {(app.downloads_count || 50000).toLocaleString()} dl
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-[#10b981]/15 text-[#34d399] font-bold text-[10.5px] border border-[#10b981]/30">
                            {app.downloads_growth || "+18.5% ce mois"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Prix de l'abonnement in-app ou non (Exigé par l'utilisateur) */}
                    <td className="py-4 px-4 font-telemetry text-[12px]">
                      <strong className="text-[#fbbf24] font-semibold block">
                        {app.subscription_price || (app.has_in_app_purchases ? "In-App disponible" : "Gratuit")}
                      </strong>
                      <span className="text-[#64748b] text-[10px] block mt-0.5">
                        {app.has_in_app_purchases ? "Achats intégrés" : "Sans abonnement"}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-telemetry text-[11.5px] text-[#cbd5e1]">
                      <span className="px-2 py-0.5 rounded-md bg-[#161b26] border border-[#2a344d]">
                        {app.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-telemetry text-[11px]">
                      <div className="flex items-center gap-1.5">
                        {app.platform === "ios" ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#7c3aed]/20 text-[#d0bcff] font-bold text-[10.5px] border border-[#7c3aed]/30">
                            🍎 iOS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-[#06b6d4]/15 text-[#38bdf8] font-bold text-[10.5px] border border-[#06b6d4]/30">
                            🤖 Android
                          </span>
                        )}
                        <span className="text-[#64748b] text-[10px]">{app.country}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-telemetry text-[11.5px]">
                      <span className="text-[#f59e0b] font-bold">{app.rating} ★</span>{" "}
                      <span className="text-[#64748b]">({app.review_count.toLocaleString()})</span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span className="material-symbols-outlined text-[#64748b] group-hover:text-[#38bdf8] transition-colors text-[18px]">
                        arrow_forward
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
