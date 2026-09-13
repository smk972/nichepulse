# Règle Globale : Application Systématique de UI/UX Pro Max

Sur tous les projets impliquant du développement front-end, du design d'interface (UI), de l'expérience utilisateur (UX), du style, des composants, des graphiques ou des refontes visuelles :

1. **Activation Obligatoire de la Skill `ui-ux-pro-max`** :
   - Toujours consulter et appliquer les directives et bases de données de `ui-ux-pro-max` (située dans `~/.gemini/config/skills/ui-ux-pro-max/` ou `.agents/skills/ui-ux-pro-max/`).
   - Pour chaque nouveau projet, refonte ou composant, interroger le moteur de recherche local :
     ```bash
     python3 ~/.gemini/config/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>
     # ou pour un système de design complet :
     python3 ~/.gemini/config/skills/ui-ux-pro-max/scripts/search.py "<type_produit> <style>" --design-system -p "<NomProjet>"
     # ou pour la stack spécifique :
     python3 ~/.gemini/config/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack <stack>
     ```

2. **Principes Fondamentaux de Design & Qualité** :
   - **Esthétique Haut de Gamme & Différenciée** : Bannir les designs génériques ou "AI placeholders". Adopter un style cohérent et intentionnel (ex. Dark Obsidian Telemetry, Modern Minimalist, Glassmorphism calibré, Bento Grid, etc.).
   - **Harmonie des Couleurs (Règle 60-30-10)** : 60% couleur dominante (souvent fond OLED/Dark neutre), 30% couleur secondaire/structurelle, 10% couleur d'accent vive pour les actions primaires et signaux clés. Ratios de contraste WCAG AA/AAA stricts.
   - **Typographie Professionnelle** : Couplage de polices intentionnel (Display/Headline + Sans corps de texte lisible + Monospace pour la télémétrie/chiffres).
   - **Hiérarchie & Densité Visuelle** : Pour les tableaux de bord et outils professionnels, privilégier une densité d'information maîtrisée (`--density 7-9`), des micro-animations fluides (`--motion`), et des composants riches avec états hover/focus soignés.
   - **Accessibilité & Finition** : États vides (empty states) illustrés, loaders squelettes, gestion du responsive parfait, contraste lisible et feedback interactif immédiat.
