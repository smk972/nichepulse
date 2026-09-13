import os
from typing import Dict, List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "NICHEPULSE"
    VERSION: str = "3.4.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Database
    DATABASE_URL: str = Field(default="sqlite:///./nichepulse.db")
    GEMINI_API_KEY: str = Field(default="")
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Mode
    DEFAULT_DATA_MODE: str = "DEMO"  # "DEMO" or "REAL"
    
    # Geo scope (US + EU first, expandable)
    SUPPORTED_COUNTRIES: List[str] = ["US", "FR", "GB", "DE", "ES", "IT"]
    EXPANDABLE_COUNTRIES: List[str] = ["CA", "AU", "BE", "CH", "NL"]
    
    # Platforms
    SUPPORTED_PLATFORMS: List[str] = ["ios", "android"]
    
    # App Categories
    SUPPORTED_CATEGORIES: List[str] = [
        "Productivity", "Finance", "Utilities", "Health & Fitness", 
        "Education", "Business", "Lifestyle", "Photo & Video"
    ]
    
    # Classification Thresholds (Cahier des charges #25)
    BUILD_IT_THRESHOLD: float = 80.0
    INVESTIGATE_THRESHOLD: float = 60.0
    
    # Opportunity Score Weights (Cahier des charges #23)
    # 25% Search Demand, 20% Momentum, 15% Market Gap, 15% Pain Score, 15% Competition, 10% Emerging Trend
    OPP_WEIGHT_SEARCH_DEMAND: float = 0.25
    OPP_WEIGHT_MOMENTUM: float = 0.20
    OPP_WEIGHT_MARKET_GAP: float = 0.15
    OPP_WEIGHT_PAIN: float = 0.15
    OPP_WEIGHT_COMPETITION: float = 0.15
    OPP_WEIGHT_EMERGING_TREND: float = 0.10
    
    # Final Build Score Weights (Cahier des charges #24)
    # 30% Opportunity Score, 20% Easy Build Score, 15% Market Gap, 15% Search Demand, 10% Pain Score, 10% Competition
    BUILD_WEIGHT_OPPORTUNITY: float = 0.30
    BUILD_WEIGHT_EASY_BUILD: float = 0.20
    BUILD_WEIGHT_MARKET_GAP: float = 0.15
    BUILD_WEIGHT_SEARCH_DEMAND: float = 0.15
    BUILD_WEIGHT_PAIN: float = 0.10
    BUILD_WEIGHT_COMPETITION: float = 0.10
    
    # Pipeline & Collection frequency
    COLLECTION_INTERVAL_HOURS: int = 24
    MAX_REVIEWS_TO_ANALYZE: int = 150
    EMBEDDING_CACHE_TTL_DAYS: int = 30
    
    model_config = {"env_file": ".env", "extra": "ignore"}

settings = Settings()
