"""
Moteur de détection des opportunités géographiques & Market Gaps (Cahier des charges #5 & #18).
Détecte les transferts de marché (ex: USA -> France, UK -> France, Allemagne -> France)
où une application valide la demande dans un grand marché avant d'arriver en Europe francophone.
"""

from typing import List, Dict, Any
from app.services.scoring import calculate_market_gap

def detect_market_transfer_opportunities(
    niche_metrics_by_country: Dict[str, Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Compare les métriques d'une niche entre les pays (US vs FR, UK vs FR, DE vs FR).
    
    Structure attendue de niche_metrics_by_country :
    {
        "US": {"demand": 92.0, "competition": 85.0, "apps_count": 48},
        "FR": {"demand": 68.0, "competition": 22.0, "apps_count": 6},
        "GB": {"demand": 80.0, "competition": 65.0, "apps_count": 25},
        "DE": {"demand": 72.0, "competition": 45.0, "apps_count": 18}
    }
    """
    gaps = []
    
    # Paires de transfert prioritaires (Cahier des charges #5)
    transfer_pairs = [
        ("US", "FR", "Transfert USA → France (Validation forte aux USA, niche vierge en France)"),
        ("US", "DE", "Transfert USA → Allemagne"),
        ("GB", "FR", "Transfert UK → France"),
        ("DE", "FR", "Transfert Allemagne → France")
    ]

    for origin, target, label in transfer_pairs:
        if origin in niche_metrics_by_country and target in niche_metrics_by_country:
            orig_data = niche_metrics_by_country[origin]
            targ_data = niche_metrics_by_country[target]

            # Calcul du gap via la formule mathématique
            gap_res = calculate_market_gap(
                origin_demand=orig_data["demand"],
                origin_competition=orig_data["competition"],
                target_demand=targ_data["demand"],
                target_competition=targ_data["competition"]
            )

            # Si la demande d'origine est forte (>70) et la concurrence cible est faible (<45)
            is_high_opportunity = (
                orig_data["demand"] >= 70.0 and 
                targ_data["competition"] <= 45.0 and
                gap_res["score"] >= 65.0
            )

            if is_high_opportunity:
                gaps.append({
                    "type": "CROSS_MARKET_TRANSFER",
                    "origin_country": origin,
                    "target_country": target,
                    "title": label,
                    "gap_score": gap_res["score"],
                    "details": gap_res["details"],
                    "origin_summary": f"Demande US: {orig_data['demand']}/100 | {orig_data.get('apps_count', 0)} apps en place",
                    "target_summary": f"Demande Cible: {targ_data['demand']}/100 | Seulement {targ_data.get('apps_count', 0)} concurrents locaux",
                    "recommendation": f"Adapter le modèle américain pour le marché {target} avec une localisation soignée et un positionnement sans abonnement abusif."
                })

    gaps.sort(key=lambda x: x["gap_score"], reverse=True)
    return gaps
