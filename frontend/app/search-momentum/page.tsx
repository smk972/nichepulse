"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function SearchMomentumPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSearchMetrics()
      .then((res) => setMetrics(res))
      .catch((err) => console.error("Erreur search metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-telemetry text-[11px] uppercase px-2 py-0.5 rounded bg-[#4edea3]/15 text-[#4edea3] font-bold border border-[#4edea3]/30">
            SEARCH INTEL
          </span>
          <span className="font-telemetry text-[11px] text-[#4cd7f6]">GOOGLE TRENDS + STORES</span>
        </div>
        <h1 className="font-headline text-[26px] text-[#e2e2eb] font-extrabold tracking-tight mt-1">
          Tendances de Recherche &amp; Mots-Clés
        </h1>
        <p className="text-[13px] text-[#cbc3d7]">
          Mesure l'évolution de la demande d'intention d'achat avant que les concurrents n'investissent la niche.
        </p>
      </div>

      {/* Keywords Table */}
      <div className="bg-[#191b22] border border-[#282a30] rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#282a30] bg-[#111319] font-telemetry text-[11px] text-[#958ea0] uppercase tracking-wider">
              <th className="py-3 px-4">Requête de Recherche</th>
              <th className="py-3 px-4">Catégorie</th>
              <th className="py-3 px-4">Pays</th>
              <th className="py-3 px-4">Score Demande (Trends)</th>
              <th className="py-3 px-4">Volume Mensuel Estimé</th>
              <th className="py-3 px-4">Croissance 24h</th>
              <th className="py-3 px-4">Croissance 7j</th>
              <th className="py-3 px-4">Croissance 30j</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#282a30] text-[13px]">
            {metrics.map((m) => (
              <tr key={m.id} className="hover:bg-[#282a30]/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#e2e2eb] font-telemetry">
                  "{m.query}"
                </td>
                <td className="py-3.5 px-4 font-telemetry text-[11px] text-[#d0bcff]">
                  {m.category}
                </td>
                <td className="py-3.5 px-4 font-telemetry text-[11px] text-[#cbc3d7]">
                  {m.country}
                </td>
                <td className="py-3.5 px-4 font-telemetry text-[12px] font-bold text-[#4edea3]">
                  {m.relative_demand_score}/100
                </td>
                <td className="py-3.5 px-4 font-telemetry text-[11px] text-[#cbc3d7]">
                  ~{m.estimated_volume.toLocaleString()} req/m
                </td>
                <td className="py-3.5 px-4 font-telemetry text-[11px] text-[#4edea3]">
                  +{m.growth_24h}%
                </td>
                <td className="py-3.5 px-4 font-telemetry text-[11px] text-[#4edea3]">
                  +{m.growth_7d}%
                </td>
                <td className="py-3.5 px-4 font-telemetry text-[12px] text-[#4edea3] font-extrabold">
                  +{m.growth_30d}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
