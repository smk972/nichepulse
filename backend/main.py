import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.demo.seed_data import seed_demo_data

# Import des routeurs
from app.api.overview import router as overview_router
from app.api.apps import router as apps_router
from app.api.trends import router as trends_router
from app.api.breakouts import router as breakouts_router
from app.api.pains import router as pains_router
from app.api.markets import router as markets_router
from app.api.search import router as search_router
from app.api.opportunities import router as opportunities_router
from app.api.ideas import router as ideas_router
from app.api.watchlist import router as watchlist_router
from app.api.alerts import router as alerts_router
from app.api.sources import router as sources_router
from app.api.settings import router as settings_router
from app.api.new_launches import router as new_launches_router

# Création des tables
Base.metadata.create_all(bind=engine)

# Initialisation du jeu de données de démonstration si nécessaire
db = SessionLocal()
try:
    seed_demo_data(db)
finally:
    db.close()

app = FastAPI(
    title=f"{settings.PROJECT_NAME} - Market Intelligence Terminal API",
    version=settings.VERSION,
    description="Backend d'analyse quantitative et qualitative du marché d'applications mobiles."
)

# CORS pour autoriser Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des routes avec préfixe API v1
api_v1 = settings.API_V1_STR
app.include_router(overview_router, prefix=api_v1)
app.include_router(apps_router, prefix=api_v1)
app.include_router(trends_router, prefix=api_v1)
app.include_router(breakouts_router, prefix=api_v1)
app.include_router(pains_router, prefix=api_v1)
app.include_router(markets_router, prefix=api_v1)
app.include_router(search_router, prefix=api_v1)
app.include_router(opportunities_router, prefix=api_v1)
app.include_router(ideas_router, prefix=api_v1)
app.include_router(watchlist_router, prefix=api_v1)
app.include_router(alerts_router, prefix=api_v1)
app.include_router(sources_router, prefix=api_v1)
app.include_router(settings_router, prefix=api_v1)
app.include_router(new_launches_router, prefix=api_v1)

@app.get("/")
def root():
    return {
        "terminal": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "ok", "engine": "running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
