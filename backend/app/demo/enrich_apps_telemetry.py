"""
Script d'enrichissement télémétrique pour les 200 applications de NICHEPULSE :
1. Ajoute les colonnes manquantes dans SQLite :
   - downloads_count (Volume total estimé de téléchargements)
   - downloads_growth (Évolution % du nombre de téléchargements, ex: '+218% ce mois')
   - downloads_growth_weekly (Gain hebdomadaire de téléchargements, ex: 16400)
   - subscription_price (Tarif de l'abonnement ou achat in-app, ex: '3,99 €/mois ou 24,99 € Lifetime')
   - company_name (Nom complet de l'entreprise ou studio éditrice, ex: 'AudioSprint Labs LLC (Austin, TX)')
   - company_country (Pays d'enregistrement de l'entreprise)
   - company_type (Solo Developer, Studio Indépendant, Scale-up, Éditeur Établi)
   - release_date (Date de premier lancement sur le store)
   - functional_summary (Analyse fonctionnelle détaillée)
2. Marque 24 applications (12 iOS + 12 Android) comme "Nouvelles Applications" (is_new = 1)
   avec une analyse approfondie de leurs fonctionnalités clés insérée dans 'app_features'.
3. Calibre les 200 applications avec des chiffres réalistes, cohérents et complets.
"""

import sqlite3
import random
from datetime import datetime, timedelta

DB_PATH = "backend/nichepulse.db"

