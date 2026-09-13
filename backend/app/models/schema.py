from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

# 1. Countries
class Country(Base):
    __tablename__ = "countries"
    code = Column(String(2), primary_key=True)  # e.g. "US", "FR"
    name = Column(String(100), nullable=False)
    region = Column(String(50), default="Global")
    active = Column(Boolean, default=True)

# 2. Platforms
class Platform(Base):
    __tablename__ = "platforms"
    id = Column(String(20), primary_key=True)  # "ios", "android"
    name = Column(String(50), nullable=False)
    active = Column(Boolean, default=True)

# 3. Categories
class AppCategory(Base):
    __tablename__ = "app_categories"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)

# 4. Apps
class App(Base):
    __tablename__ = "apps"
    id = Column(String(100), primary_key=True)  # e.g. "com.example.app" or store ID
    bundle_id = Column(String(255), index=True, nullable=False)
    platform = Column(String(20), ForeignKey("platforms.id"), nullable=False)
    country = Column(String(2), ForeignKey("countries.code"), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    developer = Column(String(255), nullable=False)
    icon_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    price = Column(Float, default=0.0)
    has_in_app_purchases = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    current_rank = Column(Integer, nullable=True, index=True)
    is_breakout = Column(Boolean, default=False, index=True)
    is_new = Column(Boolean, default=False, index=True)
    is_demo = Column(Boolean, default=False, index=True)
    downloads_count = Column(Integer, default=50000)
    downloads_growth = Column(String(50), default="+18.5% ce mois")
    downloads_growth_weekly = Column(Integer, default=4500)
    subscription_price = Column(String(100), default="4,99 €/mois")
    company_name = Column(String(255), nullable=True)
    company_country = Column(String(50), default="US")
    company_type = Column(String(100), default="Studio Indépendant")
    release_date = Column(String(20), nullable=True)
    functional_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    rankings = relationship("AppRanking", back_populates="app", cascade="all, delete-orphan")
    reviews = relationship("AppReview", back_populates="app", cascade="all, delete-orphan")
    features = relationship("AppFeature", back_populates="app", cascade="all, delete-orphan")

# 5. App Rankings (Historique quotidien - Cahier des charges #6)
class AppRanking(Base):
    __tablename__ = "app_rankings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    app_id = Column(String(100), ForeignKey("apps.id"), nullable=False, index=True)
    date = Column(String(10), nullable=False, index=True)  # "YYYY-MM-DD"
    country = Column(String(2), nullable=False)
    platform = Column(String(20), nullable=False)
    category = Column(String(100), nullable=False)
    rank = Column(Integer, nullable=False)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

    app = relationship("App", back_populates="rankings")
    __table_args__ = (Index("ix_app_rank_date", "app_id", "date"),)

# 6. App Reviews (Avis utilisateurs)
class AppReview(Base):
    __tablename__ = "app_reviews"
    id = Column(String(100), primary_key=True)
    app_id = Column(String(100), ForeignKey("apps.id"), nullable=False, index=True)
    date = Column(DateTime, nullable=False)
    rating = Column(Integer, nullable=False)
    title = Column(String(255), nullable=True)
    text = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    sentiment = Column(String(20), default="neutral")  # positive, negative, neutral
    classified_category = Column(String(50), nullable=True, index=True)  # ex: PRICE, UX, BUGS...
    has_pain_point = Column(Boolean, default=False)
    has_missing_feature = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    app = relationship("App", back_populates="reviews")
    embedding = relationship("AppReviewEmbedding", back_populates="review", uselist=False)

# 7. App Review Embeddings (Cahier des charges #11 - pgvector / vector store)
class AppReviewEmbedding(Base):
    __tablename__ = "app_review_embeddings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    review_id = Column(String(100), ForeignKey("app_reviews.id"), unique=True, nullable=False)
    vector = Column(JSON, nullable=False)  # JSON representation of float vector for SQLite / pgvector
    model = Column(String(50), default="text-embedding-004")
    cluster_id = Column(Integer, nullable=True, index=True)
    created_at = Column(DateTime, default=utc_now)

    review = relationship("AppReview", back_populates="embedding")

# 8. App Features
class AppFeature(Base):
    __tablename__ = "app_features"
    id = Column(Integer, primary_key=True, autoincrement=True)
    app_id = Column(String(100), ForeignKey("apps.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_core = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    app = relationship("App", back_populates="features")

# 9. Search Terms & Trends
class SearchTerm(Base):
    __tablename__ = "search_terms"
    id = Column(Integer, primary_key=True, autoincrement=True)
    query = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utc_now)

# 10. Search Metrics
class SearchMetric(Base):
    __tablename__ = "search_metrics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    search_term_id = Column(Integer, ForeignKey("search_terms.id"), nullable=False, index=True)
    country = Column(String(2), nullable=False)
    relative_demand_score = Column(Float, default=0.0)  # 0 to 100
    estimated_volume = Column(Integer, default=0)
    growth_24h = Column(Float, default=0.0)
    growth_7d = Column(Float, default=0.0)
    growth_30d = Column(Float, default=0.0)
    recorded_at = Column(DateTime, default=utc_now)

# 11. Trends
class Trend(Base):
    __tablename__ = "trends"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    trend_score = Column(Float, default=0.0)
    search_momentum = Column(Float, default=0.0)
    apps_count = Column(Integer, default=0)
    breakout_count = Column(Integer, default=0)
    is_emerging = Column(Boolean, default=False)
    platform = Column(String(20), default="all", index=True)  # "ios", "android", or "all"
    sparkline_data = Column(JSON, default=list)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

# 12. Pain Points (Radar des problèmes)
class PainPoint(Base):
    __tablename__ = "pain_points"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)  # PRICE, ADS, UX, etc.
    frequency_pct = Column(Float, default=0.0)
    severity_score = Column(Float, default=0.0)  # 1 to 10
    pain_score = Column(Float, default=0.0)      # 0 to 100
    growth_trend = Column(Float, default=0.0)
    platform = Column(String(20), default="all", index=True)  # "ios", "android", or "all"
    affected_apps = Column(JSON, default=list)   # list of app IDs or names
    sample_verbatims = Column(JSON, default=list)
    confidence = Column(Float, default=95.0)
    created_at = Column(DateTime, default=utc_now)

# 13. Missing Features
class MissingFeature(Base):
    __tablename__ = "missing_features"
    id = Column(Integer, primary_key=True, autoincrement=True)
    feature_name = Column(String(255), nullable=False)
    niche = Column(String(100), nullable=False)
    requests_count = Column(Integer, default=0)
    request_percentage = Column(Float, default=0.0)
    urgency_severity = Column(Float, default=0.0)
    affected_apps = Column(JSON, default=list)
    opportunity_description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

# 14. Competitors
class Competitor(Base):
    __tablename__ = "competitors"
    id = Column(Integer, primary_key=True, autoincrement=True)
    niche = Column(String(100), nullable=False, index=True)
    app_name = Column(String(255), nullable=False)
    market_share_pct = Column(Float, default=0.0)
    rating = Column(Float, default=0.0)
    pricing_model = Column(String(50), default="Subscription")
    weaknesses = Column(JSON, default=list)
    created_at = Column(DateTime, default=utc_now)

# 15. Market Gaps (Écarts géographiques / sous-exploitation)
class MarketGap(Base):
    __tablename__ = "market_gaps"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    origin_country = Column(String(2), default="US")
    target_country = Column(String(2), default="FR")
    origin_demand = Column(Float, default=0.0)
    origin_competition = Column(Float, default=0.0)
    target_demand = Column(Float, default=0.0)
    target_competition = Column(Float, default=0.0)
    gap_score = Column(Float, default=0.0)  # 0 to 100
    platform = Column(String(20), default="all", index=True)  # "ios", "android", or "all"
    description = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

# 16. Opportunities
class Opportunity(Base):
    __tablename__ = "opportunities"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    niche = Column(String(100), nullable=False)
    target_country = Column(String(2), default="FR")
    platform = Column(String(20), default="all", index=True)  # "ios", "android", or "all"
    search_demand_score = Column(Float, default=0.0)
    momentum_score = Column(Float, default=0.0)
    market_gap_score = Column(Float, default=0.0)
    pain_score = Column(Float, default=0.0)
    competition_score = Column(Float, default=0.0)
    easy_build_score = Column(Float, default=0.0)
    opportunity_score = Column(Float, default=0.0)
    build_score = Column(Float, default=0.0)  # Most critical score
    status = Column(String(20), default="INVESTIGATE")  # "BUILD IT", "INVESTIGATE", "AVOID"
    confidence_score = Column(Float, default=95.0)
    mvp_days = Column(String(20), default="5–8 jours")
    complexity_score = Column(Float, default=20.0)
    estimated_arpu = Column(String(50), default="4.99$/mois")
    summary = Column(Text, nullable=False)
    source_signals = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

# 17. App Ideas
class AppIdea(Base):
    __tablename__ = "app_ideas"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    tagline = Column(String(255), nullable=True)
    target_user = Column(String(255), nullable=False)
    problem_solved = Column(Text, nullable=False)
    platform = Column(String(20), default="all", index=True)  # "ios", "android", or "all"
    mvp_features = Column(JSON, default=list)
    differentiation = Column(Text, nullable=False)
    why_now = Column(Text, nullable=False)
    competitors = Column(JSON, default=list)
    risks = Column(JSON, default=list)
    technical_complexity = Column(Float, default=20.0)
    mvp_estimate_days = Column(String(50), default="5–7 jours")
    opportunity_score = Column(Float, default=85.0)
    build_score = Column(Float, default=90.0)
    status = Column(String(20), default="BUILD IT")
    kill_analysis = Column(JSON, nullable=True)  # "Try to Kill the Idea" output
    is_bookmarked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

# 18. Idea Scores (Historique de notation et explicabilité)
class IdeaScore(Base):
    __tablename__ = "idea_scores"
    id = Column(Integer, primary_key=True, autoincrement=True)
    idea_id = Column(Integer, ForeignKey("app_ideas.id"), nullable=False)
    score_type = Column(String(50), nullable=False)  # "build_score", "easy_build", etc.
    value = Column(Float, nullable=False)
    calculation_details = Column(JSON, default=dict)  # Explication des facteurs
    recorded_at = Column(DateTime, default=utc_now)

# 19. Watchlists
class Watchlist(Base):
    __tablename__ = "watchlists"
    id = Column(Integer, primary_key=True, autoincrement=True)
    item_type = Column(String(50), nullable=False)  # "app", "niche", "keyword", "idea"
    item_id = Column(String(100), nullable=False)
    name = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    initial_metric = Column(Float, default=0.0)
    current_metric = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utc_now)

