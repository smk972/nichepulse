"""
Moteur de calcul mathématique et algorithmique déterministe pour NICHEPULSE.
Respecte les 70% de calculs purs sans dépendance aveugle à l'IA.
Tous les scores sont strictement normalisés entre 0 et 100.
"""

from typing import Dict, Any, List, Optional
import math
from app.core.config import settings

def clamp(val: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    """Borne une valeur entre min_val et max_val."""
    return max(min_val, min(val, max_val))

def calculate_momentum_score(
    rank_change_1d: int,
    rank_change_7d: int,
    rank_change_30d: int,
    acceleration: float,
    search_growth_pct: float,
    review_growth_pct: float
) -> Dict[str, Any]:
    """
    Calcule le MOMENTUM SCORE / 100 (Cahier des charges #7 & #9).
    Mesure la vélocité et l'accélération d'une application dans les classements.
    
    Variables :
    - rank_change_1d : Gain de places sur 24h (+50 = l'app est passée de #150 à #100)
    - rank_change_7d : Gain de places sur 7 jours
    - rank_change_30d : Gain de places sur 30 jours
    - acceleration : Variation de vélocité (v_7d - v_30d)
    - search_growth_pct : Croissance % des requêtes de recherche associées
    - review_growth_pct : Croissance % du volume de nouveaux avis
    
    Pondération :
    - 30% gain 7j (normalisé avec fonction sigmoïde/log pour éviter qu'un saut extrême écrase tout)
    - 25% gain 30j
    - 15% gain 24h (signal court-terme)
    - 15% accélération
    - 10% croissance des avis (preuve d'adoption réelle)
    - 5% croissance des recherches
    """
    # Normalisation logarithmique douce des gains de rangs (un gain de +200 donne ~90)
    def norm_rank_gain(gain: int, factor: float = 2.5) -> float:
        if gain <= 0:
            return 0.0
        return clamp(math.log1p(gain) * factor * 10.0)

    score_1d = norm_rank_gain(rank_change_1d, factor=3.5)
    score_7d = norm_rank_gain(rank_change_7d, factor=2.2)
    score_30d = norm_rank_gain(rank_change_30d, factor=1.8)
    
    score_accel = clamp(50.0 + (acceleration * 5.0))
    score_search = clamp(search_growth_pct / 2.0)  # +200% search growth = 100 pts
    score_reviews = clamp(review_growth_pct / 1.5) # +150% reviews growth = 100 pts

    raw_momentum = (
        0.30 * score_7d +
        0.25 * score_30d +
        0.15 * score_1d +
        0.15 * score_accel +
        0.10 * score_reviews +
        0.05 * score_search
    )
    final_score = round(clamp(raw_momentum), 1)

    return {
        "score": final_score,
        "components": {
            "score_1d": round(score_1d, 1),
            "score_7d": round(score_7d, 1),
            "score_30d": round(score_30d, 1),
            "acceleration_score": round(score_accel, 1),
            "reviews_growth_score": round(score_reviews, 1),
            "search_growth_score": round(score_search, 1),
        },
        "raw_inputs": {
            "rank_change_1d": rank_change_1d,
            "rank_change_7d": rank_change_7d,
            "rank_change_30d": rank_change_30d,
            "acceleration": round(acceleration, 2),
            "search_growth_pct": search_growth_pct,
            "review_growth_pct": review_growth_pct
        }
    }

def calculate_trend_score(
    ranking_growth_score: float,
    search_growth_score: float,
    acceleration_score: float,
    is_recent_app: bool,
    country_breadth: int,
    competitors_aggregate_growth: float
) -> Dict[str, Any]:
    """
    Calcule le TREND SCORE / 100 (Cahier des charges #8).
    Prend en compte :
    - croissance du classement (30%)
    - croissance des recherches (25%)
    - accélération (15%)
    - apparition récente (prime de fraîcheur : 10%)
    - présence dans plusieurs pays (internationalisation précoce : 10%)
    - évolution positive globale de la niche de concurrents (10%)
    """
    recency_bonus = 100.0 if is_recent_app else 40.0
    country_score = clamp((country_breadth / 5.0) * 100.0)
    comp_score = clamp(50.0 + (competitors_aggregate_growth * 2.0))

    trend_raw = (
        0.30 * clamp(ranking_growth_score) +
        0.25 * clamp(search_growth_score) +
        0.15 * clamp(acceleration_score) +
        0.10 * recency_bonus +
        0.10 * country_score +
        0.10 * comp_score
    )
    final_score = round(clamp(trend_raw), 1)
    return {
        "score": final_score,
        "components": {
            "ranking_growth": round(ranking_growth_score, 1),
            "search_growth": round(search_growth_score, 1),
            "acceleration": round(acceleration_score, 1),
            "recency_bonus": round(recency_bonus, 1),
            "country_breadth_score": round(country_score, 1),
            "competitors_momentum": round(comp_score, 1)
        }
    }

def calculate_pain_score(
    frequency_pct: float,
    severity: float,
    growth_pct: float,
    review_volume: int,
    concentration_hhi: float = 0.4
) -> Dict[str, Any]:
    """
    Calcule le PAIN SCORE / 100 (Cahier des charges #15).
    Combine :
    - fréquence du problème (% d'avis négatifs concernés, ex: 31%)
    - gravité moyenne (1 à 10, ex: 8/10 -> normalisé à 80)
    - croissance récente de cette frustration (% d'augmentation)
    - concentration du problème (Herfindahl Index)
    """
    freq_norm = clamp(frequency_pct * 2.5) # 40% de plaintes = 100
    sev_norm = clamp(severity * 10.0)      # 8/10 = 80 pts
    growth_norm = clamp(50.0 + (growth_pct * 1.5))
    volume_confidence = clamp(math.log10(max(10, review_volume)) * 30.0)
    concentration_norm = clamp(concentration_hhi * 100.0)

    pain_raw = (
        0.35 * freq_norm +
        0.30 * sev_norm +
        0.15 * growth_norm +
        0.10 * volume_confidence +
        0.10 * concentration_norm
    )
    final_score = round(clamp(pain_raw), 1)
    return {
        "score": final_score,
        "components": {
            "frequency_score": round(freq_norm, 1),
            "severity_score": round(sev_norm, 1),
            "growth_trend_score": round(growth_norm, 1),
            "volume_confidence": round(volume_confidence, 1),
            "concentration_score": round(concentration_norm, 1)
        }
    }

def calculate_competition_score(
    competitor_count: int,
    top_player_dominance_pct: float,
    average_competitor_rating: float,
    average_review_count: int
) -> Dict[str, Any]:
    """
    Calcule le COMPETITION SCORE / 100 (Cahier des charges #17).
    Règle absolue : 100 = Concurrence TRÈS FAIBLE (marché ouvert pour solo dev).
                     0 = Concurrence EXTRÊMEMENT SATURÉE / monopole.
    """
    # Pénalité du nombre d'acteurs en place
    if competitor_count <= 2:
        count_score = 95.0
    elif competitor_count <= 5:
        count_score = 75.0
    elif competitor_count <= 10:
        count_score = 50.0
    elif competitor_count <= 20:
        count_score = 30.0
    else:
        count_score = 10.0

    # Pénalité de domination d'un mastodonte
    dominance_score = clamp(100.0 - (top_player_dominance_pct * 1.2))

    # Opportunité si les concurrents actuels sont mal notés (< 3.8 = boulevard)
    if average_competitor_rating <= 3.2:
        rating_opportunity = 95.0
    elif average_competitor_rating <= 3.8:
        rating_opportunity = 80.0
    elif average_competitor_rating <= 4.2:
        rating_opportunity = 50.0
    else:
        rating_opportunity = 20.0

    # Barrière à l'entrée par les avis
    if average_review_count < 500:
        moat_score = 90.0
    elif average_review_count < 3000:
        moat_score = 65.0
    elif average_review_count < 15000:
        moat_score = 35.0
    else:
        moat_score = 10.0

    raw = (
        0.35 * count_score +
        0.25 * dominance_score +
        0.25 * rating_opportunity +
        0.15 * moat_score
    )
    final_score = round(clamp(raw), 1)
    return {
        "score": final_score,
        "components": {
            "player_count_score": round(count_score, 1),
            "lack_of_dominance_score": round(dominance_score, 1),
            "low_competitor_rating_advantage": round(rating_opportunity, 1),
            "low_review_barrier": round(moat_score, 1)
        }
    }

def calculate_market_gap(
    origin_demand: float,
    origin_competition: float,
    target_demand: float,
    target_competition: float
) -> Dict[str, Any]:
    """
    Calcule le MARKET GAP SCORE / 100 (Cahier des charges #18).
    Exemple : 
    USA (origin) : Forte demande (92), forte concurrence (81).
    France (target) : Forte demande émergente (67), faible concurrence (28).
    -> Opportunité d'arbitrage géographique très élevée.
    """
    # Le gap est fort si la demande cible est substantielle et la concurrence cible est faible
    target_opp = (target_demand * 0.6) + ((100.0 - target_competition) * 0.4)
    # Preuve de traction sur le marché d'origine (ex: 92/100 aux USA)
    transfer_momentum = origin_demand
    
    gap_raw = (0.70 * target_opp) + (0.30 * transfer_momentum)
    final_score = round(clamp(gap_raw), 1)
    return {
        "score": final_score,
        "details": {
            "target_opportunity": round(target_opp, 1),
            "origin_transfer_potential": round(transfer_momentum, 1),
            "target_demand": target_demand,
            "target_competition": target_competition
        }
    }

def calculate_search_demand(
    google_trends_score: float,
    growth_30d_pct: float,
    related_queries_velocity: float,
    is_absolute_volume_confirmed: bool = False
) -> Dict[str, Any]:
    """
    Calcule le SEARCH DEMAND SCORE / 100 (Cahier des charges #19).
    Distingue la demande relative de l'intérêt temporel.
    """
    base_demand = clamp(google_trends_score)
    growth_bonus = clamp(growth_30d_pct / 2.0)
    velocity_norm = clamp(related_queries_velocity)
    confidence_factor = 1.0 if is_absolute_volume_confirmed else 0.85

    raw = ((0.50 * base_demand) + (0.30 * growth_bonus) + (0.20 * velocity_norm)) * confidence_factor
    final_score = round(clamp(raw), 1)
    return {
        "score": final_score,
        "components": {
            "base_trends": round(base_demand, 1),
            "growth_30d": round(growth_bonus, 1),
            "queries_velocity": round(velocity_norm, 1),
            "is_absolute_volume_confirmed": is_absolute_volume_confirmed
        }
    }

def calculate_technical_complexity(
    features_count: int,
    needs_ai: bool = False,
    needs_external_apis: bool = False,
    needs_auth: bool = False,
    needs_payment: bool = False,
    needs_geolocation: bool = False,
    needs_realtime: bool = False,
    needs_video_processing: bool = False,
    needs_audio_processing: bool = False,
    needs_complex_backend: bool = False,
    needs_cloud_sync: bool = False,
    needs_native_sensors: bool = False
) -> Dict[str, Any]:
    """
    Calcule le TECHNICAL COMPLEXITY SCORE / 100 (Cahier des charges #20 & #21).
    100 = Extrêmement complexe, inadapté à un dev solo rapide.
    0 = CRUD basique ou outil local instantané.
    """
    base = min(20.0, features_count * 2.5)
    
    # Ajout déterministe des charges techniques
    if needs_auth: base += 6.0
    if needs_payment: base += 8.0
    if needs_ai: base += 12.0
    if needs_external_apis: base += 7.0
    if needs_geolocation: base += 9.0
    if needs_cloud_sync: base += 8.0
    if needs_complex_backend: base += 14.0
    if needs_realtime: base += 18.0
    if needs_audio_processing: base += 15.0
    if needs_video_processing: base += 22.0
    if needs_native_sensors: base += 7.0

    final_complexity = round(clamp(base), 1)

    # Estimation MVP en jours basée sur la complexité (Cahier des charges #22)
    if final_complexity < 20:
        mvp_estimate = "3–5 jours"
    elif final_complexity < 35:
        mvp_estimate = "5–8 jours"
    elif final_complexity < 50:
        mvp_estimate = "8–14 jours"
    elif final_complexity < 70:
        mvp_estimate = "2–4 semaines"
    else:
        mvp_estimate = "1–2 mois+"

    return {
        "score": final_complexity,
        "mvp_estimate": mvp_estimate,
        "factors": {
            "features_count": features_count,
            "needs_ai": needs_ai,
            "needs_external_apis": needs_external_apis,
            "needs_auth": needs_auth,
            "needs_payment": needs_payment,
            "needs_realtime": needs_realtime,
            "needs_video_processing": needs_video_processing,
            "needs_audio_processing": needs_audio_processing,
            "needs_complex_backend": needs_complex_backend
        }
    }

def calculate_easy_build_score(technical_complexity_score: float) -> float:
    """
    EASY BUILD SCORE / 100 (Cahier des charges #20).
    Inverse de la complexité technique : plus c'est facile, plus le score est élevé.
    """
    return round(clamp(100.0 - technical_complexity_score), 1)

def calculate_opportunity_score(
    search_demand: float,
    momentum: float,
    market_gap: float,
    pain_score: float,
    competition: float,
    emerging_trend: float = 70.0
) -> Dict[str, Any]:
    """
    Calcule le OPPORTUNITY SCORE / 100 (Cahier des charges #23).
    Pondération configurable :
    25% Search Demand + 20% Momentum + 15% Market Gap + 15% Pain + 15% Competition + 10% Emerging Trend
    """
    w_sd = settings.OPP_WEIGHT_SEARCH_DEMAND
    w_mom = settings.OPP_WEIGHT_MOMENTUM
    w_gap = settings.OPP_WEIGHT_MARKET_GAP
    w_pain = settings.OPP_WEIGHT_PAIN
    w_comp = settings.OPP_WEIGHT_COMPETITION
    w_trend = settings.OPP_WEIGHT_EMERGING_TREND

    raw = (
        w_sd * search_demand +
        w_mom * momentum +
        w_gap * market_gap +
        w_pain * pain_score +
        w_comp * competition +
        w_trend * emerging_trend
    )
    final_score = round(clamp(raw), 1)
    return {
        "score": final_score,
        "weights": {
            "search_demand": w_sd,
            "momentum": w_mom,
            "market_gap": w_gap,
            "pain_score": w_pain,
            "competition": w_comp,
            "emerging_trend": w_trend
        }
    }

def calculate_build_score(
    opportunity_score: float,
    easy_build_score: float,
    market_gap: float,
    search_demand: float,
    pain_score: float,
    competition: float
) -> Dict[str, Any]:
    """
    Calcule le SCORE FINAL LE PLUS IMPORTANT : BUILD SCORE / 100 (Cahier des charges #24).
    Répond à : « Cette application représente-t-elle une opportunité rentable pour MOI solo dev,
    compte tenu de la demande ET de la facilité de développement ? »
    
    Pondération par défaut :
    30% Opportunity Score
    20% Easy Build Score
    15% Market Gap
    15% Search Demand
    10% Pain Score
    10% Competition Score
    """
    w_opp = settings.BUILD_WEIGHT_OPPORTUNITY
    w_easy = settings.BUILD_WEIGHT_EASY_BUILD
    w_gap = settings.BUILD_WEIGHT_MARKET_GAP
    w_sd = settings.BUILD_WEIGHT_SEARCH_DEMAND
    w_pain = settings.BUILD_WEIGHT_PAIN
    w_comp = settings.BUILD_WEIGHT_COMPETITION

    raw = (
        w_opp * opportunity_score +
        w_easy * easy_build_score +
        w_gap * market_gap +
        w_sd * search_demand +
        w_pain * pain_score +
        w_comp * competition
    )
    final_score = round(clamp(raw), 1)

    # Classification déterministe (Cahier des charges #25)
    if final_score >= settings.BUILD_IT_THRESHOLD:
        status = "BUILD IT"
        status_badge = "🔥 BUILD IT"
    elif final_score >= settings.INVESTIGATE_THRESHOLD:
        status = "INVESTIGATE"
        status_badge = "🔍 INVESTIGATE"
    else:
        status = "AVOID"
        status_badge = "⛔ AVOID"

    return {
        "score": final_score,
        "status": status,
        "status_badge": status_badge,
        "breakdown": {
            "opportunity_contribution": round(w_opp * opportunity_score, 1),
            "easy_build_contribution": round(w_easy * easy_build_score, 1),
            "market_gap_contribution": round(w_gap * market_gap, 1),
            "search_demand_contribution": round(w_sd * search_demand, 1),
            "pain_score_contribution": round(w_pain * pain_score, 1),
            "competition_contribution": round(w_comp * competition, 1)
        },
        "raw_metrics": {
            "opportunity_score": opportunity_score,
            "easy_build_score": easy_build_score,
            "market_gap": market_gap,
            "search_demand": search_demand,
            "pain_score": pain_score,
            "competition": competition
        }
    }
