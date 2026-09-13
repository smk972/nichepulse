"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { usePlatform } from "@/lib/PlatformContext";

export default function FrustrationsPage() {
  const { platform, setPlatform, platformLabel } = usePlatform();
  const [painPoints, setPainPoints] = useState<any[]>([]);
  const [missingFeatures, setMissingFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getPainPoints(platform), api.getMissingFeatures()])
      .then(([pains, missing]) => {
        setPainPoints(pains);
        setMissingFeatures(missing);
      })
      .catch((err) => console.error("Erreur frustrations:", err))
      .finally(() => setLoading(false));
  }, [platform]);

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-telemetry text-[11px] uppercase px-2 py-0.5 rounded bg-[#ffb4ab]/15 text-[#ffb4ab] font-bold border border-[#ffb4ab]/30">
              RADAR DES PROBLÈMES &amp; MANQUES
            </span>
            <span className="font-telemetry text-[11px] text-[#4edea3]">15 CATÉGORIES D'AVIS</span>
            <span className="font-telemetry text-[11px] px-2 py-0.5 rounded bg-[#282a30] text-[#4cd7f6] font-bold">
              {platformLabel}
            </span>
          </div>
          <h1 className="font-headline text-[26px] text-[#e2e2eb] font-extrabold tracking-tight mt-1">
            Frustrations Utilisateurs &amp; Fonctionnalités Manquantes
          </h1>
          <p className="text-[13px] text-[#cbc3d7]">
            Chaque avis 1-2 étoiles est une opportunité de différenciation pour un développeur solo.
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

      {/* SECTION 1: PAIN POINTS RADAR */}
      <div className="space-y-4">
        <h2 className="font-headline text-[18px] font-bold text-[#e2e2eb] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ffb4ab]">psychology_alt</span>
          <span>Problèmes les Plus Douloureux (Pain Score / 100) — {platformLabel}</span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center p-8 text-[#958ea0] font-telemetry text-[13px]">
            <span className="animate-spin mr-2">⟳</span> Chargement des points de douleur...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {painPoints.map((pain) => (
              <div
                key={pain.id}
                className="p-5 rounded-2xl bg-[#191b22] border border-[#282a30] space-y-3.5 hover:border-[#ffb4ab]/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-telemetry text-[10px] px-2 py-0.5 rounded bg-[#282a30] text-[#ffb4ab] font-bold">
                        {pain.category}
                      </span>
                      <span className="font-telemetry text-[10px] px-2 py-0.5 rounded bg-[#111319] text-[#cbc3d7] border border-[#282a30]">
                        {pain.platform === "ios" ? "🍎 iOS" : pain.platform === "android" ? "🤖 Android" : "⚡ Multi"}
                      </span>
                    </div>
                    <h3 className="font-headline text-[16px] font-bold text-[#e2e2eb] mt-1.5">
                      {pain.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="font-telemetry text-[22px] font-bold text-[#ffb4ab]">
                      {Math.round(pain.pain_score)}
                    </span>
                    <span className="font-telemetry text-[8px] text-[#958ea0] uppercase block">
                      PAIN SCORE
                    </span>
                  </div>
                </div>

                {/* Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 font-telemetry text-[11px] p-2.5 rounded-xl bg-[#111319] border border-[#1e1f26]">
                  <div>
                    <span className="text-[#958ea0] text-[9px] uppercase block">Fréquence</span>
                    <strong className="text-[#ffb4ab]">{pain.frequency_pct}% des avis</strong>
                  </div>
                  <div>
                    <span className="text-[#958ea0] text-[9px] uppercase block">Gravité</span>
                    <strong className="text-[#f59e0b]">{pain.severity_score}/10</strong>
                  </div>
                  <div>
                    <span className="text-[#958ea0] text-[9px] uppercase block">Croissance</span>
                    <strong className="text-[#4edea3]">+{pain.growth_trend}%</strong>
                  </div>
                </div>

                {/* Sample Verbatims */}
                <div className="space-y-1 pt-1">
                  <span className="font-telemetry text-[10px] text-[#958ea0] uppercase tracking-wider block">
                    Verbatims représentatifs :
                  </span>
                  <div className="space-y-1">
                    {pain.sample_verbatims?.map((v: string, idx: number) => (
                      <p key={idx} className="text-[12px] text-[#cbc3d7] italic bg-[#111319]/50 p-2 rounded-lg border border-[#1e1f26]">
                        "{v}"
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: MISSING FEATURES */}
      <div className="space-y-4 pt-4">
        <h2 className="font-headline text-[18px] font-bold text-[#e2e2eb] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4cd7f6]">construction</span>
          <span>Fonctionnalités les Plus Réclamées (Opportunités MVP)</span>
        </h2>

        <div className="bg-[#191b22] border border-[#282a30] rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#282a30] bg-[#111319] font-telemetry text-[11px] text-[#958ea0] uppercase tracking-wider">
                <th className="py-3 px-4">Fonctionnalité Demandée</th>
                <th className="py-3 px-4">Niche Cible</th>
                <th className="py-3 px-4">Demandes</th>
                <th className="py-3 px-4">Urgence</th>
                <th className="py-3 px-4">Opportunité Produit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282a30] text-[13px]">
              {missingFeatures.map((m) => (
                <tr key={m.id} className="hover:bg-[#282a30]/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#e2e2eb]">
                    {m.feature_name}
                  </td>
                  <td className="py-3.5 px-4 font-telemetry text-[11px] text-[#d0bcff]">
                    {m.niche}
                  </td>
                  <td className="py-3.5 px-4 font-telemetry text-[11px] text-[#4edea3] font-bold">
                    {m.requests_count} ({m.request_percentage}%)
                  </td>
                  <td className="py-3.5 px-4 font-telemetry text-[11px] text-[#f59e0b] font-bold">
                    {m.urgency_severity}/10
                  </td>
                  <td className="py-3.5 px-4 text-[12px] text-[#cbc3d7]">
                    {m.opportunity_description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
