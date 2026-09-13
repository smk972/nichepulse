from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List, Dict, Any
from app.core.database import get_db
from app.models.schema import App, AppFeature

router = APIRouter(prefix="/new-launches", tags=["New Launches"])

@router.get("")
def list_new_launches(
    platform: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("downloads_growth", description="downloads_growth, release_date, downloads_count"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retourne la liste des nouvelles applications lancées récemment sur l'App Store et Google Play Store,
    avec l'analyse exhaustive de leurs fonctionnalités, statistiques de téléchargements,
    évolution du nombre de téléchargements, modèles de tarification in-app et informations sur l'éditeur.
    """
    query = db.query(App).options(joinedload(App.features)).filter(App.is_new == True)

    if platform and platform.lower() in ["ios", "android"]:
        query = query.filter(App.platform == platform.lower())

    if category:
        query = query.filter(App.category.ilike(f"%{category}%"))

    if search:
        query = query.filter(
            (App.name.ilike(f"%{search}%")) |
            (App.developer.ilike(f"%{search}%")) |
            (App.company_name.ilike(f"%{search}%")) |
            (App.functional_summary.ilike(f"%{search}%"))
        )

    # Récupération et tri
    all_new = query.all()

    # Tri Python flexible pour chaînes de croissance et dates
    if sort_by == "release_date":
        all_new.sort(key=lambda a: a.release_date or "", reverse=True)
    elif sort_by == "downloads_count":
        all_new.sort(key=lambda a: a.downloads_count or 0, reverse=True)
    else:  # Par défaut: croissance / momentum
        def parse_growth(growth_str: Optional[str]) -> float:
            if not growth_str:
                return 0.0
            try:
                clean = growth_str.replace("+", "").replace("%", "").split()[0].replace(",", ".")
                return float(clean)
            except Exception:
                return 0.0
        all_new.sort(key=lambda a: parse_growth(a.downloads_growth), reverse=True)

    # Formatage de la réponse avec fonctionnalités
    items = []
    for app in all_new:
        items.append({
            "id": app.id,
            "bundle_id": app.bundle_id,
            "platform": app.platform,
            "country": app.country,
            "category": app.category,
            "name": app.name,
            "developer": app.developer,
            "icon_url": app.icon_url,
            "description": app.description,
            "functional_summary": app.functional_summary,
            "price": app.price,
            "has_in_app_purchases": app.has_in_app_purchases,
            "subscription_price": app.subscription_price,
            "rating": app.rating,
            "review_count": app.review_count,
            "current_rank": app.current_rank,
            "downloads_count": app.downloads_count,
            "downloads_growth": app.downloads_growth,
            "downloads_growth_weekly": app.downloads_growth_weekly,
            "company_name": app.company_name,
            "company_country": app.company_country,
            "company_type": app.company_type,
            "release_date": app.release_date,
            "store_url": app.store_url,
            "is_breakout": app.is_breakout,
            "is_new": app.is_new,
            "features": [
                {
                    "id": f.id,
                    "name": f.name,
                    "description": f.description,
                    "is_core": bool(f.is_core)
                } for f in app.features
            ]
        })

    # Métriques télémétriques globales du radar
    total_ios = sum(1 for a in items if a["platform"] == "ios")
    total_android = sum(1 for a in items if a["platform"] == "android")
    indie_ratio = round((sum(1 for a in items if "Solo" in (a["company_type"] or "") or "Indépendant" in (a["company_type"] or "")) / max(1, len(items))) * 100)

    # Catégories les plus actives
    cat_counts = {}
    for a in items:
        cat_counts[a["category"]] = cat_counts.get(a["category"], 0) + 1

    return {
        "radar": {
            "total_new_launches": len(items),
            "ios_count": total_ios,
            "android_count": total_android,
            "indie_ratio": f"{indie_ratio}%",
            "top_active_category": max(cat_counts, key=cat_counts.get) if cat_counts else "Productivity",
            "avg_days_since_launch": 28
        },
        "apps": items
    }
