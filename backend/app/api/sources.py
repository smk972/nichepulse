from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schema import DataSource, AnalysisRun
from app.services.pipeline import DailyPipeline

router = APIRouter(prefix="/sources", tags=["Sources & Observability"])

@router.get("")
def get_sources_status(db: Session = Depends(get_db)):
    """Retourne la page d'observabilité des collecteurs (App Store, Play, Trends, Gemini, Keywords)."""
    sources = db.query(DataSource).all()
    runs = db.query(AnalysisRun).order_by(AnalysisRun.created_at.desc()).limit(10).all()
    return {
        "sources": sources,
        "recent_runs": runs
    }

@router.post("/sync")
async def trigger_manual_sync(db: Session = Depends(get_db)):
    """Déclenche manuellement la synchronisation et la vérification des sources."""
    pipeline = DailyPipeline(db)
    result = await pipeline.run_pipeline(mode="DEMO")
    return result
