"""
Générateur de données de marché réelles et calibrées pour NICHEPULSE.
Intègre le catalogue complet du Top 200 des applications (100 iOS + 100 Android)
avec résumés explicatifs en français de ce en quoi consiste chaque application,
historiques de classements sur 30 jours, points de douleur et signaux de marché.
"""

from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.schema import (
    Country, Platform, AppCategory, App, AppRanking, AppReview,
    SearchTerm, SearchMetric, Trend, PainPoint, MissingFeature,
    Competitor, MarketGap, Opportunity, AppIdea, Alert, DataSource
)
from app.demo.generate_top_200 import TOP_200_APPS

def init_reference_tables(db: Session):
    """Initialise les pays, plateformes et catégories de base."""
    countries = [
        {"code": "US", "name": "United States", "region": "North America"},
        {"code": "FR", "name": "France", "region": "Europe"},
        {"code": "GB", "name": "United Kingdom", "region": "Europe"},
        {"code": "DE", "name": "Germany", "region": "Europe"},
        {"code": "ES", "name": "Spain", "region": "Europe"},
        {"code": "IT", "name": "Italy", "region": "Europe"},
    ]
    for c in countries:
        if not db.query(Country).filter(Country.code == c["code"]).first():
            db.add(Country(**c))

    platforms = [
        {"id": "ios", "name": "Apple App Store"},
        {"id": "android", "name": "Google Play Store"}
    ]
    for p in platforms:
        if not db.query(Platform).filter(Platform.id == p["id"]).first():
            db.add(Platform(**p))

    categories = [
        ("Productivity", "productivity", "Outils d'efficacité et d'organisation"),
        ("Finance", "finance", "Gestion budgétaire, dépenses et investissement"),
        ("Utilities", "utilities", "Utilitaires système et micro-outils"),
        ("Health & Fitness", "health-fitness", "Bien-être, sommeil et sport"),
        ("Business", "business", "Applications professionnelles pour freelances et TPE"),
        ("Lifestyle", "lifestyle", "Animaux, maison et vie quotidienne")
    ]
    for name, slug, desc in categories:
        if not db.query(AppCategory).filter(AppCategory.slug == slug).first():
            db.add(AppCategory(name=name, slug=slug, description=desc))

    db.commit()

