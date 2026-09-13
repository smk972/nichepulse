"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

interface KillIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: any;
}

export default function KillIdeaModal({ isOpen, onClose, idea }: KillIdeaModalProps) {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(idea?.kill_analysis || null);

  if (!isOpen || !idea) return null;

  const handleRunKillAudit = async () => {
    setLoading(true);
    try {
      const res = await api.killIdea(idea.id);
      setAnalysisData(res.kill_analysis);
    } catch (e) {
      console.error("Erreur kill the idea:", e);
    } finally {
      setLoading(false);
    }
  };

  const data = analysisData || idea.kill_analysis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#111319] border border-[#ff5e36]/30 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Ambient red hazard glow */}
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#ef4444]/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#1e1f26] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-telemetry text-[11px] px-2.5 py-0.5 rounded bg-[#ef4444]/20 text-[#ffb4ab] font-bold border border-[#ef4444]/40 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">skull</span>
                AUDIT ADVERSARIAL : ESSAYER DE TUER L'IDÉE
              </span>
              <span className="font-telemetry text-[11px] text-[#958ea0]">/</span>
              <span className="font-telemetry text-[11px] text-[#ffb4ab] font-semibold">
                CONFIDENCE AUDIT: {data?.confidence_score || 92}%
              </span>
            </div>
            <h2 className="font-headline text-[22px] font-extrabold text-[#e2e2eb] tracking-tight">
              Pourquoi NE PAS développer {idea.name} ?
            </h2>
            <p className="text-[13px] text-[#cbc3d7]">
              Analyse impitoyable des angles morts, dépendances d'APIs et risques de copie immédiate.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#191b22] hover:bg-[#282a30] text-[#958ea0] hover:text-[#e2e2eb] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Action button if no analysis or want refresh */}
        {!data && (
          <div className="p-6 rounded-xl bg-[#191b22] border border-[#282a30] text-center space-y-3">
            <span className="material-symbols-outlined text-[36px] text-[#ef4444]">gavel</span>
            <p className="text-[13px] text-[#cbc3d7] max-w-md mx-auto">
              Lancez le protocole d'audit critique. Gemini simulera un investisseur sceptique cherchant activement toutes les raisons de rejeter ce projet.
            </p>
            <button
              onClick={handleRunKillAudit}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-[13px] shadow-lg shadow-[#ef4444]/20 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>{loading ? "Audit impitoyable en cours..." : "Lancer l'audit 'Kill The Idea'"}</span>
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {/* Verdict Box */}
            <div className="p-4 rounded-xl bg-[#1c1214] border border-[#ef4444]/40 space-y-2">
              <span className="font-telemetry text-[10px] text-[#ffb4ab] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                VERDICT SANS COMPLAISANCE
              </span>
              <p className="text-[13px] text-[#e2e2eb] leading-relaxed">
                {data.summary_verdict}
              </p>
            </div>

            {/* Fatal Flaw & Survival Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-telemetry text-[12px]">
              <div className="p-3 rounded-lg bg-[#191b22] border border-[#ef4444]/30 space-y-1">
                <span className="text-[#ffb4ab] font-bold uppercase block text-[10px]">
                  ☠️ DÉFAUT FATAL IDENTIFIÉ :
                </span>
                <p className="text-[#e2e2eb] text-[12px] font-sans">
                  {data.fatal_flaw}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#191b22] border border-[#4edea3]/30 space-y-1">
                <span className="text-[#4edea3] font-bold uppercase block text-[10px]">
                  🛡️ SEULE CONDITION DE SURVIE :
                </span>
                <p className="text-[#e2e2eb] text-[12px] font-sans">
                  {data.survival_condition}
                </p>
              </div>
            </div>

            {/* Risk Breakdown Table */}
            <div className="space-y-2">
              <span className="font-telemetry text-[10px] text-[#958ea0] uppercase tracking-wider block">
                MATRICE DES RISQUES MAJEURS (GRAVITÉ &times; PROBABILITÉ) :
              </span>
              <div className="space-y-2">
                {data.kill_risks?.map((risk: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#191b22] border border-[#282a30] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-telemetry text-[10px] px-1.5 py-0.2 rounded bg-[#282a30] text-[#cbc3d7] font-semibold">
                          {risk.category}
                        </span>
                        <strong className="text-[13px] text-[#e2e2eb]">
                          {risk.risk_title}
                        </strong>
                      </div>
                      <div className="flex items-center gap-2 font-telemetry text-[10px]">
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold ${
                            risk.severity === "CRITIQUE"
                              ? "bg-[#ef4444]/20 text-[#ffb4ab]"
                              : "bg-[#f59e0b]/20 text-[#f59e0b]"
                          }`}
                        >
                          Sévérité : {risk.severity}
                        </span>
                        <span className="text-[#958ea0]">
                          Probabilité : {risk.probability}
                        </span>
                      </div>
                    </div>
                    <p className="text-[12px] text-[#cbc3d7] font-sans">
                      {risk.impact_analysis}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-[#1e1f26]">
          {data && (
            <button
              onClick={handleRunKillAudit}
              disabled={loading}
              className="text-[12px] font-telemetry text-[#958ea0] hover:text-[#e2e2eb] transition-colors"
            >
              {loading ? "Réanalyse..." : "↻ Réexécuter l'audit"}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#282a30] hover:bg-[#33343b] text-[#e2e2eb] text-[13px] font-medium transition-colors ml-auto"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
