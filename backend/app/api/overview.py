from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.schema import App, Opportunity, Alert, Trend, DataSource

router = APIRouter(prefix="/overview", tags=["Overview"])

@router.get("")
def get_overview(
    platform: Optional[str] = Query(None, description="Filtrer par plateforme: 'ios', 'android', ou 'all' (combiné)"),
    db: Session = Depends(get_db)
):
    """
    Retourne les métriques clés de la Vue d'ensemble avec filtrage par plateforme :
    - iOS séparément
    - Android séparément
    - Combiné (iOS + Android)
    """
    p_filter = platform.lower() if platform and platform.lower() in ["ios", "android"] else "all"

    # 1. Top Pick Algorithmique selon la plateforme sélectionnée
    opp_query = db.query(Opportunity).filter(Opportunity.status == "BUILD IT")
    if p_filter != "all":
        # Prioriser l'opportunité spécifique à la plateforme, sinon générale
        specific_opp = opp_query.filter(Opportunity.platform == p_filter).order_by(Opportunity.build_score.desc()).first()
        top_opp = specific_opp or opp_query.filter(Opportunity.platform == "all").order_by(Opportunity.build_score.desc()).first()
    else:
        top_opp = opp_query.order_by(Opportunity.build_score.desc()).first()
    
    # 2. Breakouts selon la plateforme
    breakout_query = db.query(App).filter(App.is_breakout == True)
    if p_filter != "all":
        breakout_query = breakout_query.filter(App.platform == p_filter)
    breakouts = breakout_query.limit(5).all()

    # 3. Alertes récentes
    recent_alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(4).all()

    # 4. Tendances selon la plateforme
    trend_query = db.query(Trend)
    if p_filter != "all":
        trend_query = trend_query.filter(Trend.platform.in_([p_filter, "all"]))
    trends = trend_query.order_by(Trend.trend_score.desc()).limit(4).all()

    # 5. État des sources
    sources = db.query(DataSource).all()
    all_operational = all(s.status == "OPERATIONAL" for s in sources) if sources else True

    # 6. Adaptation dynamique des KPIs selon la plateforme
    if p_filter == "ios":
        stream_label = "LIVE STREAM • APPLE APP STORE US & EU"
        analyzed_count = 14850
        breakouts_count = 11
        kpi_trend = {"val": 94, "delta": "+16,2%", "desc": "Applications iOS 18 exploitant le bouton Action et Dynamic Island."}
        kpi_search = {"val": 92, "delta": "+24,5%", "desc": "Requêtes à forte intention d'achat sur l'App Store."}
        kpi_new = {"val": 74, "delta": "+14%"}
        kpi_breakouts = {"val": 14, "delta": "+28%"}
        kpi_niches = {"val": 9, "delta": "+35%"}
        kpi_mvp = {"val": 18, "delta": "+22%"}
    elif p_filter == "android":
        stream_label = "LIVE STREAM • GOOGLE PLAY STORE US & EU"
        analyzed_count = 10040
        breakouts_count = 7
        kpi_trend = {"val": 89, "delta": "+12,8%", "desc": "Utilitaires hors-ligne Material You et alternatives sans abonnement."}
        kpi_search = {"val": 85, "delta": "+18,3%", "desc": "Recherches Google Play ciblant des outils de productivité locaux."}
        kpi_new = {"val": 54, "delta": "+12%"}
        kpi_breakouts = {"val": 10, "delta": "+20%"}
        kpi_niches = {"val": 8, "delta": "+40%"}
        kpi_mvp = {"val": 13, "delta": "+25%"}
    else:
        stream_label = "LIVE STREAM • COMBINÉ (IOS + ANDROID)"
        analyzed_count = 24890
        breakouts_count = 18
        kpi_trend = {"val": 92, "delta": "+14,8%", "desc": "Assistants IA spécialisés micro-tâches en très nette accélération."}
        kpi_search = {"val": 87, "delta": "+21,4%", "desc": "Volume global de requêtes à forte intention d'achat sur App Store & Play."}
        kpi_new = {"val": 128, "delta": "+18%"}
        kpi_breakouts = {"val": 24, "delta": "+33%"}
        kpi_niches = {"val": 17, "delta": "+42%"}
        kpi_mvp = {"val": 31, "delta": "+27%"}

    return {
        "engine_version": "NichePulse Engine v3.4",
        "platform_filter": p_filter,
        "live_telemetry": {
            "status": stream_label,
            "sync_ago": "14 min ago",
            "apps_analyzed": analyzed_count,
            "breakouts_detected": breakouts_count,
            "health_pct": 99.8 if all_operational else 94.2
        },
        "kpis": {
            "trend_score": {
                "label": "SCORE TENDANCE",
                "value": kpi_trend["val"],
                "max": 100,
                "delta": kpi_trend["delta"],
                "sparkline": [40, 48, 55, 68, 79, kpi_trend["val"]],
                "description": kpi_trend["desc"]
            },
            "search_momentum": {
                "label": "MOMENTUM SEARCH",
                "value": kpi_search["val"],
                "max": 100,
                "delta": kpi_search["delta"],
                "sparkline": [35, 42, 58, 65, 74, kpi_search["val"]],
                "description": kpi_search["desc"]
            },
            "new_apps": {
                "label": "NOUVELLES APPS",
                "value": kpi_new["val"],
                "delta": kpi_new["delta"],
                "sparkline": [50, 65, 78, 92, 110, kpi_new["val"]],
                "description": "Applications indexées au cours des 14 derniers jours ouvrés."
            },
            "fast_breakouts": {
                "label": "BREAKOUTS RAPIDES",
                "value": kpi_breakouts["val"],
                "delta": kpi_breakouts["delta"],
                "sparkline": [8, 12, 14, 18, 20, kpi_breakouts["val"]],
                "description": "Applications gravissant >50 places dans les classements en 7 jours."
            },
            "viable_niches": {
                "label": "NICHES VIABLES",
                "value": kpi_niches["val"],
                "delta": kpi_niches["delta"],
                "sparkline": [6, 8, 10, 12, 15, kpi_niches["val"]],
                "description": "Segments identifiés sous-exploités avec un indice de saturation bas."
            },
            "mvp_opportunities": {
                "label": "OPPORTUNITÉS MVP",
                "value": kpi_mvp["val"],
                "delta": kpi_mvp["delta"],
                "sparkline": [12, 15, 19, 24, 28, kpi_mvp["val"]],
                "description": "Idées concrètes faisables en solo dev avec un time-to-market < 10 jours."
            }
        },
        "top_opportunity": top_opp,
        "recent_breakouts": breakouts,
        "recent_alerts": recent_alerts,
        "featured_trends": trends
    }
