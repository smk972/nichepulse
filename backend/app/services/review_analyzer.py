"""
Pipeline d'analyse des avis utilisateurs (Cahier des charges #10, #11, #15, #16).
Pipeline :
AVIS -> détection langue -> normalisation -> suppression doublons -> sentiment
-> classification (15 catégories) -> clustering sémantique -> détection des pain points
-> détection des fonctionnalités manquantes -> opportunités.
"""

import re
import math
import numpy as np
from typing import List, Dict, Any, Tuple
from collections import defaultdict
from app.services.scoring import calculate_pain_score

# 15 Catégories strictes définies dans le cahier des charges #10
REVIEW_CATEGORIES = [
    "PRICE", "ADS", "UX", "PERFORMANCE", "BUGS", "FEATURES", 
    "PRIVACY", "SUPPORT", "ONBOARDING", "PAYMENT", "SYNC", 
    "EXPORT", "NOTIFICATIONS", "AI_QUALITY", "RELIABILITY"
]

CATEGORY_KEYWORDS = {
    "PRICE": ["expensive", "price", "cost", "subscription", "cher", "prix", "abonnement", "abzocke", "costly", "overpriced", "ripoff", "paywall"],
    "ADS": ["ads", "ad", "commercial", "publicité", "pub", "annoying ads", "pop up", "popups", "werbung"],
    "UX": ["confusing", "hard to use", "cluttered", "ugly", "ergonomie", "compliqué", "intuitif", "navigation", "interface", "unusable"],
    "PERFORMANCE": ["slow", "lag", "battery", "freeze", "lent", "batterie", "chauffe", "heavy", "drain"],
    "BUGS": ["crash", "bug", "error", "broken", "bloqué", "plante", "erreur", "ferme tout seul", "glitch"],
    "FEATURES": ["missing", "wish", "lack", "need", "feature", "manque", "aimerais", "fonctionnalité", "besoin", "add"],
    "PRIVACY": ["data", "privacy", "permission", "tracking", "espion", "données privées", "tracking", "vendre mes données"],
    "SUPPORT": ["support", "customer service", "no reply", "ignored", "sav", "réponse", "service client", "incompétent"],
    "ONBOARDING": ["tutorial", "onboarding", "how to", "getting started", "démarrage", "explications", "guide"],
    "PAYMENT": ["charge", "refund", "card", "billing", "prélèvement", "remboursement", "facturation", "carte"],
    "SYNC": ["sync", "cloud", "multiple devices", "synchro", "synchronisation", "ipad", "mac", "pc", "cross device"],
    "EXPORT": ["export", "csv", "pdf", "excel", "notion", "json", "télécharger", "exporter", "share file"],
    "NOTIFICATIONS": ["notifications", "spam", "reminder", "notif", "rappel", "alertes inutiles"],
    "AI_QUALITY": ["hallucination", "stupid ai", "ia mauvaise", "bad recognition", "faux", "inaccurate", "incorrect scan"],
    "RELIABILITY": ["offline", "no internet", "disconnected", "perte de données", "lost my data", "effacé", "fiabilité"]
}

def detect_language(text: str) -> str:
    """Détection basique et rapide de la langue (fr, en, de, es)."""
    text_lower = text.lower()
    fr_markers = [" le ", " la ", " les ", " un ", " une ", " et ", " est ", " pas ", " pour "]
    de_markers = [" der ", " die ", " das ", " und ", " ist ", " nicht ", " für "]
    es_markers = [" el ", " la ", " los ", " y ", " es ", " no ", " para "]
    
    if any(m in text_lower for m in fr_markers):
        return "fr"
    if any(m in de_markers for m in de_markers):
        return "de"
    if any(m in es_markers for m in es_markers):
        return "es"
    return "en"

def normalize_text(text: str) -> str:
    """Nettoyage et normalisation du texte."""
    t = text.lower().strip()
    t = re.sub(r'[^\w\s\'-]', ' ', t)
    t = re.sub(r'\s+', ' ', t)
    return t

def detect_sentiment(rating: int, text: str) -> str:
    """Attribution du sentiment basée sur la note et le contenu."""
    if rating <= 2:
        return "negative"
    elif rating == 3:
        return "neutral"
    else:
        # Note >= 4, mais vérification si l'utilisateur exprime un regret
        if any(w in text.lower() for w in ["but", "mais", "however", "except", "sauf"]):
            return "neutral"
        return "positive"

