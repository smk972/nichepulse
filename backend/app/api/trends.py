from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.schema import Trend

router = APIRouter(prefix="/trends", tags=["Trends"])

@router.get("")
def list_trends(
    category: Optional[str] = None,
    platform: Optional[str] = Query(None, description="Filtrer par plateforme: 'ios', 'android', ou 'all'"),
    db: Session = Depends(get_db)
):
    """Retourne la liste des macro-tendances avec filtrage par catégorie et plateforme."""
    query = db.query(Trend)
    if category:
        query = query.filter(Trend.category.ilike(f"%{category}%"))
    if platform and platform.lower() in ["ios", "android"]:
        query = query.filter(Trend.platform.in_([platform.lower(), "all"]))
    return query.order_by(Trend.trend_score.desc()).all()
