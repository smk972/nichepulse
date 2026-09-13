from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.schema import AppIdea
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/ideas", tags=["Ideas Backlog & Kill Engine"])

@router.get("")
def list_ideas(
    platform: Optional[str] = Query(None, description="Filtrer par plateforme: 'ios', 'android', ou 'all'"),
    db: Session = Depends(get_db)
):
    """Retourne les idées d'applications générées avec filtrage par plateforme (iOS, Android, Combiné)."""
    query = db.query(AppIdea)
    if platform and platform.lower() in ["ios", "android"]:
        query = query.filter(AppIdea.platform.in_([platform.lower(), "all"]))
    return query.order_by(AppIdea.build_score.desc()).all()

@router.get("/{idea_id}")
def get_idea(idea_id: int, db: Session = Depends(get_db)):
    idea = db.query(AppIdea).filter(AppIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idée non trouvée")
    return idea

@router.post("/{idea_id}/kill")
async def kill_the_idea(idea_id: int, db: Session = Depends(get_db)):
    """Déclenche l'audit adversarial critique 'Kill The Idea' par Gemini."""
    idea = db.query(AppIdea).filter(AppIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idée non trouvée")

    idea_payload = {
        "name": idea.name,
        "niche": idea.tagline or "Application Solo",
        "problem_solved": idea.problem_solved,
        "mvp_features": idea.mvp_features,
        "differentiation": idea.differentiation
    }

    kill_res = await gemini_service.kill_the_idea(idea_payload)
    idea.kill_analysis = kill_res["kill_analysis"]
    db.commit()

    return {
        "idea_id": idea.id,
        "name": idea.name,
        "kill_analysis": idea.kill_analysis,
        "metadata": kill_res.get("metadata", {})
    }