# 24 Nouvelles applications avec analyses fonctionnelles exhaustives (12 iOS + 12 Android)
NEW_LAUNCHES_METADATA = [
    # =========================================================================
    # iOS - 12 NOUVEAUX LANCEMENTS
    # =========================================================================
    {
        "id": "app.ios.voicetask",
        "name": "VoiceToTask: Whisper Voice Capture",
        "developer": "Kinetic Apps Studio",
        "company_name": "Kinetic Apps Studio LLC (Austin, TX)",
        "company_country": "États-Unis",
        "company_type": "Solo Developer",
        "category": "Productivity",
        "platform": "ios",
        "release_date": "2026-08-10",
        "downloads_count": 84500,
        "downloads_growth": "+218% ce mois",
        "downloads_growth_weekly": 16400,
        "subscription_price": "3,99 €/mois ou 24,99 € Lifetime",
        "functional_summary": "Application de capture vocale ultra-rapide qui convertit les notes vocales brutes en tâches structurées avec tags, dates d'échéance et envoi direct vers Notion, Todoist ou Apple Reminders via les API iOS 18.",
        "features": [
            {
                "name": "Transcription Locale Whispering",
                "description": "Exécute Whisper en local sur le Neural Engine de l'iPhone sans envoyer de données audio vers le cloud, garantissant latence zéro et confidentialité totale.",
                "is_core": True
            },
            {
                "name": "Extraction Sémantique d'Actions",
                "description": "Analyse les verbes d'action et contraintes temporelles ('Demain à 14h rappeler Marc') pour générer automatiquement l'événement calendrier correspondant.",
                "is_core": True
            },
            {
                "name": "Bouton Action & Dynamic Island",
                "description": "Déclenchement instantané de l'enregistrement depuis le bouton Action matériel de l'iPhone 16 sans déverrouiller l'écran.",
                "is_core": True
            },
            {
                "name": "Webhooks & Synchro Multi-Outils",
                "description": "Envoi immédiat des mémos transcrits vers Notion, Obsidian, Todoist et Slack par webhooks personnalisables.",
                "is_core": False
            }
        ]
    },
    {
        "id": "app.ios.focuspomo",
        "name": "FocusPomo: Dynamic Island Timer",
        "developer": "Minimalist Labs",
        "company_name": "Minimalist Labs UG (Berlin)",
        "company_country": "Allemagne",
        "company_type": "Studio Indépendant (2 devs)",
        "category": "Productivity",
        "platform": "ios",
        "release_date": "2026-08-18",
        "downloads_count": 62000,
        "downloads_growth": "+174% ce mois",
        "downloads_growth_weekly": 12800,
        "subscription_price": "9,99 € Achat Unique (Sans abonnement)",
        "functional_summary": "Chronomètre Pomodoro épuré sans distractions, basé sur la psychologie cognitive et synchronisé avec le mode Concentration d'iOS et la Dynamic Island.",
        "features": [
            {
                "name": "Intégration Mode Concentration iOS",
                "description": "Active automatiquement le profil Concentration travail dès qu'un bloc Pomodoro démarre, bloquant les notifications distrayantes.",
                "is_core": True
            },
            {
                "name": "Live Activities & Dynamic Island",
                "description": "Affichage de la progression du cycle de travail sous forme de cadran circulaire dynamique visible sur l'écran verrouillé et Always-On.",
                "is_core": True
            },
            {
                "name": "Heatmap de Constance Visuelle",
                "description": "Matrice de productivité sur 365 jours inspirée de GitHub pour quantifier la régularité sans culpabilisation.",
                "is_core": True
            }
        ]
    },
    {
        "id": "app.ios.timebloc",
        "name": "TimeBloc: Daily Routine Planner",
        "developer": "TimeBloc Labs",
        "company_name": "TimeBloc Labs Ltd (Londres)",
        "company_country": "Royaume-Uni",
        "company_type": "Solo Developer",
        "category": "Productivity",
        "platform": "ios",
        "release_date": "2026-08-01",
        "downloads_count": 78000,
        "downloads_growth": "+192% ce mois",
        "downloads_growth_weekly": 15200,
        "subscription_price": "2,99 €/mois ou 19,99 € Lifetime",
        "functional_summary": "Planificateur de journée par blocs horaires rigides pour vaincre la procrastination en matérialisant visuellement les heures disponibles.",
        "features": [
            {
                "name": "Time-Blocking Drag & Drop",
                "description": "Glisser-déposer intuitif de routines pré-enregistrées (Morning Routine, Deep Work, Sport) sur la frise chronologique.",
                "is_core": True
            },
            {
                "name": "Synchro Apple Calendar & Outlook",
                "description": "Détection automatique des réunions entrantes et réajustement dynamique des blocs de concentration restants.",
                "is_core": True
            },
            {
                "name": "Audit du Temps Réel vs Prévu",
                "description": "Comparateur visuel entre l'emploi du temps prévisionnel et les heures réellement allouées à chaque projet.",
                "is_core": False
            }
        ]
    },
    {
        "id": "app.ios.session",
        "name": "Session: Pomodoro & Analytics",
        "developer": "Stay Focused Ltd.",
        "company_name": "Stay Focused Ltd (Amsterdam)",
        "company_country": "Pays-Bas",
        "company_type": "Studio Indépendant",
        "category": "Productivity",
        "platform": "ios",
        "release_date": "2026-07-29",
        "downloads_count": 115000,
        "downloads_growth": "+145% ce mois",
        "downloads_growth_weekly": 18400,
        "subscription_price": "4,99 €/mois ou 39,99 €/an",
        "functional_summary": "Outil d'introspection et de focus pour développeurs et designers, combinant blocage de sites web, notes de rétrospective et analytics de flow.",
        "features": [
            {
                "name": "Blocage Intelligent de Distractions",
                "description": "Extension Safari intégrée qui coupe les flux de réseaux sociaux et actualités pendant les sessions de travail.",
                "is_core": True
            },
            {
                "name": "Micro-Journal de Fin de Session",
                "description": "Invite de 15 secondes demandant ce qui a été accompli pour ancrer la satisfaction psychologique d'avancement.",
                "is_core": True
            },
            {
                "name": "Export Apple Health Mindfulness",
                "description": "Enregistre automatiquement les sessions de concentration comme minutes de pleine conscience dans Apple Health.",
                "is_core": False
            }
        ]
    },
    {
        "id": "app.ios.routine",
        "name": "Routine: Calendar & Actions",
        "developer": "Routine Inc.",
        "company_name": "Routine Technologies Inc. (Paris & San Francisco)",
        "company_country": "France",
        "company_type": "Scale-up",
        "category": "Productivity",
        "platform": "ios",
        "release_date": "2026-08-05",
        "downloads_count": 140000,
        "downloads_growth": "+160% ce mois",
        "downloads_growth_weekly": 22100,
        "subscription_price": "8,00 €/mois ou 72,00 €/an",
        "functional_summary": "Boîte de réception unifiée réunissant tâches, notes de réunions et agenda en une seule interface ultra-réactive conçue au clavier.",
        "features": [
            {
                "name": "Prise de Notes Liée à l'Événement",
                "description": "Ouvre instantanément la note collaborative associée aux participants de la réunion Zoom/Google Meet en cours.",
                "is_core": True
            },
            {
                "name": "Capture Universelle Rapide",
                "description": "Widget iOS permettant d'ajouter une idée ou un contact sans ouvrir l'application.",
                "is_core": True
            },
            {
                "name": "Dashboard Quotidien Synthétique",
                "description": "Écran d'accueil présentant les 3 priorités capitales du jour et les disponibilités restantes.",
                "is_core": False
            }
        ]
    },
    {
        "id": "app.ios.capacities",
        "name": "Capacities: Studio Notes",
        "developer": "Capacities Technologies",
        "company_name": "Capacities Technologies GmbH (Berlin)",
        "company_country": "Allemagne",
        "company_type": "Studio Indépendant (4 devs)",
        "category": "Productivity",
        "platform": "ios",
        "release_date": "2026-07-25",
        "downloads_count": 165000,
        "downloads_growth": "+135% ce mois",
        "downloads_growth_weekly": 24500,
        "subscription_price": "9,99 €/mois (Capacities Pro)",
        "functional_summary": "Système de gestion des connaissances basé sur les objets (Personnes, Idées, Livres, Réunions) plutôt que de simples dossiers ou fichiers hiérarchiques.",
        "features": [
            {
                "name": "Modélisation en Objets Typés",
                "description": "Crée des entités intelligentes interconnectées avec métadonnées spécifiques pour chaque type de contenu.",
                "is_core": True
            },
            {
                "name": "Graphe de Relations Visuel",
                "description": "Exploration interactive des connexions neuronales entre vos lectures, projets et personnes clés.",
                "is_core": True
            },
            {
                "name": "Requêtes et Vues Filtrées",
                "description": "Génération de galeries, tables et calendriers à partir de filtres multi-critères sur les objets.",
                "is_core": True
            }
        ]
    },
    {
        "id": "app.ios.flow",
        "name": "Flow: Minimal Focus & Breaks",
        "developer": "Yugen GmbH",
        "company_name": "Yugen GmbH (Vienne)",
        "company_country": "Autriche",
        "company_type": "Studio Indépendant",
        "category": "Productivity",
        "platform": "ios",
        "release_date": "2026-08-15",
        "downloads_count": 72000,
        "downloads_growth": "+210% ce mois",
        "downloads_growth_weekly": 14600,
        "subscription_price": "1,99 €/mois ou 14,99 € Lifetime",
        "functional_summary": "Minuteur épuré axé sur les micro-pauses et l'étirement postural pour travailleurs sur écran et télétravailleurs.",
        "features": [
            {
                "name": "Rappels Posturaux & Hydratation",
                "description": "Notifications discrètes suggérant des exercices d'yeux 20-20-20 et des étirements cervicaux pendant les pauses.",
                "is_core": True
            },
            {
                "name": "Sons Ambiants Génératifs",
                "description": "Bruits blanc, rose et sons de pluie synthétisés en direct sans boucle audio répétitive.",
                "is_core": True
            },
            {
                "name": "Synchronisation Mac & iPhone",
                "description": "État du timer partagé via iCloud pour travailler sans rupture entre le bureau et les déplacements.",
                "is_core": False
            }
        ]
    },
    {
        "id": "app.ios.cleanmyphone",
        "name": "CleanMyPhone: Clean Storage",
        "developer": "MacPaw Way Ltd.",
        "company_name": "MacPaw Way Ltd (Kyiv & Nicosie)",
        "company_country": "Chypre",
        "company_type": "Scale-up Établie",
        "category": "Productivity",
        "platform": "ios",
        "release_date": "2026-08-03",
        "downloads_count": 280000,
        "downloads_growth": "+185% ce mois",
        "downloads_growth_weekly": 38000,
        "subscription_price": "4,99 €/mois ou 29,99 €/an",
        "functional_summary": "Nettoyeur d'espace intelligent pour galerie photo et vidéo utilisant l'intelligence artificielle pour identifier doublons, captures périmées et flous.",
        "features": [
            {
                "name": "Modèle On-Device de Détection de Flous",
                "description": "Scanne les clichés sans téléversement pour repérer les photos manquées et les vidéos d'écran oubliées.",
                "is_core": True
            },
            {
                "name": "Test de Vitesse Connexion Réseau",
                "description": "Module d'analyse des performances WiFi et 5G pour diagnostiquer les lenteurs de synchronisation Cloud.",
                "is_core": False
            },
            {
                "name": "Espace Caché Sécurisé",
                "description": "Verrouillage par FaceID des médias sensibles hors de la photothèque publique Apple.",
                "is_core": True
            }
        ]
    },
    {
        "id": "app.ios.bobby",
        "name": "Bobby: Track Subscriptions",
        "developer": "Bobby Labs",
        "company_name": "Bobby Labs Ltd (Londres)",
        "company_country": "Royaume-Uni",
        "company_type": "Solo Developer",
        "category": "Finance",
        "platform": "ios",
        "release_date": "2026-08-11",
        "downloads_count": 94000,
        "downloads_growth": "+205% ce mois",
        "downloads_growth_weekly": 17500,
        "subscription_price": "2,49 €/mois ou 14,99 € Achat Unique",
        "functional_summary": "Gestionnaire visuel d'abonnements avec conversion de devises, alertes de renouvellement et calcul des dépenses fixes mensuelles.",
        "features": [
            {
                "name": "Bibliothèque de +300 Services",
                "description": "Logos, couleurs et cycles de facturation officiels pré-configurés pour Netflix, Spotify, iCloud, ChatGPT...",
                "is_core": True
            },
            {
                "name": "Alertes Préventives Anti-Prélèvement",
                "description": "Notifications paramétrables (J-3, J-1) avant la date fatidique pour résilier avant renouvellement automatique.",
                "is_core": True
            },
            {
                "name": "Calculateur d'Impact Annuel",
                "description": "Projection des coûts cumulés sur 1, 3 et 5 ans pour conscientiser le coût total de possession.",
                "is_core": True
            }
        ]
    },
    {
        "id": "app.ios.waterllama",
        "name": "Waterllama: Water Reminder",
        "developer": "Vitalii Mogylevets",
        "company_name": "Llama Apps Studio (Kharkiv)",
        "company_country": "Ukraine",
        "company_type": "Solo Developer",
        "category": "Health & Fitness",
        "platform": "ios",
        "release_date": "2026-07-28",
        "downloads_count": 310000,
        "downloads_growth": "+64% ce mois",
        "downloads_growth_weekly": 24000,
        "subscription_price": "3,99 €/mois ou 29,99 € Lifetime",
        "functional_summary": "Suivi d'hydratation ludique avec mascottes animées, calcul d'impact pour plus de 45 boissons et widgets interactifs iOS 18.",
        "features": [
            {
                "name": "Calculateur d'Hydratation Dynamique",
                "description": "Ajuste l'objectif quotidien selon la météo locale, le taux d'humidité et l'effort mesuré par l'Apple Watch.",
                "is_core": True
            },
            {
                "name": "Widgets Interactifs d'Écran d'Accueil",
                "description": "Enregistre un café, un thé ou un verre d'eau en 1 tap directement depuis le widget sans ouvrir l'app.",
                "is_core": True
            },
            {
                "name": "Gamification Personnages & Défis",
                "description": "Déblocage de nouveaux animaux (koala, loutre, toucan) au fur et à mesure des séries d'hydratation réussies.",
                "is_core": False
            }
        ]
    },
    {
        "id": "app.ios.gentlerstreak",
        "name": "Gentler Streak: Fitness & Rest",
        "developer": "Gentler Stories d.o.o.",
        "company_name": "Gentler Stories d.o.o. (Ljubljana)",
        "company_country": "Slovénie",
        "company_type": "Studio Indépendant (5 personnes)",
        "category": "Health & Fitness",
        "platform": "ios",
        "release_date": "2026-08-06",
        "downloads_count": 220000,
        "downloads_growth": "+128% ce mois",
        "downloads_growth_weekly": 26000,
        "subscription_price": "7,99 €/mois ou 49,99 €/an",
        "functional_summary": "Tracker d'activité sportive bienveillant qui valorise les jours de repos et le sommeil pour éviter le surentraînement et l'épuisement physique.",
        "features": [
            {
                "name": "Zone d'Activité Optimale",
                "description": "Courbe visuelle dynamique indiquant si vous êtes en sous-entraînement, forme optimale ou risque de blessure.",
                "is_core": True
            },
            {
                "name": "Recommandation Quotidienne de Récupération",
                "description": "Conseille une marche lente ou une sieste plutôt qu'un run intense quand la variabilité cardiaque (VRC) est basse.",
                "is_core": True
            },
            {
                "name": "Compatibilité Apple Health VRC & Sommeil",
                "description": "Exploite directement les métriques brutes de l'Apple Watch sans nécessiter de capteur tiers propriétaire.",
                "is_core": True
            }
        ]
    },
    {
        "id": "app.ios.microbill",
        "name": "MicroBill: Devis & Facturation",
        "developer": "MicroBill SAS",
        "company_name": "MicroBill Technologies SAS (Lyon)",
        "company_country": "France",
        "company_type": "Studio Indépendant (2 devs)",
        "category": "Business",
        "platform": "ios",
        "release_date": "2026-08-16",
        "downloads_count": 46000,
        "downloads_growth": "+260% ce mois",
        "downloads_growth_weekly": 11800,
        "subscription_price": "4,99 €/mois ou 39,99 €/an",
        "functional_summary": "Générateur de factures et devis ultra-rapide pour freelances et auto-entrepreneurs avec signature sur écran et relances automatiques.",
        "features": [
            {
                "name": "Modèles Conformes Facturation 2026",
                "description": "Intègre les mentions légales obligatoires, TVA non applicable art. 293B et numérotation séquentielle inviolable.",
                "is_core": True
            },
            {
                "name": "Signature Manuscrite Client",
                "description": "Fait parapher le bon de commande directement au client sur l'iPad ou l'iPhone avec horodatage certifié.",
                "is_core": True
            },
            {
                "name": "Lien de Paiement Stripe / CB Intégré",
                "description": "Génère un QR code et un lien Stripe sur le PDF permettant au client de régler par carte bancaire en 1 clic.",
                "is_core": True
            }
        ]
    },

    # =========================================================================
    # Android - 12 NOUVEAUX LANCEMENTS
    # =========================================================================
    {
        "id": "app.android.cashew",
        "name": "Cashew: Budget Material You",
        "developer": "Cashew App Team",
        "company_name": "Cashew Finance UG (Munich)",
        "company_country": "Allemagne",
        "company_type": "Solo Developer",
        "category": "Finance",
        "platform": "android",
        "release_date": "2026-07-30",
        "downloads_count": 120000,
        "downloads_growth": "+165% ce mois",
        "downloads_growth_weekly": 22000,
        "subscription_price": "2,99 €/mois ou 19,99 € Lifetime",
        "functional_summary": "Application de budget personnel au design Material 3 coloré avec synchronisation Google Drive chiffrée et zéro abonnement obligatoire.",
        "features": [
            {
                "name": "Suivi par Enveloppes Budgétaires",
                "description": "Attribution d'un plafond mensuel par catégorie (Alimentation, Sorties, Logement) avec jauge d'alerte en direct.",
                "is_core": True
            },
            {
                "name": "Sauvegarde Cloud Privée Chiffrée",
                "description": "Export automatique vers votre compte Google Drive personnel sans serveur intermédiaire ni tracking.",
                "is_core": True
            },
            {
                "name": "Support Multi-Devises avec Taux Temps Réel",
                "description": "Idéal pour les digital nomads et voyageurs avec conversion instantanée de plus de 150 devises mondiales.",
                "is_core": True
            }
        ]
    },
    {
        "id": "app.android.voicenotes",
        "name": "VoiceNotes AI: Audio Memo",
        "developer": "VoiceNotes Team",
        "company_name": "VoiceNotes Labs Inc. (San Francisco, CA)",
        "company_country": "États-Unis",
        "company_type": "Studio Indépendant (3 devs)",
        "category": "Productivity",
        "platform": "android",
        "release_date": "2026-08-08",
        "downloads_count": 98000,
        "downloads_growth": "+230% ce mois",
        "downloads_growth_weekly": 19200,
        "subscription_price": "4,99 €/mois ou 45,00 € Lifetime",
        "functional_summary": "Enregistreur de pensées et réunions qui transcrit l'audio et génère des résumés structurés, e-mails prêts à l'envoi et listes de tâches.",
        "features": [
            {
                "name": "Transcription IA Multi-Locuteurs",
                "description": "Distingue automatiquement les interlocuteurs lors d'un entretien ou d'une réunion informelle.",
                "is_core": True
            },
            {
                "name": "Transformation de Format Instantanée",
                "description": "Bouton 1 clic pour reformuler un monologue désordonné en article de blog, tweet thread ou compte-rendu exécutif.",
                "is_core": True
            },
            {
                "name": "Recherche Sémantique Vocale",
                "description": "Retrouve un point précis abordé il y a 3 mois en posant simplement une question en langage naturel à l'IA.",
                "is_core": True
            }
        ]
    },
    {
        "id": "app.android.sectograph",
        "name": "Sectograph: Visual Day Clock",
        "developer": "Laboratory 27",
        "company_name": "Laboratory 27 (Varsovie)",
        "company_country": "Pologne",
        "company_type": "Studio Indépendant",
        "category": "Productivity",
        "platform": "android",
        "release_date": "2026-08-04",
        "downloads_count": 185000,
        "downloads_growth": "+140% ce mois",
        "downloads_growth_weekly": 24000,
        "subscription_price": "3,49 € Achat Unique Pro",
        "functional_summary": "Visualiseur d'emploi du temps sous la forme d'un cadran d'horloge de 12 heures affichant chaque rendez-vous comme un secteur angulaire coloré.",
        "features": [
            {
                "name": "Cadran Circulaire Chronométrique",
                "description": "Permet de percevoir physiquement le temps qui s'écoule et l'imminence des échéances de la demi-journée.",
                "is_core": True
            },
            {
                "name": "Widget Écran d'Accueil Circulaire",
                "description": "Widget Material You interactif remplaçant l'horloge système classique par l'agenda dynamique.",
                "is_core": True
            },
            {
                "name": "Synchronisation Bidirectionnelle Google Agenda",
                "description": "Reflète instantanément toute modification effectuée sur desktop ou invitations reçues par mail.",
                "is_core": False
            }
        ]
    },
    {
        "id": "app.android.taskito",
        "name": "Taskito: Timeline Calendar",
        "developer": "Taskito Dev",
        "company_name": "Taskito Technologies (Bangalore)",
        "company_country": "Inde",
        "company_type": "Solo Developer",
        "category": "Productivity",
        "platform": "android",
        "release_date": "2026-07-26",
        "downloads_count": 135000,
        "downloads_growth": "+155% ce mois",
        "downloads_growth_weekly": 20500,
        "subscription_price": "2,49 €/mois ou 18,99 € Lifetime",
        "functional_summary": "Organisation quotidienne sous forme de fil chronologique unifiant événements de calendrier, rappels, notes et habitudes récurrentes.",
        "features": [
            {
                "name": "Fil Chronologique Central",
                "description": "Vue verticale fluide supprimant le cloisonnement artificiel entre tâches sans heure et réunions fixes.",
                "is_core": True
            },
            {
                "name": "Répétition d'Habitudes Flexibles",
                "description": "Gestion des habitudes avec quotas hebdomadaires souples (ex: 3 séances de sport par semaine).",
                "is_core": True
            },
            {
                "name": "Tableaux Kanban Secondaires",
                "description": "Espaces projets intégrés pour décomposer les livrables avant de les injecter dans la timeline.",
                "is_core": False
            }
        ]
    },
    {
        "id": "app.android.focumon",
        "name": "Focumon: Gamified Study Timer",
        "developer": "Focumon Studio",
        "company_name": "Focumon Gaming Labs (Tokyo)",
        "company_country": "Japon",
        "company_type": "Studio Indépendant (2 devs)",
        "category": "Productivity",
        "platform": "android",
        "release_date": "2026-08-17",
        "downloads_count": 64000,
        "downloads_growth": "+290% ce mois",
        "downloads_growth_weekly": 15800,
        "subscription_price": "2,99 €/mois ou 21,99 €/an",
        "functional_summary": "Minuteur Pomodoro gamifié style RPG pixel-art où chaque session de concentration fait évoluer des créatures virtuelles et des combats coopératifs.",
        "features": [
            {
                "name": "Évolution de Monstres Pixel-Art",
                "description": "Transformer les blocs de travail de 25 minutes en points d'expérience (XP) pour faire éclore et évoluer vos familiers.",
                "is_core": True
            },
            {
                "name": "Salles d'Étude Multijoueur",
                "description": "Batailles de boss en temps réel où chaque participant contribue au score collectif en restant concentré.",
                "is_core": True
            },
            {
                "name": "Statistiques de Donjon Personnelles",
                "description": "Visualisation de la difficulté surmontée et des heures de révision accumulées par matière.",
                "is_core": False
            }
        ]
    },
    {
        "id": "app.android.amplenote",
        "name": "Amplenote: Notes, Tasks & Cal",
        "developer": "Alloy.co",
        "company_name": "Alloy Technologies Inc. (Seattle, WA)",
        "company_country": "États-Unis",
        "company_type": "Scale-up",
        "category": "Productivity",
        "platform": "android",
        "release_date": "2026-07-20",
        "downloads_count": 190000,
        "downloads_growth": "+112% ce mois",
        "downloads_growth_weekly": 21000,
        "subscription_price": "5,99 €/mois ou 59,99 €/an",
        "functional_summary": "Méthode 'Idea-to-Execution' qui convertit automatiquement les gribouillis en tâches priorisées par score Jots puis en blocs d'agenda.",
        "features": [
            {
                "name": "Score de Priorisation Task Score",
                "description": "Algorithme propriétaire classant les tâches selon urgence, importance et temps estimé nécessaire.",
                "is_core": True
            },
            {
                "name": "Jots: Prise de Notes Éphémère",
                "description": "Carnet de notes quotidien ultra-léger évitant la friction de devoir nommer ou classer immédiatement.",
                "is_core": True
            },
            {
                "name": "Time-Boxing Calendrier Fluide",
                "description": "Glissement direct des tâches de haute priorité vers les créneaux disponibles de Google Calendar.",
                "is_core": True
            }
        ]
    },
    {
        "id": "app.android.subtrack",
        "name": "SubTrack: Offline Vault (Android)",
        "developer": "PrivacyFirst Dev",
        "company_name": "PrivacyFirst Software (Tallinn)",
        "company_country": "Estonie",
        "company_type": "Solo Developer",
        "category": "Finance",
        "platform": "android",
        "release_date": "2026-08-12",
        "downloads_count": 82000,
        "downloads_growth": "+198% ce mois",
        "downloads_growth_weekly": 16900,
        "subscription_price": "1,99 € Achat Unique (Open Source)",
        "functional_summary": "Gestionnaire d'abonnements 100% hors-ligne respectueux de la vie privée sans création de compte ni partage d'informations bancaires.",
        "features": [
            {
                "name": "Chiffrement Local AES-256",
                "description": "Stockage sécurisé des données financières directement dans le stockage chiffré de l'appareil Android.",
                "is_core": True
            },
            {
                "name": "Analyseur de Dépenses Récurrentes",
                "description": "Génère des camemberts et prévisions de trésorerie nette sur les 12 prochains mois.",
                "is_core": True
            },
            {
                "name": "Notifications d'Échéance Locales",
                "description": "Rappels système gérés par AlarmManager d'Android sans passage par des serveurs push externes.",
                "is_core": True
            }
        ]
    },
    {
        "id": "app.android.caliverse",
        "name": "Caliverse: Calisthénie Poids Corps",
        "developer": "Caliverse SIA",
        "company_name": "Caliverse SIA (Riga)",
        "company_country": "Lettonie",
        "company_type": "Studio Indépendant (3 devs)",
        "category": "Health & Fitness",
        "platform": "android",
        "release_date": "2026-08-02",
        "downloads_count": 210000,
        "downloads_growth": "+145% ce mois",
        "downloads_growth_weekly": 25500,
        "subscription_price": "4,99 €/mois ou 39,99 €/an",
        "functional_summary": "Entraînement au poids du corps et street workout avec tutoriels vidéo décomposés étape par étape et progression personnalisée.",
        "features": [
            {
                "name": "Progression en Compétences (Skill Trees)",
                "description": "Arbres d'apprentissage interactifs pour maîtriser le Muscle-Up, Handstand et Front Lever en sécurité.",
                "is_core": True
            },
            {
                "name": "Créateur de Séances Personnalisées",
                "description": "Générateur d'entraînements adaptant les séries et répétitions selon le matériel disponible (barre, anneaux, sol).",
                "is_core": True
            },
            {
                "name": "Flux Communautaire de Défis",
                "description": "Partage de vidéos de validation de figures entre pratiquants avec retours techniques des pairs.",
                "is_core": False
            }
        ]
    },
    {
        "id": "app.android.fitnotes",
        "name": "FitNotes: Gym Workout Log",
        "developer": "James Gay",
        "company_name": "James Gay Software LLC (Chicago, IL)",
        "company_country": "États-Unis",
        "company_type": "Solo Developer",
        "category": "Health & Fitness",
        "platform": "android",
        "release_date": "2026-08-09",
        "downloads_count": 320000,
        "downloads_growth": "+88% ce mois",
        "downloads_growth_weekly": 28000,
        "subscription_price": "Gratuit (Version Donateur 4,99 €)",
        "functional_summary": "Carnet d'entraînement de fonte puriste sans fioritures, axé sur la vitesse de logging en salle et l'analyse de progression 1RM.",
        "features": [
            {
                "name": "Saisie de Série en 2 Clics",
                "description": "Pré-remplissage automatique des charges et répétitions basées sur la dernière séance enregistrée.",
                "is_core": True
            },
            {
                "name": "Calculateur Automatique de Barres & Disques",
                "description": "Indique immédiatement quels poids charger de chaque côté de la barre olympique pour atteindre la cible.",
                "is_core": True
            },
            {
                "name": "Export CSV / BDD Complète",
                "description": "Téléchargement illimité des historiques d'entraînement pour analyse avancée sur Excel ou Python.",
                "is_core": False
            }
        ]
    },
    {
        "id": "app.android.microbill",
        "name": "MicroBill: Facturation Freelance",
        "developer": "MicroBill SAS",
        "company_name": "MicroBill Technologies SAS (Lyon)",
        "company_country": "France",
        "company_type": "Studio Indépendant",
        "category": "Business",
        "platform": "android",
        "release_date": "2026-08-14",
        "downloads_count": 52000,
        "downloads_growth": "+240% ce mois",
        "downloads_growth_weekly": 12500,
        "subscription_price": "4,99 €/mois ou 39,99 €/an",
        "functional_summary": "Application Android de devis et facturation certifiée avec conformité fiscale française, export PDF immédiat et lien CB Stripe.",
        "features": [
            {
                "name": "Calcul Automatique Cotisations URSSAF",
                "description": "Estimation instantanée des charges sociales dues selon le chiffre d'affaires mensuel ou trimestriel facturé.",
                "is_core": True
            },
            {
                "name": "Catalogue Prestations & Taux Horaires",
                "description": "Insertion en 1 clic de prestations types avec tarifs personnalisés par client.",
                "is_core": True
            },
            {
                "name": "Envoi WhatsApp & Mail du Devis",
                "description": "Partage direct du PDF avec accusé de réception et consultation par le client.",
                "is_core": False
            }
        ]
    },
    {
        "id": "app.android.aegis",
        "name": "Aegis Authenticator: 2FA Vault",
        "developer": "Aegis Security",
        "company_name": "Aegis Security Collective (Utrecht)",
        "company_country": "Pays-Bas",
        "company_type": "Solo Developer (Open Source)",
        "category": "Utilities",
        "platform": "android",
        "release_date": "2026-08-19",
        "downloads_count": 270000,
        "downloads_growth": "+115% ce mois",
        "downloads_growth_weekly": 29000,
        "subscription_price": "100% Gratuit & Open Source",
        "functional_summary": "Générateur de codes 2FA ultra-sécurisé avec chiffrement local, déverrouillage biométrique et export de secours chiffré.",
        "features": [
            {
                "name": "Chiffrement AES-256-GCM du Coffre",
                "description": "Tous les secrets TOTP/HOTP sont protégés par mot de passe maître et empreinte digitale.",
                "is_core": True
            },
            {
                "name": "Import Universel Facile",
                "description": "Migration en 1 tap depuis Google Authenticator, Authy, Bitwarden ou fichiers texte sécurisés.",
                "is_core": True
            },
            {
                "name": "Groupes & Icônes Personnalisables",
                "description": "Organisation par catégories (Boulot, Crypto, Perso) avec détection automatique des logos de marques.",
                "is_core": False
            }
        ]
    },
    {
        "id": "app.android.localsend",
        "name": "LocalSend: AirDrop Open Source",
        "developer": "Tien Do Nam",
        "company_name": "LocalSend Project (Munich)",
        "company_country": "Allemagne",
        "company_type": "Solo Developer (Open Source)",
        "category": "Utilities",
        "platform": "android",
        "release_date": "2026-08-22",
        "downloads_count": 390000,
        "downloads_growth": "+215% ce mois",
        "downloads_growth_weekly": 42000,
        "subscription_price": "100% Gratuit & Open Source (Dons libres)",
        "functional_summary": "Alternative universelle et open source à AirDrop permettant le transfert local chiffré de fichiers entre Android, iOS, Windows, macOS et Linux sans Internet.",
        "features": [
            {
                "name": "Découverte Réseau Local Zéro-Configuration",
                "description": "Détecte automatiquement les machines voisines sur le même réseau WiFi via mDNS et protocole REST HTTPS.",
                "is_core": True
            },
            {
                "name": "Transfert Direct Peer-to-Peer Chiffré",
                "description": "Échange de fichiers gigaoctets à la vitesse maximale du routeur sans transiter par aucun serveur externe.",
                "is_core": True
            },
            {
                "name": "Compatibilité Multiplateforme Totale",
                "description": "Fonctionne sans compte entre n'importe quel smartphone Android, iPhone ou PC de bureau.",
                "is_core": True
            }
        ]
    }
]

