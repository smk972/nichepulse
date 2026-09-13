"""
Scheduler de synchronisation automatique pour NICHEPULSE (Cahier des charges #30).
Utilise APScheduler pour exécuter automatiquement le pipeline quotidien à 04:00 UTC
et surveiller la santé des sources en continu.
"""

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.core.database import SessionLocal
from app.services.pipeline import DailyPipeline

logger = logging.getLogger("nichepulse.scheduler")

scheduler = AsyncIOScheduler()

async def scheduled_daily_sync():
    """Job de synchronisation automatique exécuté quotidiennement."""
    logger.info("⏰ Déclenchement automatique du pipeline de collecte quotidien...")
    db = SessionLocal()
    try:
        pipeline = DailyPipeline(db)
        result = await pipeline.run_pipeline(mode="REAL")
        logger.info(f"✓ Pipeline automatique terminé avec succès : {result.get('status')} ({result.get('duration_seconds')}s)")
    except Exception as e:
        logger.error(f"✗ Erreur lors de la synchronisation automatique : {e}")
    finally:
        db.close()

def start_scheduler():
    """Démarre l'ordonnanceur d'arrière-plan."""
    if not scheduler.running:
        # Exécution planifiée tous les jours à 04h00 UTC
        scheduler.add_job(
            scheduled_daily_sync,
            trigger=CronTrigger(hour=4, minute=0, timezone="UTC"),
            id="daily_pipeline_sync",
            name="Synchronisation quotidienne du marché (App Store & Google Play)",
            replace_existing=True
        )
        scheduler.start()
        logger.info("✓ Scheduler APScheduler démarré (Job quotidien planifié à 04:00 UTC).")

def stop_scheduler():
    """Arrête proprement l'ordonnanceur."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler arrêté.")
