from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.schema import PainPoint, MissingFeature

router = APIRouter(prefix="/pains", tags=["Pain Points"])

@router.get("")
def list_pain_points(
    platform: Optional[str] = Query(None, description="Filtrer par plateforme: 'ios', 'android', ou 'all'"),
    db: Session = Depends(get_db)
):
    """Retourne le radar des problèmes utilisateurs avec filtrage plateforme (iOS, Android, Combiné)."""
    query = db.query(PainPoint)
    if platform and platform.lower() in ["ios", "android"]:
        query = query.filter(PainPoint.platform.in_([platform.lower(), "all"]))
    return query.order_by(PainPoint.pain_score.desc()).all()

@router.get("/missing-features")
def list_missing_features(db: Session = Depends(get_db)):
    """Retourne les fonctionnalités les plus réclamées dans les avis négatifs."""
    return db.query(MissingFeature).order_by(MissingFeature.requests_count.desc()).all()
