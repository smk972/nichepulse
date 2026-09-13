# 🚀 NICHEPULSE — Market Intelligence Terminal

> **Moteur de détection d'opportunités d'applications mobiles rentables pour développeur indépendant.**
> Répond à la question clé : *« Quelle application mobile pourrais-je développer maintenant qui possède une vraie demande, une tendance positive, une concurrence raisonnable et qui reste suffisamment simple à développer ? »*

---

## 🎯 Principes Fondamentaux & Architecture Hybride

NichePulse n'est pas un simple dashboard d'agrégation statistique : c'est un **moteur décisionnel** structuré autour d'une architecture hybride stricte :
- **70% Algorithmes & Mathématiques Déterministes** : Scores numériques calculés par formules (Momentum, Tendance, Pain Score, Concurrence, Market Gap, Easy Build, Opportunity et Build Score final).
- **20% Embeddings & Similarité Sémantique** : Vectorisation et clustering pour regrouper les plaintes utilisateurs similaires (pgvector / fallback numpy).
- **10% IA Générative (Google Gemini)** : Synthèse qualitative, extraction de fonctionnalités manquantes et protocole adversarial impitoyable **"Try to Kill the Idea"**.

---

## 🖥️ Écrans & Fonctionnalités (Design Stitch *Obsidian Signal*)

1. **Vue d'ensemble (`/overview` ou `/`)** :
   - Bandeau télémétrique haute densité (24 890 apps analysées, 18 breakouts, santé 99.8%).
   - 6 KPI majeurs avec micro-sparklines vectorielles (Score Tendance, Momentum Search, Nouvelles Apps, Breakouts Rapides, Niches Viables, Opportunités MVP).
   - **Hero Module — Opportunité N°1 Algorithmique** (*AI Receipt Scanner & Expense Tagger*, Build Score: 94/100, 🔥 BUILD IT).
   - Flux des derniers breakouts et alertes en direct.
2. **Tendances (`/market-trends`)** : Trajectoires de croissance sur 30 jours et macro-segments émergents.
3. **Applications (`/app-explorer`)** : Explorateur d'applications avec filtres pays, catégories, plateformes et **tiroir d'inspection détaillée (graphique de classement 30j + synthèse Gemini)**.
4. **Breakouts (`/fast-movers`)** : Détection des applications en forte accélération (+places 24h, 7j, 30j, vélocité et accélération).
5. **Radar des problèmes (`/frustrations`)** : Classification des avis dans 15 catégories strictes (`PRICE`, `ADS`, `UX`, `EXPORT`, etc.) et table des fonctionnalités manquantes.
6. **Marchés & Écarts (`/geo-gaps`)** : Détection des transferts de marché (ex: validation forte aux USA avec +195% de croissance, quasi vierge en France avec concurrence faible).
7. **Tendances de recherche (`/search-momentum`)** : Vélocité des requêtes et croissance de volume Google Trends & Stores.
8. **Opportunités (`/market-matrix`)** : Matrice des opportunités avec Build Score, statuts (`BUILD IT`, `INVESTIGATE`, `AVOID`) et modale explicative **« Pourquoi 94/100 ? »**.
9. **Idées d'applications (`/idea-backlog`)** : Backlog d'idées générées avec estimation de complexité, délai MVP et module **« Essayer de tuer l'idée »** (audit critique des risques).
10. **Liste de surveillance (`/watchlist`)** : Suivi personnalisé d'applications, de niches et de mots-clés.
11. **Alertes (`/signal-feed`)** : Flux d'alertes en temps réel (Breakouts, Spikes, Transferts).
12. **Sources & Collecte (`/data-sources`)** : Observabilité complète des collecteurs (statuts, latences, historiques d'exécutions).
13. **Paramètres (`/settings`)** : Réglage dynamique des pondérations du Build Score et des seuils de décision.

---

## ⚡ Démarrage Rapide

### 1. Prérequis
- Node.js 18+ (actuellement testé sous Node v22)
- Python 3.9+

### 2. Démarrage du Backend FastAPI
```bash
cd backend
# Activer l'environnement virtuel
source .venv/bin/activate

# Lancer l'API FastAPI (Port 8000)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*L'API est accessible sur `http://localhost:8000` et la documentation OpenAPI interactive sur `http://localhost:8000/docs`.*

### 3. Démarrage du Frontend Next.js
```bash
cd frontend
# Lancer le serveur Next.js (Port 3001)
npm run start -- -p 3001
# Ou en mode dev :
# npm run dev -- -p 3001
```
*L'interface terminal est accessible sur `http://localhost:3001`.*

### 4. Exécution des Tests Unitaires
```bash
PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/test_scoring.py
```

---

## 🛡️ Sécurité & Variables d'Environnement
Consultez `.env.example` pour configurer :
- `GEMINI_API_KEY` : Clé d'API Google Gemini
- `DATABASE_URL` : URL de connexion PostgreSQL / pgvector (ou SQLite local par défaut)
- `NEXT_PUBLIC_API_URL` : URL de l'API backend (`http://localhost:8000/api/v1`)