# Modèles de prix par catégorie pour les 176 autres applications
PRICING_CAT_MODELS = {
    "Productivity": [
        ("4,99 €/mois ou 39,99 €/an", True),
        ("Gratuit avec option IA à 8,99 €/mois", True),
        ("9,99 € Achat unique (Sans abonnement)", False),
        ("3,49 €/mois ou 29,99 € Lifetime", True),
        ("100% Gratuit (Sans in-app)", False),
        ("6,99 €/mois ou 59,99 €/an", True),
        ("2,99 €/mois ou 24,99 € Lifetime", True),
    ],
    "Finance": [
        ("4,99 €/mois avec essai 7 jours", True),
        ("2,99 €/mois ou 19,99 € Lifetime", True),
        ("Gratuit (Version Pro 34,99 €/an)", True),
        ("14,99 € Achat unique", False),
        ("3,99 €/mois ou 29,99 € Lifetime", True),
        ("Gratuit sans in-app (Open Source)", False),
    ],
    "Health & Fitness": [
        ("6,99 €/mois ou 49,99 €/an", True),
        ("3,99 €/mois (Essai 14j)", True),
        ("29,99 € Achat unique Lifetime", True),
        ("8,99 €/mois ou 69,99 €/an", True),
        ("4,49 €/mois ou 35,99 €/an", True),
        ("Gratuit sans publicité", False),
    ],
    "Business": [
        ("9,99 €/mois ou 89,99 €/an", True),
        ("4,99 €/mois ou 49,99 €/an", True),
        ("14,99 €/mois (Forfait Équipe)", True),
        ("Gratuit (Factures limitées à 3/mois)", True),
    ],
    "Utilities": [
        ("1,99 €/mois ou 14,99 € Lifetime", True),
        ("2,99 € Achat unique", False),
        ("100% Gratuit & Open Source", False),
        ("3,99 €/mois ou 29,99 €/an", True),
        ("5,99 € Achat unique à vie", False),
    ],
    "Lifestyle": [
        ("5,99 €/mois ou 45,99 €/an", True),
        ("3,99 €/mois", True),
        ("Gratuit avec achats in-app (0,99 € - 9,99 €)", True),
        ("7,99 €/mois ou 64,99 €/an", True),
    ]
}

