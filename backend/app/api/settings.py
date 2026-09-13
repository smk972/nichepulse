from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
from app.core.config import settings

router = APIRouter(prefix="/settings", tags=["Settings & Configuration"])

class WeightsUpdate(BaseModel):
    build_opportunity: float = 0.30
    build_easy_build: float = 0.20
    build_market_gap: float = 0.15
    build_search_demand: float = 0.15
    build_pain: float = 0.10
    build_competition: float = 0.10
    build_it_threshold: float = 80.0
    investigate_threshold: float = 60.0

@router.get("")
def get_current_settings():
    """Retourne la configuration globale, les poids du Build Score et les seuils de décision."""
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gemini_model": settings.GEMINI_MODEL,
        "gemini_key_configured": bool(settings.GEMINI_API_KEY),
        "supported_countries": settings.SUPPORTED_COUNTRIES,
        "expandable_countries": settings.EXPANDABLE_COUNTRIES,
        "thresholds": {
            "build_it": settings.BUILD_IT_THRESHOLD,
            "investigate": settings.INVESTIGATE_THRESHOLD
        },
        "build_weights": {
            "opportunity_score": settings.BUILD_WEIGHT_OPPORTUNITY,
            "easy_build_score": settings.BUILD_WEIGHT_EASY_BUILD,
            "market_gap": settings.BUILD_WEIGHT_MARKET_GAP,
            "search_demand": settings.BUILD_WEIGHT_SEARCH_DEMAND,
            "pain_score": settings.BUILD_WEIGHT_PAIN,
            "competition": settings.BUILD_WEIGHT_COMPETITION
        },
        "opportunity_weights": {
            "search_demand": settings.OPP_WEIGHT_SEARCH_DEMAND,
            "momentum": settings.OPP_WEIGHT_MOMENTUM,
            "market_gap": settings.OPP_WEIGHT_MARKET_GAP,
            "pain_score": settings.OPP_WEIGHT_PAIN,
            "competition": settings.OPP_WEIGHT_COMPETITION,
            "emerging_trend": settings.OPP_WEIGHT_EMERGING_TREND
        }
    }

@router.post("")
def update_settings(update: WeightsUpdate):
    """Met à jour dynamiquement les poids de score et seuils."""
    settings.BUILD_WEIGHT_OPPORTUNITY = update.build_opportunity
    settings.BUILD_WEIGHT_EASY_BUILD = update.build_easy_build
    settings.BUILD_WEIGHT_MARKET_GAP = update.build_market_gap
    settings.BUILD_WEIGHT_SEARCH_DEMAND = update.build_search_demand
    settings.BUILD_WEIGHT_PAIN = update.build_pain
    settings.BUILD_WEIGHT_COMPETITION = update.build_competition
    settings.BUILD_IT_THRESHOLD = update.build_it_threshold
    settings.INVESTIGATE_THRESHOLD = update.investigate_threshold
    return {"success": True, "message": "Pondérations et seuils mis à jour avec succès"}
