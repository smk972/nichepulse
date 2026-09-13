from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schema import SearchTerm, SearchMetric

router = APIRouter(prefix="/search", tags=["Search Momentum"])

@router.get("")
def list_search_metrics(country: str = None, db: Session = Depends(get_db)):
    """Retourne les requêtes de recherche émergentes avec vélocité et taux de croissance."""
    query = db.query(SearchMetric, SearchTerm).join(SearchTerm, SearchMetric.search_term_id == SearchTerm.id)
    if country:
        query = query.filter(SearchMetric.country == country.upper())
    
    records = query.order_by(SearchMetric.growth_30d.desc()).all()
    results = []
    for metric, term in records:
        results.append({
            "id": metric.id,
            "query": term.query,
            "category": term.category,
            "country": metric.country,
            "relative_demand_score": metric.relative_demand_score,
            "estimated_volume": metric.estimated_volume,
            "growth_24h": metric.growth_24h,
            "growth_7d": metric.growth_7d,
            "growth_30d": metric.growth_30d,
            "recorded_at": metric.recorded_at
        })
    return results