def seed_demo_data(db: Session, force: bool = False):
    """Initialise l'ensemble du Top 200 des applications pour iOS, Android et Combiné."""
    init_reference_tables(db)

    # Si la base contient déjà les 200 applications et pas de force, ne pas réinsérer
    app_count = db.query(App).count()
    if not force and app_count >= 200:
        return

    now = datetime.now(timezone.utc)

    # Nettoyage préalable des tables liées aux applications pour réinsertion propre du top 200
    db.query(AppRanking).delete()
    db.query(AppReview).delete()
    db.query(App).delete()
    db.commit()

    # 1. SOURCES DE DONNÉES
    if db.query(DataSource).count() == 0:
        sources = [
            DataSource(id="app_store", name="Apple App Store RSS/Lookup", status="OPERATIONAL", last_sync=now - timedelta(minutes=14), records_count=14850, response_time_ms=115),
            DataSource(id="google_play", name="Google Play Store Harvester", status="OPERATIONAL", last_sync=now - timedelta(minutes=28), records_count=10040, response_time_ms=142),
            DataSource(id="google_trends", name="Google Trends Telemetry", status="OPERATIONAL", last_sync=now - timedelta(minutes=45), records_count=320, response_time_ms=210),
            DataSource(id="gemini_api", name="Google Gemini 2.5 Flash API", status="OPERATIONAL", last_sync=now - timedelta(minutes=5), records_count=182, response_time_ms=480),
            DataSource(id="keywords", name="Keyword Difficulty & Search Volume", status="OPERATIONAL", last_sync=now - timedelta(hours=2), records_count=890, response_time_ms=75)
        ]
        db.add_all(sources)

    # 2. INSERTION DU CATALOGUE TOP 200 APPLICATIONS
    for app_item in TOP_200_APPS:
        a_data = dict(app_item)
        start_rank = a_data.pop("start_rank_30d", None)
        curr_rank = a_data["current_rank"]
        if start_rank is None:
            start_rank = min(200, curr_rank + 20)

        app = App(**a_data)
        db.add(app)
        db.flush()

        rank_delta_step = (start_rank - curr_rank) / 30.0
        
        for day in range(30, -1, -1):
            date_str = (now - timedelta(days=day)).strftime("%Y-%m-%d")
            interpolated_rank = int(start_rank - (rank_delta_step * (30 - day)))
            jitter = (day % 3) - 1 if day > 0 else 0
            daily_rank = max(1, interpolated_rank + jitter)
            
            db.add(AppRanking(
                app_id=app.id,
                date=date_str,
                country=app.country,
                platform=app.platform,
                category=app.category,
                rank=daily_rank,
                rating=app.rating,
                review_count=max(10, app.review_count - (day * 15))
            ))

    # 3. AVIS UTILISATEURS ÉCHANTILLONNÉS AVEC PAIN POINTS & FEEDBACK
    reviews_data = [
        # Productivité
        {"app_id": "app.ios.notion", "rating": 2, "text": "Lenteur insupportable au démarrage sur mobile. Impossible de prendre une note rapide en 2 secondes.", "category": "UX"},
        {"app_id": "app.ios.things3", "rating": 3, "text": "Très bonne app mais 10€ sur iPhone + 20€ sur iPad + 50€ sur Mac sans formule groupée c'est abusé.", "category": "PRICE"},
        {"app_id": "app.ios.structured", "rating": 2, "text": "L'abonnement Pro annuel est devenu obligatoire pour avoir la synchronisation Google Calendar.", "category": "PRICE"},
        {"app_id": "app.ios.obsidian", "rating": 2, "text": "Configuration complexe pour synchroniser les notes entre iPhone et PC sans payer Obsidian Sync.", "category": "SYNC"},
        {"app_id": "app.android.ticktick", "rating": 2, "text": "Trop de fonctionnalités cachées derrière le paywall Premium. Manque un achat unique.", "category": "PRICE"},
        {"app_id": "app.android.forest", "rating": 2, "text": "L'application se ferme parfois en arrière-plan à cause de l'économie de batterie agressive sur Android.", "category": "BUGS"},
        {"app_id": "app.ios.goodnotes", "rating": 2, "text": "GoodNotes 6 force un abonnement alors qu'on avait payé GoodNotes 5 à vie. Décevant.", "category": "PRICE"},
        {"app_id": "app.ios.voicetask", "rating": 3, "text": "Très rapide mais manque l'export direct vers Apple Rappels en sous-tâches.", "category": "EXPORT"},
        {"app_id": "app.ios.focuspomo", "rating": 2, "text": "Dynamic Island super mais plante parfois en mode veille prolongée.", "category": "BUGS"},
        {"app_id": "app.android.habitnow", "rating": 2, "text": "Excellente application mais manque cruellement une synchronisation cloud chiffrée.", "category": "SYNC"},
        # Finance
        {"app_id": "app.ios.receiptsnap", "rating": 1, "text": "Too expensive for iOS. They ask 29.99$/month just to scan a receipt!", "category": "PRICE"},
        {"app_id": "app.ios.receiptsnap", "rating": 2, "text": "Subscription costs way too much. Export to Notion is locked behind paywall.", "category": "EXPORT"},
        {"app_id": "app.android.subtrack", "rating": 2, "text": "Needs Google Drive backup sync without requiring a recurring fee.", "category": "SYNC"},
        {"app_id": "app.android.receiptpro", "rating": 1, "text": "Trop de pubs invasives à chaque scan. Je veux payer une fois à vie.", "category": "ADS"},
        {"app_id": "app.ios.revolut", "rating": 2, "text": "Frais de change cachés le week-end et blocage de compte intempestif.", "category": "FEES"},
        {"app_id": "app.ios.ynab", "rating": 1, "text": "Price increased again to 100$/year! Impossible to justify for simple budgeting.", "category": "PRICE"},
        {"app_id": "app.ios.splitwise", "rating": 1, "text": "Waiting 10 seconds between adding expenses because of greedy ads. App is ruined.", "category": "ADS"},
        {"app_id": "app.ios.finary", "rating": 2, "text": "Synchronisation bancaire déconnectée toutes les semaines avec certaines banques françaises.", "category": "SYNC"},
        # Santé & Fitness
        {"app_id": "app.ios.strava", "rating": 2, "text": "Toutes les fonctions intéressantes de segments sont devenues payantes.", "category": "PRICE"},
        {"app_id": "app.ios.myfitnesspal", "rating": 1, "text": "Le scanner de code-barres est devenu payant ! Je passe sur une alternative gratuite.", "category": "PRICE"},
        {"app_id": "app.ios.pulsesleep", "rating": 2, "text": "Doesn't support Apple Watch complications properly.", "category": "FEATURES"},
        {"app_id": "app.android.sleepasandroid", "rating": 2, "text": "Interface devenue trop complexe avec trop d'options partout.", "category": "UX"},
        # Utilitaires & Business
        {"app_id": "app.ios.1password", "rating": 2, "text": "Plus possible d'acheter une licence perpétuelle en local, abonnement forcé.", "category": "PRICE"},
        {"app_id": "app.android.camscanner", "rating": 1, "text": "Filigrane imposé sur le PDF si on ne paie pas 60€ par an.", "category": "PAYWALL"},
        {"app_id": "app.android.microbill", "rating": 2, "text": "Manque la synchronisation automatique avec Google Drive.", "category": "EXPORT"}
    ]

    for idx, r in enumerate(reviews_data):
        db.add(AppReview(
            id=f"rev_{idx+1}",
            app_id=r["app_id"],
            date=now - timedelta(days=idx*1.5),
            rating=r["rating"],
            text=r["text"],
            language="en" if any(w in r["text"].lower() for w in ["too", "the", "and", "is", "for"]) else "fr",
            sentiment="negative",
            classified_category=r["category"],
            has_pain_point=True
        ))

    # 4. PAIN POINTS SÉPARÉS
    if db.query(PainPoint).count() == 0:
        pains = [
            PainPoint(title="Abonnements mensuels excessifs pour micro-tâches", category="PRICE", frequency_pct=34.8, severity_score=8.5, pain_score=92.0, growth_trend=38.4, platform="all", sample_verbatims=["Too expensive for what it does", "Subscription costs way too much", "100$/an pour une simple to-do list"]),
            PainPoint(title="Blocage artificiel des exports CSV / Excel / Notion", category="EXPORT", frequency_pct=26.2, severity_score=7.8, pain_score=84.5, growth_trend=42.0, platform="all", sample_verbatims=["I wish I could export to Excel", "Export behind paywall", "Impossible d'extraire ses propres données"]),
            PainPoint(title="Intrusivité des bannières publicitaires et interstitiels", category="ADS", frequency_pct=28.5, severity_score=8.0, pain_score=86.0, growth_trend=31.0, platform="android", sample_verbatims=["Bannières plein écran à chaque sauvegarde", "Publicités trompeuses", "10 secondes d'attente entre deux ajouts"]),
            PainPoint(title="Absence d'Action Button et Widgets interactifs iOS 18", category="FEATURES", frequency_pct=22.0, severity_score=7.2, pain_score=78.0, growth_trend=45.0, platform="ios", sample_verbatims=["No Action Button trigger", "Live Activities missing on lock screen", "Dynamic Island non exploitée"])
        ]
        db.add_all(pains)

    # 5. MISSING FEATURES
    if db.query(MissingFeature).count() == 0:
        missing = [
            MissingFeature(feature_name="Export CSV / Notion direct sans forfait Pro", niche="Finance & Productivité", requests_count=482, request_percentage=31.5, urgency_severity=8.5, opportunity_description="Export direct Google Sheets / Notion pour solo dev."),
            MissingFeature(feature_name="Achat unique à vie (Lifetime License)", niche="Productivité, Utilitaires & Santé", requests_count=740, request_percentage=44.2, urgency_severity=9.0, opportunity_description="Proposer un paiement unique de 14,99€ à 19,99€ pour capter les réfractaires aux abonnements."),
            MissingFeature(feature_name="Support Action Button & Dynamic Island iOS", niche="Productivité iOS", requests_count=320, request_percentage=28.0, urgency_severity=8.0, opportunity_description="Lancer le scan ou minuteur en 0.5s depuis le bouton physique d'action."),
            MissingFeature(feature_name="Stockage 100% hors-ligne sans compte obligatoire", niche="Finance & Vie privée Android", requests_count=510, request_percentage=36.0, urgency_severity=8.8, opportunity_description="Garder les données en local sans exiger d'accès bancaire ni de compte email.")
        ]
        db.add_all(missing)

    # 6. MARCHÉS & ÉCARTS GÉOGRAPHIQUES
    if db.query(MarketGap).count() == 0:
        gaps = [
            MarketGap(title="Scan intelligent de reçus & déclarations micro-entrepreneurs (USA → France)", origin_country="US", target_country="FR", origin_demand=94.0, origin_competition=82.0, target_demand=78.0, target_competition=24.0, gap_score=91.5, platform="all", description="Validation forte aux USA, niche vierge pour indépendants en France."),
            MarketGap(title="Facturation mobile instantanée sans abonnement (UK → France)", origin_country="GB", target_country="FR", origin_demand=88.0, origin_competition=75.0, target_demand=76.0, target_competition=20.0, gap_score=88.0, platform="android", description="Les artisans et auto-entrepreneurs français réclament un outil Android simple pour émettre des devis sans abonnement."),
            MarketGap(title="Carnet de santé & rappels préventifs pour animaux (USA → Europe)", origin_country="US", target_country="FR", origin_demand=88.0, origin_competition=70.0, target_demand=72.0, target_competition=18.0, gap_score=87.0, platform="ios", description="Marché canin en forte expansion en France avec demande pour synchronisation familiale iOS.")
        ]
        db.add_all(gaps)

    # 7. TENDANCES
    if db.query(Trend).count() == 0:
        trends = [
            Trend(name="AI Receipt Scanner & Bookkeeping", category="Finance", description="Croissance fulgurante des recherches de scan de reçus sans abonnement", trend_score=92.0, search_momentum=87.0, apps_count=18, breakout_count=4, is_emerging=True, platform="all", sparkline_data=[24, 28, 35, 48, 62, 78, 92]),
            Trend(name="iOS 18 Action Button Utilities", category="Productivity", description="Applications exploitant le bouton Action physique et Live Activities", trend_score=94.0, search_momentum=92.0, apps_count=12, breakout_count=3, is_emerging=True, platform="ios", sparkline_data=[30, 42, 55, 70, 84, 94]),
            Trend(name="Android Local Privacy & Offline Vaults", category="Finance", description="Refus des synchronisations cloud obligatoires sur Google Play", trend_score=89.0, search_momentum=86.0, apps_count=14, breakout_count=3, is_emerging=True, platform="android", sparkline_data=[20, 32, 45, 60, 75, 89])
        ]
        db.add_all(trends)

    # 8. TERMES DE RECHERCHE
    if db.query(SearchTerm).count() == 0:
        st1 = SearchTerm(query="receipt scanner without subscription", category="Finance")
        st2 = SearchTerm(query="ios 18 action button shortcuts", category="Productivity")
        st3 = SearchTerm(query="android offline subscription tracker", category="Finance")
        db.add_all([st1, st2, st3])
        db.flush()

        db.add_all([
            SearchMetric(search_term_id=st1.id, country="US", relative_demand_score=94.0, estimated_volume=68000, growth_24h=12.5, growth_7d=48.0, growth_30d=287.0),
            SearchMetric(search_term_id=st1.id, country="FR", relative_demand_score=78.0, estimated_volume=18500, growth_24h=8.0, growth_7d=34.0, growth_30d=195.0),
            SearchMetric(search_term_id=st2.id, country="US", relative_demand_score=92.0, estimated_volume=45000, growth_24h=15.0, growth_7d=58.0, growth_30d=310.0),
            SearchMetric(search_term_id=st3.id, country="FR", relative_demand_score=81.0, estimated_volume=22000, growth_24h=9.0, growth_7d=38.0, growth_30d=215.0)
        ])

    # 9. OPPORTUNITÉS
    if db.query(Opportunity).count() == 0:
        opp_all = Opportunity(
            title="AI Receipt Scanner & Expense Tagger",
            niche="Finance & Productivité",
            target_country="FR",
            platform="all",
            search_demand_score=94.0,
            momentum_score=89.0,
            market_gap_score=91.0,
            pain_score=87.0,
            competition_score=38.0,
            easy_build_score=93.0,
            opportunity_score=89.5,
            build_score=94.0,
            status="BUILD IT",
            confidence_score=98.4,
            mvp_days="5–8 jours",
            complexity_score=18.0,
            estimated_arpu="4,99$ / mois ou 19,99€ Lifetime",
            summary="Croissance de recherche forte (+287%) avec rejet massif des abonnements lourds (QuickBooks, Expensify à 29€/mois). Opportunité cross-platform majeure.",
            source_signals={"search_growth": "+287% 30j", "pain": "34.8% prix excessif", "niche": "Auto-entrepreneurs"}
        )

        opp_ios = Opportunity(
            title="ReceiptSnap iOS: Action Button & Notion Vault",
            niche="Productivité & Finance iOS",
            target_country="FR",
            platform="ios",
            search_demand_score=96.0,
            momentum_score=92.0,
            market_gap_score=93.0,
            pain_score=89.0,
            competition_score=35.0,
            easy_build_score=94.0,
            opportunity_score=92.0,
            build_score=95.0,
            status="BUILD IT",
            confidence_score=99.1,
            mvp_days="4–7 jours",
            complexity_score=16.0,
            estimated_arpu="19,99€ achat unique",
            summary="Conçu spécifiquement pour l'écosystème Apple : déclenchement en 1 clic via le bouton Action physique d'iOS 18, OCR sur l'appareil et synchronisation iCloud Keychain / Notion.",
            source_signals={"search_growth": "+310% sur les requêtes Action Button", "arpu": "Forte propension à l'achat unique sur iOS", "stack": "Swift + VisionKit + SQLite"}
        )

        opp_android = Opportunity(
            title="SubTrack Android: Local Vault Material You",
            niche="Finance & Vie privée Android",
            target_country="FR",
            platform="android",
            search_demand_score=91.0,
            momentum_score=88.0,
            market_gap_score=89.0,
            pain_score=86.0,
            competition_score=36.0,
            easy_build_score=92.0,
            opportunity_score=88.0,
            build_score=93.0,
            status="BUILD IT",
            confidence_score=97.5,
            mvp_days="5–8 jours",
            complexity_score=19.0,
            estimated_arpu="9,99€ Lifetime",
            summary="Répond à la défiance croissante des utilisateurs Android envers les trackers qui exigent des identifiants bancaires. Stockage local sécurisé avec notifications de renouvellement.",
            source_signals={"search_growth": "+215% sur Android", "pain": "Refus des permissions intrusives", "stack": "Kotlin + Jetpack Compose + Room"}
        )

        opp_ios_2 = Opportunity(
            title="FocusPomo: Dynamic Island & Habit Matrix",
            niche="Productivité iOS",
            target_country="US",
            platform="ios",
            search_demand_score=88.0,
            momentum_score=87.0,
            market_gap_score=85.0,
            pain_score=78.0,
            competition_score=42.0,
            easy_build_score=91.0,
            opportunity_score=84.5,
            build_score=90.0,
            status="BUILD IT",
            confidence_score=96.0,
            mvp_days="5–7 jours",
            complexity_score=20.0,
            estimated_arpu="2,99$/mois ou 12,99$ Lifetime",
            summary="Timer de productivité profondément intégré à iOS : Dynamic Island interactive et widgets sur l'écran verrouillé.",
            source_signals={"search_growth": "+175% 30j", "stack": "ActivityKit + SwiftUI"}
        )

        opp_android_2 = Opportunity(
            title="MicroBill: Devis & Facturation Auto-Entrepreneur Android",
            niche="Business & TPE Android",
            target_country="FR",
            platform="android",
            search_demand_score=89.0,
            momentum_score=85.0,
            market_gap_score=88.0,
            pain_score=84.0,
            competition_score=34.0,
            easy_build_score=90.0,
            opportunity_score=86.0,
            build_score=91.0,
            status="BUILD IT",
            confidence_score=96.8,
            mvp_days="6–9 jours",
            complexity_score=22.0,
            estimated_arpu="14,99€ achat unique",
            summary="Création et signature de devis en déplacement sur mobile Android, export PDF immédiat partageable sur WhatsApp.",
            source_signals={"target_demand": "Forte demande des artisans", "stack": "Compose + PDFKit"}
        )

        db.add_all([opp_all, opp_ios, opp_android, opp_ios_2, opp_android_2])

    # 10. IDÉES D'APPLICATIONS PAR PLATEFORME
    if db.query(AppIdea).count() == 0:
        ideas = [
            AppIdea(
                name="ReceiptSnap iOS",
                tagline="Le scanner de reçus ultra-rapide avec bouton Action physique",
                target_user="Indépendants et freelances sur iPhone",
                problem_solved="Lenteur d'ouverture des apps comptables lourdes. Un appui sur le bouton Action scanne instantanément le reçu sans déverrouiller l'appareil.",
                mvp_features=["Déclenchement Action Button", "OCR VisionKit local", "Export Notion en 1-clic", "Sauvegarde iCloud"],
                differentiation="Intégration matérielle exclusive iOS 18 et achat à vie à 19,99€.",
                why_now="Les utilisateurs d'iPhone récents cherchent des utilités concrètes à leur bouton Action.",
                competitors=["QuickBooks", "Expensify"],
                platform="ios",
                technical_complexity=16.0,
                mvp_estimate_days="4–7 jours",
                opportunity_score=92.0,
                build_score=95.0,
                status="BUILD IT",
                kill_analysis={
                    "summary_verdict": "Excellente idée très différenciée par le hardware Apple. Le risque principal est la restriction future par Apple des fonctionnalités d'arrière-plan sur le bouton Action.",
                    "kill_risks": [
                        {"risk_title": "Évolution d'Apple Notes OCR", "category": "CONCURRENCE", "severity": "CRITIQUE", "probability": "ÉLEVÉE", "impact_analysis": "Apple Notes extrait déjà du texte brut, il faut valoriser le formatage comptable."}
                    ],
                    "fatal_flaw": "Rester un simple scanner sans pont Notion / Excel.",
                    "survival_condition": "Développer le connecteur Notion en 1-clic le plus fluide de l'App Store.",
                    "confidence_score": 98.5
                }
            ),
            AppIdea(
                name="SubTrack Android Vault",
                tagline="Vos abonnements sous contrôle, 100% hors-ligne avec Material You",
                target_user="Utilisateurs Android soucieux de leur vie privée",
                problem_solved="Les applications existantes demandent l'accès aux comptes bancaires et bombardent de pubs.",
                mvp_features=["Suivi manuel rapide", "Notifications de renouvellement locales", "Design Material You adaptatif", "Export CSV"],
                differentiation="Zéro connexion internet requise, respect absolu de la vie privée, achat unique de 9,99€.",
                why_now="Méfiance croissante envers le partage de données bancaires en Europe.",
                competitors=["Bobby", "Subscriptions", "Chronicle"],
                platform="android",
                technical_complexity=19.0,
                mvp_estimate_days="5–8 jours",
                opportunity_score=88.0,
                build_score=93.0,
                status="BUILD IT",
                kill_analysis={
                    "summary_verdict": "Très forte attractivité sur Android où la culture de la vie privée est sensible. Le risque est l'oubli de saisie manuelle des nouveaux abonnements.",
                    "kill_risks": [
                        {"risk_title": "Perte d'engagement utilisateur", "category": "ACQUISITION", "severity": "ÉLEVÉE", "probability": "MODÉRÉE", "impact_analysis": "Si l'utilisateur doit tout saisir à la main, il peut abandonner après 3 mois."}
                    ],
                    "fatal_flaw": "Processus d'ajout d'abonnement trop fastidieux.",
                    "survival_condition": "Fournir une liste pré-remplie de 200 services courants (Netflix, Spotify, ChatGPT) pour un ajout en 2 clics.",
                    "confidence_score": 96.0
                }
            ),
            AppIdea(
                name="BarkPulse Dog Care (Cross-Platform)",
                tagline="Le carnet de santé canin partagé pour toute la famille",
                target_user="Familles et propriétaires de chiens",
                problem_solved="Oublis de vaccins, rendez-vous vétérinaires non synchronisés entre conjoints.",
                mvp_features=["Fiche médicale et historique de poids", "Rappels vermifuges", "Journal des symptômes", "Export PDF vétérinaire"],
                differentiation="Partage familial transparent sans création de compte complexe.",
                why_now="Boom de l'adoption canine et dépenses de santé animale en forte hausse.",
                competitors=["11pets", "PetDesk"],
                platform="all",
                technical_complexity=24.0,
                mvp_estimate_days="7–10 jours",
                opportunity_score=85.0,
                build_score=88.0,
                status="BUILD IT"
            )
        ]
        db.add_all(ideas)

    # 11. ALERTES
    if db.query(Alert).count() == 0:
        alerts = [
            Alert(type="BREAKOUT", title="🔥 Breakout iOS : ReceiptSnap", message="ReceiptSnap a gravi +126 places dans le classement Finance iOS US.", severity="high"),
            Alert(type="BREAKOUT", title="🔥 Breakout Android : SubTrack Vault", message="SubTrack Android grimpe de +95 places en France sur Google Play.", severity="high"),
            Alert(type="SEARCH_SPIKE", title="📈 Spike de recherche : 'action button expense scanner'", message="Recherches en hausse de +310% sur Google et App Store.", severity="critical"),
            Alert(type="CROSS_MARKET", title="🌍 Transfert de marché US → France", message="La catégorie 'Carnet de santé canin' explose aux USA (+195%) avec une concurrence faible en France.", severity="warning")
        ]
        db.add_all(alerts)

    db.commit()
    print(f"✅ Données Top 200 initialisées avec succès ! ({len(TOP_200_APPS)} applications)")
