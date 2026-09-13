"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  // Form states
  const [buildOpp, setBuildOpp] = useState(0.30);
  const [buildEasy, setBuildEasy] = useState(0.20);
  const [buildGap, setBuildGap] = useState(0.15);
  const [buildSearch, setBuildSearch] = useState(0.15);
  const [buildPain, setBuildPain] = useState(0.10);
  const [buildComp, setBuildComp] = useState(0.10);
  const [buildItThreshold, setBuildItThreshold] = useState(80.0);
  const [investigateThreshold, setInvestigateThreshold] = useState(60.0);

  useEffect(() => {
    api.getSettings()
      .then((res) => {
        setSettings(res);
        if (res.build_weights) {
          setBuildOpp(res.build_weights.opportunity_score);
          setBuildEasy(res.build_weights.easy_build_score);
          setBuildGap(res.build_weights.market_gap);
          setBuildSearch(res.build_weights.search_demand);
          setBuildPain(res.build_weights.pain_score);
          setBuildComp(res.build_weights.competition);
        }
        if (res.thresholds) {
          setBuildItThreshold(res.thresholds.build_it);
          setInvestigateThreshold(res.thresholds.investigate);
        }
      })
      .catch((err) => console.error("Erreur settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings({
        build_opportunity: buildOpp,
        build_easy_build: buildEasy,
        build_market_gap: buildGap,
        build_search_demand: buildSearch,
        build_pain: buildPain,
        build_competition: buildComp,
        build_it_threshold: buildItThreshold,
        investigate_threshold: investigateThreshold
      });
      setSavedMessage("✓ Pondérations et seuils enregistrés avec succès !");
      setTimeout(() => setSavedMessage(""), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  const totalWeight = Math.round((buildOpp + buildEasy + buildGap + buildSearch + buildPain + buildComp) * 100);

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-telemetry text-[11px] uppercase px-2 py-0.5 rounded bg-[#7c3aed]/15 text-[#d0bcff] font-bold border border-[#7c3aed]/30">
            CONFIGURATION MOTEUR
          </span>
          <span className="font-telemetry text-[11px] text-[#4edea3]">ADJUSTABLE WEIGHTS</span>
        </div>
        <h1 className="font-headline text-[26px] text-[#e2e2eb] font-extrabold tracking-tight mt-1">
          Paramètres &amp; Pondérations du Build Score
        </h1>
        <p className="text-[13px] text-[#cbc3d7]">
          Ajustez les priorités de calcul mathématique selon votre stratégie de développeur solo.
        </p>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-[#4edea3]/15 border border-[#4edea3]/40 text-[#4edea3] font-telemetry text-[12px] font-bold animate-fadeIn">
          {savedMessage}
        </div>
      )}

      {/* Weights Form */}
      <form onSubmit={handleSaveWeights} className="space-y-6">
        <div className="p-6 rounded-2xl bg-[#191b22] border border-[#282a30] space-y-5">
          <div className="flex items-center justify-between border-b border-[#282a30] pb-3">
            <div>
              <h2 className="font-headline text-[18px] font-bold text-[#e2e2eb]">
                Pondérations du Score Final (BUILD SCORE / 100)
              </h2>
              <span className="text-[12px] text-[#958ea0]">
                La somme des pourcentages doit être égale à 100%.
              </span>
            </div>
            <span
              className={`font-telemetry text-[12px] px-2.5 py-1 rounded-lg font-bold ${
                totalWeight === 100
                  ? "bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30"
                  : "bg-[#ef4444]/15 text-[#ffb4ab] border border-[#ef4444]/30"
              }`}
            >
              Total : {totalWeight}%
            </span>
          </div>

          <div className="space-y-4 font-telemetry text-[12px]">
            {/* 1. Opportunity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#e2e2eb]">
                <span>Opportunity Score :</span>
                <strong className="text-[#d0bcff]">{Math.round(buildOpp * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                value={buildOpp}
                onChange={(e) => setBuildOpp(parseFloat(e.target.value))}
                className="w-full accent-[#7c3aed]"
              />
            </div>

            {/* 2. Easy Build */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#e2e2eb]">
                <span>Easy Build Score (Facilité Solo Dev) :</span>
                <strong className="text-[#4cd7f6]">{Math.round(buildEasy * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={buildEasy}
                onChange={(e) => setBuildEasy(parseFloat(e.target.value))}
                className="w-full accent-[#06b6d4]"
              />
            </div>

            {/* 3. Market Gap */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#e2e2eb]">
                <span>Market Gap (Arbitrage Géographique) :</span>
                <strong className="text-[#4edea3]">{Math.round(buildGap * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                value={buildGap}
                onChange={(e) => setBuildGap(parseFloat(e.target.value))}
                className="w-full accent-[#10b981]"
              />
            </div>

            {/* 4. Search Demand */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#e2e2eb]">
                <span>Search Demand (Google Trends) :</span>
                <strong className="text-[#f59e0b]">{Math.round(buildSearch * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                value={buildSearch}
                onChange={(e) => setBuildSearch(parseFloat(e.target.value))}
                className="w-full accent-[#f59e0b]"
              />
            </div>

            {/* 5. Pain Score */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#e2e2eb]">
                <span>Pain Score (Frustration Avis Négatifs) :</span>
                <strong className="text-[#ffb4ab]">{Math.round(buildPain * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="0.3"
                step="0.05"
                value={buildPain}
                onChange={(e) => setBuildPain(parseFloat(e.target.value))}
                className="w-full accent-[#ef4444]"
              />
            </div>

            {/* 6. Competition */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#e2e2eb]">
                <span>Competition Score (Faible Concurrence) :</span>
                <strong className="text-[#4edea3]">{Math.round(buildComp * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="0.3"
                step="0.05"
                value={buildComp}
                onChange={(e) => setBuildComp(parseFloat(e.target.value))}
                className="w-full accent-[#10b981]"
              />
            </div>
          </div>
        </div>

        {/* Thresholds Box */}
        <div className="p-6 rounded-2xl bg-[#191b22] border border-[#282a30] space-y-4 font-telemetry">
          <h2 className="font-headline text-[18px] font-bold text-[#e2e2eb]">
            Seuils de Décision &amp; Statuts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
            <div className="space-y-1.5 p-3.5 rounded-xl bg-[#111319] border border-[#282a30]">
              <label className="text-[#4edea3] font-bold block">
                🔥 Seuil BUILD IT (Priorité Haute) :
              </label>
              <input
                type="number"
                min="70"
                max="95"
                value={buildItThreshold}
                onChange={(e) => setBuildItThreshold(parseFloat(e.target.value))}
                className="w-full bg-[#191b22] border border-[#282a30] text-[#e2e2eb] px-3 py-1.5 rounded-lg"
              />
              <span className="text-[10px] text-[#958ea0] block">Défaut: 80/100</span>
            </div>

            <div className="space-y-1.5 p-3.5 rounded-xl bg-[#111319] border border-[#282a30]">
              <label className="text-[#4cd7f6] font-bold block">
                🔍 Seuil INVESTIGATE (À Approfondir) :
              </label>
              <input
                type="number"
                min="40"
                max="75"
                value={investigateThreshold}
                onChange={(e) => setInvestigateThreshold(parseFloat(e.target.value))}
                className="w-full bg-[#191b22] border border-[#282a30] text-[#e2e2eb] px-3 py-1.5 rounded-lg"
              />
              <span className="text-[10px] text-[#958ea0] block">Défaut: 60/100</span>
            </div>
          </div>
        </div>

        {/* Gemini & Env Info */}
        <div className="p-6 rounded-2xl bg-[#191b22] border border-[#282a30] space-y-3 font-telemetry text-[12px]">
          <h2 className="font-headline text-[18px] font-bold text-[#e2e2eb]">
            Modèle d'Intelligence Artificielle &amp; Clés
          </h2>
          <div className="flex justify-between items-center p-3 rounded-xl bg-[#111319] border border-[#282a30]">
            <div>
              <span className="text-[#958ea0] block text-[10px]">MODÈLE ACTIF :</span>
              <strong className="text-[#d0bcff]">{settings?.gemini_model || "gemini-2.5-flash"}</strong>
            </div>
            <span className="px-2 py-1 rounded bg-[#4edea3]/10 text-[#4edea3] font-bold text-[10px]">
              MODE HYBRIDE 10%
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-[14px] shadow-lg shadow-[#7c3aed]/25 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Enregistrer les nouvelles pondérations</span>
        </button>
      </form>
    </div>
  );
}
