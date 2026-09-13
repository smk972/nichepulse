"use client";

import React, { useState, useEffect } from "react";
import KillIdeaModal from "@/components/KillIdeaModal";
import { api } from "@/lib/api";
import { usePlatform } from "@/lib/PlatformContext";

export default function IdeaBacklogPage() {
  const { platform, setPlatform, platformLabel } = usePlatform();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdeaForKill, setSelectedIdeaForKill] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    api.getIdeas(platform)
      .then((res) => setIdeas(res))
      .catch((err) => console.error("Erreur ideas:", err))
      .finally(() => setLoading(false));
  }, [platform]);

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-telemetry text-[11px] uppercase px-2 py-0.5 rounded bg-[#7c3aed]/15 text-[#d0bcff] font-bold border border-[#7c3aed]/30">
              SOLO DEV BACKLOG
            </span>
            <span className="font-telemetry text-[11px] text-[#4edea3]">GÉNÉRATION SUR SIGNAUX VÉRIFIÉS</span>
            <span className="font-telemetry text-[11px] px-2 py-0.5 rounded bg-[#282a30] text-[#4cd7f6] font-bold">
              {platformLabel}
            </span>
          </div>
          <h1 className="font-headline text-[26px] text-[#e2e2eb] font-extrabold tracking-tight mt-1">
            Idées d'Applications &amp; Audit Critique
          </h1>
          <p className="text-[13px] text-[#cbc3d7]">
            Idées générées à partir de données réelles avec estimation de complexité et confrontation au protocole "Kill The Idea".
          </p>
        </div>

        {/* Action ribbon */}
        <div className="flex items-center gap-3">
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

          <div className="font-telemetry text-[12px] text-[#4edea3] bg-[#191b22] px-3 py-1.5 rounded-lg border border-[#282a30]">
            {ideas.length} IDÉES QUALIFIÉES
          </div>
        </div>
      </div>

      {/* Ideas Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-[#958ea0] font-telemetry text-[13px]">
          <span className="animate-spin mr-2">⟳</span> Chargement des idées {platformLabel}...
        </div>
      ) : ideas.length === 0 ? (
        <div className="p-12 text-center text-[#958ea0] font-telemetry bg-[#191b22] rounded-2xl border border-[#282a30]">
          Aucune idée enregistrée pour {platformLabel}.
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="p-6 rounded-2xl bg-[#191b22] border border-[#282a30] hover:border-[#7c3aed]/40 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-telemetry text-[10px] px-2 py-0.5 rounded bg-[#282a30] text-[#d0bcff] font-bold">
                      {idea.status === "BUILD IT" ? "🔥 BUILD IT" : idea.status}
                    </span>
                    <span className="font-telemetry text-[10px] px-2 py-0.5 rounded bg-[#111319] text-[#cbc3d7] border border-[#282a30]">
                      {idea.platform === "ios" ? "🍎 iOS Only" : idea.platform === "android" ? "🤖 Android Only" : "⚡ Multi-Platform"}
                    </span>
                    <span className="font-telemetry text-[11px] text-[#4edea3] font-bold">
                      BUILD SCORE : {idea.build_score}/100
                    </span>
                  </div>
                  <h2 className="font-headline text-[20px] font-bold text-[#e2e2eb]">
                    {idea.name}
                  </h2>
                  <p className="text-[12px] text-[#4cd7f6] font-telemetry">
                    {idea.tagline}
                  </p>
                </div>

                {/* Action: Kill the Idea */}
                <button
                  onClick={() => setSelectedIdeaForKill(idea)}
                  className="px-4 py-2 rounded-xl bg-[#ef4444]/15 hover:bg-[#ef4444]/25 text-[#ffb4ab] border border-[#ef4444]/40 font-telemetry text-[12px] font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#ef4444]/10 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">skull</span>
                  <span>Essayer de tuer l'idée</span>
                </button>
              </div>

              {/* Problem & Differentiation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px] p-4 rounded-xl bg-[#111319] border border-[#1e1f26]">
                <div>
                  <strong className="text-[#958ea0] text-[10px] font-telemetry uppercase block mb-1">
                    Problème résolu :
                  </strong>
                  <p className="text-[#e2e2eb] leading-relaxed">{idea.problem_solved}</p>
                </div>
                <div>
                  <strong className="text-[#4edea3] text-[10px] font-telemetry uppercase block mb-1">
                    Différenciation clé :
                  </strong>
                  <p className="text-[#cbc3d7] leading-relaxed">{idea.differentiation}</p>
                </div>
              </div>

              {/* Features MVP */}
              <div>
                <span className="font-telemetry text-[10px] text-[#958ea0] uppercase tracking-wider block mb-2">
                  Fonctionnalités Clés du MVP :
                </span>
                <div className="flex flex-wrap gap-2">
                  {idea.mvp_features?.map((f: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#282a30] text-[#e2e2eb] text-[11px] font-telemetry border border-[#33343b]"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#282a30] font-telemetry text-[11px] text-[#958ea0]">
                <div className="flex items-center gap-4">
                  <span>Utilisateur cible : <strong className="text-[#e2e2eb]">{idea.target_user}</strong></span>
                  <span>Complexité : <strong className="text-[#4cd7f6]">{idea.technical_complexity}/100</strong></span>
                  <span>Délai MVP : <strong className="text-[#d0bcff]">{idea.mvp_estimate_days}</strong></span>
                </div>

                {idea.kill_analysis && (
                  <span className="text-[#4edea3] flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    Audit Kill The Idea déjà exécuté
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kill Modal */}
      {selectedIdeaForKill && (
        <KillIdeaModal
          isOpen={Boolean(selectedIdeaForKill)}
          onClose={() => setSelectedIdeaForKill(null)}
          idea={selectedIdeaForKill}
        />
      )}
    </div>
  );
}
