"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function SignalFeedPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = () => {
    setLoading(true);
    api.getAlerts()
      .then((res) => setAlerts(res))
      .catch((err) => console.error("Erreur alerts:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markAlertRead(id);
      loadAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-telemetry text-[11px] uppercase px-2 py-0.5 rounded bg-[#7c3aed]/15 text-[#d0bcff] font-bold border border-[#7c3aed]/30">
            RADAR D'ÉVÉNEMENTS
          </span>
          <span className="font-telemetry text-[11px] text-[#4edea3]">LIVE STREAM</span>
        </div>
        <h1 className="font-headline text-[26px] text-[#e2e2eb] font-extrabold tracking-tight mt-1">
          Flux de Signaux &amp; Alertes de Marché
        </h1>
        <p className="text-[13px] text-[#cbc3d7]">
          Détections automatiques d'anomalies positives : sauts de classement, pics de requêtes et écarts géographiques.
        </p>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {alerts.map((al) => {
          const isCritical = al.severity === "critical" || al.severity === "high";
          return (
            <div
              key={al.id}
              className={`p-5 rounded-2xl bg-[#191b22] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                al.is_read ? "border-[#282a30] opacity-75" : "border-[#7c3aed]/40 shadow-lg shadow-[#7c3aed]/5"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCritical
                      ? "bg-[#ef4444]/20 text-[#ffb4ab] border border-[#ef4444]/30"
                      : "bg-[#7c3aed]/20 text-[#d0bcff] border border-[#7c3aed]/30"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {al.type === "BREAKOUT"
                      ? "rocket_launch"
                      : al.type === "SEARCH_SPIKE"
                      ? "trending_up"
                      : al.type === "CROSS_MARKET"
                      ? "public"
                      : "warning"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-telemetry text-[10px] px-2 py-0.5 rounded bg-[#282a30] text-[#d0bcff] font-bold">
                      {al.type}
                    </span>
                    <span
                      className={`font-telemetry text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                        isCritical ? "bg-[#ef4444]/20 text-[#ffb4ab]" : "bg-[#4edea3]/20 text-[#4edea3]"
                      }`}
                    >
                      {al.severity}
                    </span>
                    <span className="font-telemetry text-[10px] text-[#958ea0]">
                      {new Date(al.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="font-headline text-[15px] font-bold text-[#e2e2eb]">
                    {al.title}
                  </h3>
                  <p className="text-[13px] text-[#cbc3d7] leading-relaxed">
                    {al.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!al.is_read && (
                  <button
                    onClick={() => handleMarkRead(al.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#282a30] hover:bg-[#33343b] text-[#e2e2eb] font-telemetry text-[11px] transition-colors"
                  >
                    Marquer lu
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
