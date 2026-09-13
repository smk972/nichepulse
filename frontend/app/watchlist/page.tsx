"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function WatchlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState("niche");

  const loadWatchlist = () => {
    setLoading(true);
    api.getWatchlist()
      .then((res) => setItems(res))
      .catch((err) => console.error("Erreur watchlist:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    try {
      await api.addToWatchlist({
        name: newItemName,
        item_type: newItemType,
        item_id: `custom_${Date.now()}`,
        initial_metric: 75.0
      });
      setNewItemName("");
      loadWatchlist();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await api.removeFromWatchlist(id);
      loadWatchlist();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col w-full px-8 py-6 gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-telemetry text-[11px] uppercase px-2 py-0.5 rounded bg-[#4edea3]/15 text-[#4edea3] font-bold border border-[#4edea3]/30">
            SURVEILLANCE CIBLÉE
          </span>
          <span className="font-telemetry text-[11px] text-[#cbc3d7]">RADAR ACTIF</span>
        </div>
        <h1 className="font-headline text-[26px] text-[#e2e2eb] font-extrabold tracking-tight mt-1">
          Liste de Surveillance Personnelle
        </h1>
        <p className="text-[13px] text-[#cbc3d7]">
          Suivez l'évolution dans le temps de vos applications, niches, mots-clés et idées candidates.
        </p>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-[#191b22] border border-[#282a30]">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Nom de l'application, mot-clé ou niche à suivre..."
          className="flex-1 bg-[#111319] border border-[#282a30] text-[#e2e2eb] text-[13px] px-3.5 py-2 rounded-lg focus:outline-none focus:border-[#7c3aed] min-w-[260px]"
        />

        <select
          value={newItemType}
          onChange={(e) => setNewItemType(e.target.value)}
          className="bg-[#111319] border border-[#282a30] text-[#e2e2eb] text-[12px] font-telemetry px-3.5 py-2 rounded-lg focus:outline-none"
        >
          <option value="niche">Niche de marché</option>
          <option value="app">Application spécifique</option>
          <option value="keyword">Mot-clé / Requête</option>
          <option value="idea">Idée d'application</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-[13px] rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-[#7c3aed]/20"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Ajouter à la surveillance</span>
        </button>
      </form>

      {/* Watchlist Table */}
      <div className="bg-[#191b22] border border-[#282a30] rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#282a30] bg-[#111319] font-telemetry text-[11px] text-[#958ea0] uppercase tracking-wider">
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Élément Surveillé</th>
              <th className="py-3 px-4">Métrique Initiale</th>
              <th className="py-3 px-4">Métrique Actuelle</th>
              <th className="py-3 px-4">Tendance</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#282a30] text-[13px]">
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#958ea0] font-telemetry text-[12px]">
                  Aucun élément dans votre liste de surveillance. Ajoutez-en un ci-dessus ou depuis les cartes de l'application !
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-[#282a30]/60 transition-colors">
                <td className="py-3.5 px-4 font-telemetry text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#282a30] text-[#d0bcff] font-bold uppercase">
                    {item.item_type}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-[#e2e2eb]">
                  {item.name}
                </td>
                <td className="py-3.5 px-4 font-telemetry text-[12px] text-[#958ea0]">
                  {item.initial_metric || 75}/100
                </td>
                <td className="py-3.5 px-4 font-telemetry text-[12px] font-bold text-[#4edea3]">
                  {item.current_metric || 88}/100
                </td>
                <td className="py-3.5 px-4 font-telemetry text-[11px] text-[#4edea3]">
                  ▲ +17,3% d'accélération
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1 rounded hover:bg-[#ef4444]/20 text-[#958ea0] hover:text-[#ffb4ab] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
