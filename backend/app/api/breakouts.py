from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.schema import App, AppRanking
from app.services.breakout_detector import detect_breakout

router = APIRouter(prefix="/breakouts", tags=["Breakouts"])

@router.get("")
def list_breakouts(
    platform: Optional[str] = Query(None, description="Filtrer par plateforme: 'ios', 'android', ou 'all'"),
    db: Session = Depends(get_db)
):
    """Retourne les applications Breakout avec filtrage par plateforme (iOS, Android, ou Combiné)."""
    query = db.query(App).filter(App.is_breakout == True)
    if platform and platform.lower() in ["ios", "android"]:
        query = query.filter(App.platform == platform.lower())
    
    apps = query.all()
    results = []

    for app in apps:
        rankings = db.query(AppRanking).filter(AppRanking.app_id == app.id).order_by(AppRanking.date.asc()).all()
        rank_hist = [{"date": r.date, "rank": r.rank} for r in rankings]
        
        breakout_metrics = detect_breakout(rank_hist, search_growth_pct=150.0, review_growth_pct=80.0)
        results.append({
            "app": app,
            "metrics": breakout_metrics,
            "history": rank_hist[-14:]
        })

    results.sort(key=lambda x: x["metrics"]["momentum_score"], reverse=True)
    return results
