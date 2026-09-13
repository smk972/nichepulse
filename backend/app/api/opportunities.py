from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.schema import Opportunity
from app.services.scoring import calculate_build_score

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])

@router.get("")
def list_opportunities(
    status: Optional[str] = None,
    platform: Optional[str] = Query(None, description="Filtrer par plateforme: 'ios', 'android', ou 'all'"),
    db: Session = Depends(get_db)
):
    """Retourne la matrice des opportunités avec filtrage plateforme (iOS, Android, Combiné)."""
    query = db.query(Opportunity)
    if status:
        query = query.filter(Opportunity.status == status.upper())
    if platform and platform.lower() in ["ios", "android"]:
        query = query.filter(Opportunity.platform.in_([platform.lower(), "all"]))
    return query.order_by(Opportunity.build_score.desc()).all()

@router.get("/{opp_id}")
def get_opportunity(opp_id: int, db: Session = Depends(get_db)):
    """Retourne le détail exhaustif d'une opportunité et l'explication 'Pourquoi 94 ?'."""
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunité non trouvée")

    score_explanation = calculate_build_score(
        opportunity_score=opp.opportunity_score,
        easy_build_score=opp.easy_build_score,
        market_gap=opp.market_gap_score,
        search_demand=opp.search_demand_score,
        pain_score=opp.pain_score,
        competition=opp.competition_score
    )

    return {
        "opportunity": opp,
        "score_explanation": {
            "title": f"Pourquoi {int(opp.build_score)}/100 ?",
            "status_badge": score_explanation["status_badge"],
            "breakdown": score_explanation["breakdown"],
            "raw_factors": {
                "demande_recherche": f"{opp.search_demand_score}/100 (+287% 30j)",
                "momentum": f"{opp.momentum_score}/100 (+126 places)",
                "pain_utilisateur": f"{opp.pain_score}/100 (frustrations prix & export)",
                "market_gap": f"{opp.market_gap_score}/100 (US validé -> FR vierge)",
                "concurrence": f"{opp.competition_score}/100 (faible/modérée)",
                "facilite_mvp": f"{opp.easy_build_score}/100 (très accessible solo)",
                "mvp_jours": opp.mvp_days,
                "complexite_technique": f"{opp.complexity_score}/100"
            },
            "source_signals": opp.source_signals
        }
    }