# 20. Alerts
class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String(50), nullable=False)  # "BREAKOUT", "SEARCH_SPIKE", "MARKET_GAP", "PAIN_SPIKE", "NEW_APP", "CROSS_MARKET"
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="info")  # "info", "warning", "high", "critical"
    metadata_json = Column(JSON, default=dict)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

# 21. Data Sources (Observabilité des collecteurs)
class DataSource(Base):
    __tablename__ = "data_sources"
    id = Column(String(50), primary_key=True)  # "app_store", "google_play", "google_trends", "gemini_api", "keywords"
    name = Column(String(100), nullable=False)
    status = Column(String(20), default="OPERATIONAL")  # "OPERATIONAL", "DEGRADED", "ERROR"
    last_sync = Column(DateTime, default=utc_now)
    records_count = Column(Integer, default=0)
    last_error = Column(Text, nullable=True)
    response_time_ms = Column(Integer, default=120)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

# 22. Analysis Runs (Versionnage des analyses IA & exécutions du pipeline)
class AnalysisRun(Base):
    __tablename__ = "analysis_runs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    run_type = Column(String(50), nullable=False)
    model = Column(String(50), default="gemini-2.5-flash")
    prompt_version = Column(String(20), default="v1.0")
    analysis_hash = Column(String(64), nullable=True)
    status = Column(String(20), default="COMPLETED")
    duration_seconds = Column(Float, default=0.0)
    records_processed = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
