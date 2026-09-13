"""
Moteur de détection des applications Breakout (Cahier des charges #7).
Une Breakout App est une application qui montre une accélération significative dans les classements.
Exemple : J-30: #850 -> J-14: #410 -> J-7: #247 -> Aujourd'hui: #121.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from app.services.scoring import calculate_momentum_score

def detect_breakout(
    rank_history: List[Dict[str, Any]],
    search_growth_pct: float = 0.0,
    review_growth_pct: float = 0.0
) -> Dict[str, Any]:
    """
    Analyse l'historique chronologique des classements d'une application.
    rank_history doit être trié du plus ancien au plus récent (ou contenir des objets avec 'date' et 'rank').
    """
    if not rank_history or len(rank_history) < 2:
        return {
            "is_breakout": False,
            "momentum_score": 0.0,
            "rank_change_1d": 0,
            "rank_change_7d": 0,
            "rank_change_30d": 0,
            "acceleration": 0.0,
            "velocity": 0.0,
            "reason": "Historique insuffisant pour calculer la vélocité"
        }

    # Récupérer les classements clés
    current_rank = rank_history[-1]["rank"]
    
    # 24h (J-1)
    rank_1d = rank_history[-2]["rank"]
    rank_change_1d = rank_1d - current_rank  # Positif si on monte dans le classement

    # 7 jours
    idx_7d = max(0, len(rank_history) - 8)
    rank_7d = rank_history[idx_7d]["rank"]
    rank_change_7d = rank_7d - current_rank

    # 30 jours
    idx_30d = max(0, len(rank_history) - 31)
    rank_30d = rank_history[idx_30d]["rank"]
    rank_change_30d = rank_30d - current_rank

    # Calcul de la vélocité (places gagnées par jour sur 7 jours)
    days_7 = max(1, len(rank_history) - 1 - idx_7d)
    velocity_7d = rank_change_7d / days_7

    # Vélocité antérieure (de J-30 à J-7)
    days_prior = max(1, idx_7d - idx_30d)
    rank_change_prior = rank_30d - rank_7d
    velocity_prior = rank_change_prior / days_prior

    # Accélération = variation de vélocité
    acceleration = velocity_7d - velocity_prior

    # Calcul du score de momentum via la formule mathématique
    momentum = calculate_momentum_score(
        rank_change_1d=rank_change_1d,
        rank_change_7d=rank_change_7d,
        rank_change_30d=rank_change_30d,
        acceleration=acceleration,
        search_growth_pct=search_growth_pct,
        review_growth_pct=review_growth_pct
    )

    # Critères stricts de qualification "Breakout" :
    # 1. Gain de plus de 40 places sur 7 jours OU plus de 150 places sur 30 jours
    # 2. Accélération positive (vélocité en hausse)
    # 3. Score de momentum supérieur ou égal à 75/100
    is_breakout = (
        (rank_change_7d >= 40 or rank_change_30d >= 150) and
        acceleration >= 0 and
        momentum["score"] >= 75.0
    )

    return {
        "is_breakout": is_breakout,
        "momentum_score": momentum["score"],
        "momentum_details": momentum,
        "current_rank": current_rank,
        "rank_change_1d": rank_change_1d,
        "rank_change_7d": rank_change_7d,
        "rank_change_30d": rank_change_30d,
        "velocity_7d": round(velocity_7d, 2),
        "acceleration": round(acceleration, 2),
        "classification": "🔥 BREAKOUT MAJEUR" if is_breakout else ("ACCÉLÉRATION MODÉRÉE" if momentum["score"] > 60 else "STABLE")
    }
