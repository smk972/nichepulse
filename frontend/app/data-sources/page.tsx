"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function DataSourcesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadSources = () => {
    setLoading(true);
    api.getSources()
      .then((res) => setData(res))
      .catch((err) => console.error("Erreur sources:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.triggerSync();
      loadSources();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const sources = data?.sources || [];
  const runs = data?.recent_runs || [];

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-telemetry text-[11px] uppercase px-2 py-0.5 rounded bg-[#4cd7f6]/15 text-[#4cd7f6] font-bold border border-[#4cd7f6]/30">
              OBSERVABILITÉ SYSTÈME
            </span>
            <span className="font-telemetry text-[11px] text-[#4edea3]">5 SOURCES CONNECTÉES</span>
          </div>
          <h1 className="font-headline text-[26px] text-[#e2e2eb] font-extrabold tracking-tight mt-1">
            Sources de Données &amp; Pipeline de Collecte
          </h1>
          <p className="text-[13px] text-[#cbc3d7]">
            État de santé en temps réel des collecteurs, latences réseau et exécutions du pipeline quotidien.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-[13px] shadow-lg shadow-[#7c3aed]/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[18px] ${syncing ? "animate-spin" : ""}`}>
            sync
          </span>
          <span>{syncing ? "Synchronisation en cours..." : "Forcer la Synchronisation"}</span>
        </button>
      </div>

      {/* Sources Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((src: any) => {
          const isOk = src.status === "OPERATIONAL";
          return (
            <div
              key={src.id}
              className="p-5 rounded-2xl bg-[#191b22] border border-[#282a30] space-y-4 hover:border-[#4cd7f6]/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-headline text-[16px] font-bold text-[#e2e2eb]">
                    {src.name}
                  </h3>
                  <span className="font-telemetry text-[10px] text-[#958ea0]">
                    ID: {src.id}
                  </span>
                </div>
                <span
                  className={`font-telemetry text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                    isOk
                      ? "bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30"
                      : "bg-[#ef4444]/10 text-[#ffb4ab] border border-[#ef4444]/30"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isOk ? "bg-[#4edea3]" : "bg-[#ef4444]"}`}></span>
                  {isOk ? "Fonctionnel" : "Dégradé"}
                </span>
              </div>

              <div className="space-y-2 font-telemetry text-[12px] p-3 rounded-xl bg-[#111319] border border-[#1e1f26]">
                <div className="flex justify-between">
                  <span className="text-[#958ea0]">Dernière collecte :</span>
                  <span className="text-[#e2e2eb]">
                    {new Date(src.last_sync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#958ea0]">Données indexées :</span>
                  <strong className="text-[#4cd7f6]">{src.records_count?.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#958ea0]">Temps de réponse :</span>
                  <span className="text-[#4edea3]">{src.response_time_ms} ms</span>
                </div>
              </div>

              {src.last_error ? (
                <div className="p-2.5 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-[11px] text-[#ffb4ab]">
                  Erreur : {src.last_error}
                </div>
              ) : (
                <div className="text-[11px] text-[#4edea3] font-telemetry flex items-center gap-1">
                  ✓ Aucun incident récent consigné
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pipeline Runs History */}
      <div className="space-y-3 pt-2">
        <h2 className="font-headline text-[18px] font-bold text-[#e2e2eb] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#d0bcff]">history</span>
          <span>Historique des Exécutions du Pipeline</span>
        </h2>

        <div className="bg-[#191b22] border border-[#282a30] rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse font-telemetry text-[12px]">
            <thead>
              <tr className="border-b border-[#282a30] bg-[#111319] text-[10px] text-[#958ea0] uppercase tracking-wider">
                <th className="py-3 px-4">Run ID</th>
                <th className="py-3 px-4">Type de tâche</th>
                <th className="py-3 px-4">Modèle IA</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Durée</th>
                <th className="py-3 px-4">Données traitées</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282a30]">
              {runs.map((r: any) => (
                <tr key={r.id} className="hover:bg-[#282a30]/60 transition-colors">
                  <td className="py-3 px-4 text-[#d0bcff]">#{r.id}</td>
                  <td className="py-3 px-4 text-[#e2e2eb] font-semibold">{r.run_type}</td>
                  <td className="py-3 px-4 text-[#958ea0]">{r.model}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#4edea3]/15 text-[#4edea3] font-bold text-[10px]">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#cbc3d7]">{r.duration_seconds}s</td>
                  <td className="py-3 px-4 text-[#4cd7f6] font-bold">{r.records_processed.toLocaleString()}</td>
                  <td className="py-3 px-4 text-[#958ea0]">
                    {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
