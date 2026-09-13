import pytest
from app.services.scoring import (
    clamp,
    calculate_momentum_score,
    calculate_trend_score,
    calculate_pain_score,
    calculate_competition_score,
    calculate_market_gap,
    calculate_search_demand,
    calculate_technical_complexity,
    calculate_easy_build_score,
    calculate_opportunity_score,
    calculate_build_score
)

def test_clamp():
    assert clamp(150.0, 0.0, 100.0) == 100.0
    assert clamp(-25.0, 0.0, 100.0) == 0.0
    assert clamp(42.5, 0.0, 100.0) == 42.5

def test_momentum_score_breakout():
    # Application avec accélération forte (ex: #850 -> #121 en 30j)
    res = calculate_momentum_score(
        rank_change_1d=35,
        rank_change_7d=126,
        rank_change_30d=729,
        acceleration=4.5,
        search_growth_pct=180.0,
        review_growth_pct=95.0
    )
    assert 0.0 <= res["score"] <= 100.0
    assert res["score"] >= 80.0  # Doit être un fort momentum

def test_trend_score():
    res = calculate_trend_score(
        ranking_growth_score=88.0,
        search_growth_score=92.0,
        acceleration_score=85.0,
        is_recent_app=True,
        country_breadth=4,
        competitors_aggregate_growth=15.0
    )
    assert 0.0 <= res["score"] <= 100.0
    assert res["score"] >= 80.0

def test_pain_score():
    # Fort problème de prix (ex: 35% de plaintes avec sévérité 8.5/10)
    res = calculate_pain_score(
        frequency_pct=35.0,
        severity=8.5,
        growth_pct=40.0,
        review_volume=2500,
        concentration_hhi=0.5
    )
    assert 0.0 <= res["score"] <= 100.0
    assert res["score"] >= 75.0

def test_competition_score_rules():
    # 1. Faible concurrence (peu de concurrents, mal notés) -> Doit être ÉLEVÉ (~80-95)
    open_market = calculate_competition_score(
        competitor_count=2,
        top_player_dominance_pct=25.0,
        average_competitor_rating=3.1,
        average_review_count=350
    )
    assert open_market["score"] >= 75.0

    # 2. Marché saturé (30 concurrents, géant avec 85% du marché, notes 4.8) -> Doit être FAIBLE
    saturated_market = calculate_competition_score(
        competitor_count=45,
        top_player_dominance_pct=85.0,
        average_competitor_rating=4.7,
        average_review_count=85000
    )
    assert saturated_market["score"] <= 30.0

def test_market_gap():
    # US demande 92, concurrence 85
    # France demande 75, concurrence 20 -> Gap très fort
    res = calculate_market_gap(
        origin_demand=92.0,
        origin_competition=85.0,
        target_demand=75.0,
        target_competition=20.0
    )
    assert res["score"] >= 75.0

def test_easy_build_and_complexity():
    # Scanner IA simple (peu de features, API vision, auth simple)
    comp = calculate_technical_complexity(
        features_count=4,
        needs_ai=True,
        needs_external_apis=True,
        needs_auth=False,
        needs_payment=True,
        needs_realtime=False
    )
    assert comp["score"] < 40.0
    easy = calculate_easy_build_score(comp["score"])
    assert easy > 60.0

def test_build_score_classification():
    # Cas "BUILD IT" (> 80)
    top_pick = calculate_build_score(
        opportunity_score=92.0,
        easy_build_score=94.0,
        market_gap=91.0,
        search_demand=94.0,
        pain_score=87.0,
        competition=78.0
    )
    assert top_pick["score"] >= 80.0
    assert top_pick["status"] == "BUILD IT"

    # Cas "AVOID" (< 60)
    bad_pick = calculate_build_score(
        opportunity_score=35.0,
        easy_build_score=30.0,
        market_gap=25.0,
        search_demand=40.0,
        pain_score=20.0,
        competition=15.0
    )
    assert bad_pick["score"] < 60.0
    assert bad_pick["status"] == "AVOID"
