from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.models.schema import Watchlist

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])

class WatchlistCreate(BaseModel):
    item_type: str  # "app", "niche", "keyword", "idea"
    item_id: str
    name: str
    notes: Optional[str] = None
    initial_metric: Optional[float] = 0.0

@router.get("")
def get_watchlist(db: Session = Depends(get_db)):
    """Retourne la liste de surveillance personnalisée de l'utilisateur."""
    return db.query(Watchlist).order_by(Watchlist.created_at.desc()).all()

@router.post("")
def add_to_watchlist(item: WatchlistCreate, db: Session = Depends(get_db)):
    entry = Watchlist(
        item_type=item.item_type,
        item_id=item.item_id,
        name=item.name,
        notes=item.notes,
        initial_metric=item.initial_metric or 0.0,
        current_metric=item.initial_metric or 0.0
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}")
def remove_from_watchlist(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(Watchlist).filter(Watchlist.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Élément non trouvé")
    db.delete(entry)
    db.commit()
    return {"success": True, "deleted_id": entry_id}
