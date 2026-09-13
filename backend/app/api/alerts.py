from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schema import Alert

router = APIRouter(prefix="/alerts", tags=["Alerts & Signals"])

@router.get("")
def list_alerts(db: Session = Depends(get_db)):
    """Retourne les alertes et signaux temps réel (Breakouts, Spikes, Transferts)."""
    return db.query(Alert).order_by(Alert.created_at.desc()).all()

@router.post("/{alert_id}/read")
def mark_alert_read(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerte non trouvée")
    alert.is_read = True
    db.commit()
    return {"success": True, "id": alert_id}