# Pays pour attribution réaliste des entreprises
COUNTRIES = [
    ("États-Unis", ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA"]),
    ("France", ["Paris", "Lyon", "Nantes", "Bordeaux", "Lille"]),
    ("Allemagne", ["Berlin", "Munich", "Hambourg", "Stuttgart"]),
    ("Royaume-Uni", ["Londres", "Cambridge", "Manchester"]),
    ("Canada", ["Toronto", "Montréal", "Vancouver"]),
    ("Pays-Bas", ["Amsterdam", "Utrecht", "Rotterdam"]),
    ("Suède", ["Stockholm", "Göteborg"]),
    ("Suisse", ["Zurich", "Genève", "Lausanne"]),
    ("Japon", ["Tokyo", "Kyoto"]),
    ("Estonie", ["Tallinn"]),
    ("Ukraine", ["Kyiv", "Lviv", "Kharkiv"]),
]

COMPANY_TYPES = [
    "Solo Developer",
    "Studio Indépendant (2-4 devs)",
    "Scale-up Tech",
    "Éditeur Établi",
    "Collectif Open Source",
]

def run_enrichment():
    print(f"Connexion à {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Vérification et création des colonnes
    cursor.execute("PRAGMA table_info(apps);")
    existing_cols = {row[1] for row in cursor.fetchall()}

    columns_to_add = [
        ("downloads_count", "INTEGER DEFAULT 50000"),
        ("downloads_growth", "TEXT DEFAULT '+12.5% ce mois'"),
        ("downloads_growth_weekly", "INTEGER DEFAULT 2500"),
        ("subscription_price", "TEXT DEFAULT '4,99 €/mois'"),
        ("company_name", "TEXT DEFAULT ''"),
        ("company_country", "TEXT DEFAULT 'France'"),
        ("company_type", "TEXT DEFAULT 'Studio Indépendant'"),
        ("release_date", "TEXT DEFAULT '2026-01-01'"),
        ("functional_summary", "TEXT DEFAULT ''"),
        ("is_new", "INTEGER DEFAULT 0")
    ]

    for col_name, col_type in columns_to_add:
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE apps ADD COLUMN {col_name} {col_type};")
            print(f"Ajout de la colonne: {col_name}")

    # Création de la table app_features si elle n'existe pas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_features (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            is_core INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (app_id) REFERENCES apps (id)
        );
    """)

    # 2. Enrichir les applications
    cursor.execute("SELECT id, name, developer, category, platform, current_rank, review_count, is_breakout, description FROM apps;")
    all_apps = cursor.fetchall()
    print(f"Enrichissement de {len(all_apps)} applications...")

    new_launches_map = {item["id"]: item for item in NEW_LAUNCHES_METADATA}

    random.seed(42)  # Déterministe pour des résultats répétables

    new_marked = 0
    total_features_inserted = 0

    for app_id, name, dev, cat, plat, rank, revs, is_breakout, desc in all_apps:
        if app_id in new_launches_map:
            # Données sur-mesure pour la nouvelle application
            nl = new_launches_map[app_id]
            cursor.execute("""
                UPDATE apps SET
                    is_new = 1,
                    downloads_count = ?,
                    downloads_growth = ?,
                    downloads_growth_weekly = ?,
                    subscription_price = ?,
                    company_name = ?,
                    company_country = ?,
                    company_type = ?,
                    release_date = ?,
                    functional_summary = ?
                WHERE id = ?;
            """, (
                nl["downloads_count"],
                nl["downloads_growth"],
                nl["downloads_growth_weekly"],
                nl["subscription_price"],
                nl["company_name"],
                nl["company_country"],
                nl["company_type"],
                nl["release_date"],
                nl["functional_summary"],
                app_id
            ))

            # Insérer les fonctionnalités clés associées
            cursor.execute("DELETE FROM app_features WHERE app_id = ?;", (app_id,))
            for feat in nl["features"]:
                cursor.execute("""
                    INSERT INTO app_features (app_id, name, description, is_core, created_at)
                    VALUES (?, ?, ?, ?, datetime('now'));
                """, (app_id, feat["name"], feat["description"], 1 if feat["is_core"] else 0))
                total_features_inserted += 1

            new_marked += 1

        else:
            # Calibrage proportionnel et réaliste pour les autres applications
            rank_val = rank or 50
            rev_val = revs or 1000

            # Estimation réaliste des téléchargements : facteur 18x à 40x le nombre d'avis
            dl_factor = random.randint(22, 38)
            est_downloads = max(18000, rev_val * dl_factor)

            # Si rank est dans le top 10, booster les téléchargements
            if rank_val <= 5:
                est_downloads = max(est_downloads, random.randint(2500000, 8500000))
            elif rank_val <= 15:
                est_downloads = max(est_downloads, random.randint(950000, 2400000))
            elif rank_val <= 30:
                est_downloads = max(est_downloads, random.randint(350000, 900000))

            # Croissance
            if is_breakout:
                growth_pct = round(random.uniform(65.0, 240.0), 1)
                growth_str = f"+{growth_pct}% ce mois"
                weekly_dl = int(est_downloads * (growth_pct / 350.0))
            else:
                growth_pct = round(random.uniform(3.5, 24.0), 1)
                growth_str = f"+{growth_pct}% ce mois"
                weekly_dl = max(900, int(est_downloads * 0.012))

            # Prix abonnement / in-app
            cat_pricing = PRICING_CAT_MODELS.get(cat, PRICING_CAT_MODELS["Productivity"])
            price_tuple = random.choice(cat_pricing)
            sub_price = price_tuple[0]

            # Société éditrice
            country_name, cities = random.choice(COUNTRIES)
            city_name = random.choice(cities)
            c_type = random.choice(COMPANY_TYPES)
            
            # Nom de société propre
            if any(term in dev for term in ["Inc", "Ltd", "LLC", "GmbH", "SAS", "SA", "Corp", "Technologies", "Laboratories", "Studio"]):
                c_name = f"{dev} ({city_name})"
            else:
                c_name = f"{dev} Studio ({city_name}, {country_name})"

            # Date de lancement historique (entre 6 mois et 4 ans)
            days_ago = random.randint(180, 1400)
            launch_dt = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")

            # Résumé fonctionnel
            f_summary = desc if desc and len(desc) > 30 else f"Application de référence dans la catégorie {cat}, axée sur la performance et l'expérience utilisateur moderne."

            cursor.execute("""
                UPDATE apps SET
                    is_new = 0,
                    downloads_count = ?,
                    downloads_growth = ?,
                    downloads_growth_weekly = ?,
                    subscription_price = ?,
                    company_name = ?,
                    company_country = ?,
                    company_type = ?,
                    release_date = ?,
                    functional_summary = ?
                WHERE id = ?;
            """, (
                est_downloads,
                growth_str,
                weekly_dl,
                sub_price,
                c_name,
                country_name,
                c_type,
                launch_dt,
                f_summary,
                app_id
            ))

    conn.commit()

    # 3. Validation
    cursor.execute("SELECT count(*) FROM apps WHERE is_new = 1;")
    db_new_count = cursor.fetchone()[0]
    cursor.execute("SELECT count(*) FROM apps WHERE is_new = 1 AND platform = 'ios';")
    ios_new_count = cursor.fetchone()[0]
    cursor.execute("SELECT count(*) FROM apps WHERE is_new = 1 AND platform = 'android';")
    android_new_count = cursor.fetchone()[0]
    cursor.execute("SELECT count(*) FROM app_features;")
    feat_count = cursor.fetchone()[0]
    cursor.execute("SELECT avg(downloads_count) FROM apps;")
    avg_dl = int(cursor.fetchone()[0])
    cursor.execute("SELECT min(downloads_count), max(downloads_count) FROM apps;")
    min_dl, max_dl = cursor.fetchone()

    print(f"\n=======================================================")
    print(f"ENRICHISSEMENT TERMINÉ AVEC SUCCÈS")
    print(f"=======================================================")
    print(f"- Total Applications : {len(all_apps)}")
    print(f"- Nouvelles Applications : {db_new_count} (iOS: {ios_new_count}, Android: {android_new_count})")
    print(f"- Fonctionnalités clés insérées : {feat_count}")
    print(f"- Téléchargements min : {min_dl:,} | max : {max_dl:,} | moyenne : {avg_dl:,}")
    print(f"=======================================================\n")

    conn.close()

if __name__ == "__main__":
    run_enrichment()