def classify_review(text: str) -> Tuple[str, float]:
    """Classifie le texte dans l'une des 15 catégories prédéfinies."""
    text_lower = text.lower()
    scores = {}
    
    for category, kw_list in CATEGORY_KEYWORDS.items():
        match_count = sum(1 for kw in kw_list if kw in text_lower)
        if match_count > 0:
            scores[category] = match_count

    if not scores:
        return "FEATURES", 0.5  # Fallback catégorie par défaut
    
    best_cat = max(scores, key=scores.get)
    confidence = min(0.95, 0.5 + (scores[best_cat] * 0.2))
    return best_cat, confidence

def extract_missing_features(reviews: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extrait les fonctionnalités manquantes demandées dans les avis (Cahier des charges #16).
    Exemples :
    - « I wish I could export to Excel »
    - « No family sharing »
    - « There is no dark mode »
    - « Can't sync with Google Calendar »
    """
    patterns = [
        r"(?:i wish (?:it had|i could|there was)|please add|needs|missing|no|can't|manque|aimerais avoir|pas de)\s+([a-zA-Z0-9\s]{4,35})",
        r"(?:should support|allow us to|why is there no)\s+([a-zA-Z0-9\s]{4,35})"
    ]

    candidate_counts = defaultdict(int)
    sample_verbatims = defaultdict(list)

    for r in reviews:
        txt = r.get("text", "")
        for pat in patterns:
            matches = re.findall(pat, txt, re.IGNORECASE)
            for m in matches:
                clean_feature = m.strip().capitalize()
                if len(clean_feature) > 5:
                    candidate_counts[clean_feature] += 1
                    if len(sample_verbatims[clean_feature]) < 3:
                        sample_verbatims[clean_feature].append(txt)

    results = []
    total_reviews = max(1, len(reviews))

    for feat, count in sorted(candidate_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        pct = round((count / total_reviews) * 100.0, 1)
        results.append({
            "name": feat,
            "requests_count": count,
            "percentage": pct,
            "urgency_severity": 8.0 if count >= 3 else 6.5,
            "potential_opportunity": f"Forte demande ({count} demandes récurrentes) à intégrer dans le MVP.",
            "sample_verbatims": sample_verbatims[feat]
        })

    return results

def compute_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Calcule la similarité cosinus entre deux vecteurs."""
    a = np.array(vec_a)
    b = np.array(vec_b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))

def process_review_batch(raw_reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Exécute le pipeline complet sur un lot d'avis :
    - Déduplication
    - Classification dans les 15 catégories
    - Agrégation des frustrations (Pain Points) avec scoring
    - Extraction des fonctionnalités manquantes
    """
    seen_texts = set()
    cleaned_reviews = []
    
    category_counts = defaultdict(int)
    negative_category_counts = defaultdict(int)

    for r in raw_reviews:
        text = r.get("text", "")
        norm = normalize_text(text)
        if not norm or norm in seen_texts:
            continue
        seen_texts.add(norm)

        lang = detect_language(text)
        sentiment = detect_sentiment(r.get("rating", 3), text)
        cat, conf = classify_review(text)

        category_counts[cat] += 1
        if sentiment == "negative":
            negative_category_counts[cat] += 1

        cleaned_reviews.append({
            "id": r.get("id"),
            "rating": r.get("rating"),
            "text": text,
            "language": lang,
            "sentiment": sentiment,
            "category": cat,
            "confidence": conf
        })

    total_negatives = max(1, sum(negative_category_counts.values()))
    
    # Calcul des Pain Points avec calculate_pain_score
    pain_points = []
    for cat, neg_count in negative_category_counts.items():
        freq_pct = (neg_count / total_negatives) * 100.0
        # Sévérité selon la nature du problème
        severity_map = {
            "PRICE": 8.5, "BUGS": 9.0, "PERFORMANCE": 8.0, 
            "ADS": 7.5, "EXPORT": 7.0, "SYNC": 8.0, "PAYMENT": 8.5
        }
        severity = severity_map.get(cat, 6.5)
        
        pain = calculate_pain_score(
            frequency_pct=freq_pct,
            severity=severity,
            growth_pct=25.0,
            review_volume=neg_count,
            concentration_hhi=0.35
        )

        pain_points.append({
            "category": cat,
            "count": neg_count,
            "frequency_pct": round(freq_pct, 1),
            "severity": severity,
            "pain_score": pain["score"],
            "pain_details": pain
        })

    pain_points.sort(key=lambda x: x["pain_score"], reverse=True)
    missing_features = extract_missing_features(cleaned_reviews)

    return {
        "total_analyzed": len(cleaned_reviews),
        "deduplicated_count": len(raw_reviews) - len(cleaned_reviews),
        "category_distribution": dict(category_counts),
        "pain_points": pain_points,
        "missing_features": missing_features
    }
