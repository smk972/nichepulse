from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.schema import MarketGap

router = APIRouter(prefix="/markets", tags=["Markets & Geo Gaps"])

@router.get("")
def list_market_gaps(
    platform: Optional[str] = Query(None, description="Filtrer par plateforme: 'ios', 'android', ou 'all'"),
    db: Session = Depends(get_db)
):
    """Retourne les opportunités géographiques avec filtrage par plateforme (iOS, Android, Combiné)."""
    query = db.query(MarketGap)
    if platform and platform.lower() in ["ios", "android"]:
        query = query.filter(MarketGap.platform.in_([platform.lower(), "all"]))
    return query.order_by(MarketGap.gap_score.desc()).all()
