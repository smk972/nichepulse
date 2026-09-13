from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.models.schema import App, AppRanking, AppReview, AppFeature
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/apps", tags=["Apps"])

@router.get("")
def list_apps(
    country: Optional[str] = None,
    category: Optional[str] = None,
    platform: Optional[str] = None,
    is_breakout: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 250,
    db: Session = Depends(get_db)
):
    """Liste les applications avec filtrage par pays, catégorie, plateforme et statut breakout."""
    query = db.query(App)
    if country:
        query = query.filter(App.country == country.upper())
    if category:
        query = query.filter(App.category.ilike(f"%{category}%"))
    if platform:
        query = query.filter(App.platform == platform.lower())
    if is_breakout is not None:
        query = query.filter(App.is_breakout == is_breakout)
    if search:
        query = query.filter((App.name.ilike(f"%{search}%")) | (App.developer.ilike(f"%{search}%")))
    
    return query.order_by(App.current_rank.asc()).limit(limit).all()

@router.get("/{app_id}")
async def get_app_detail(app_id: str, db: Session = Depends(get_db)):
    """Retourne la fiche détaillée d'une application, son historique 30j et son analyse IA."""
    app = db.query(App).filter(App.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application non trouvée")

    # Historique chronologique des classements
    rankings = db.query(AppRanking).filter(AppRanking.app_id == app_id).order_by(AppRanking.date.asc()).all()

    # Avis récents
    reviews = db.query(AppReview).filter(AppReview.app_id == app_id).order_by(AppReview.date.desc()).limit(20).all()

    # Analyse IA (Gemini ou déterministe)
    app_meta = {
        "name": app.name,
        "developer": app.developer,
        "category": app.category,
        "description": app.description,
        "price": app.price,
        "has_in_app_purchases": app.has_in_app_purchases,
        "rating": app.rating,
        "review_count": app.review_count
    }
    ai_analysis = await gemini_service.analyze_app(app_meta)

    # Fonctionnalités clés analysées
    features = db.query(AppFeature).filter(AppFeature.app_id == app_id).all()

    return {
        "app": app,
        "history": rankings,
        "reviews": reviews,
        "features": features,
        "ai_analysis": ai_analysis
    }
