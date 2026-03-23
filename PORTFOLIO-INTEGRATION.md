# Instructions d'intégration portfolio : RiskOS

Ce fichier contient toutes les informations nécessaires pour publier le case study RiskOS sur victorsoussan.fr/fr/projets. Transmettre ce fichier à Claude Code dans le projet portfolio.

---

## Métadonnées du projet

```yaml
slug: riskos
title_fr: "RiskOS"
title_en: "RiskOS"
subtitle_fr: "Détection de fraude augmentée par IA agentique"
subtitle_en: "AI-Augmented Fraud Detection"
category_fr: "Expérimentation UX agentiques"
category_en: "Agentic UX Experimentation"
author: "Victor Soussan"
role: "Product Design"
date: "2026-03"
status: "published"
featured: true
tags:
  - agentic-ux
  - fraud-detection
  - ai-interface
  - fintech
  - prototype
  - react
stack:
  - React 18
  - Vite
  - Tailwind CSS
  - lucide-react
  - Web Audio API
  - Puppeteer
  - FFmpeg
links:
  prototype: "https://riskos-gulcbxw52-hugos-projects-0ac0cf31.vercel.app"
  github: "https://github.com/marcus-clay/riskos-fraud-detection"
```

---

## Assets à récupérer

### Cloner le repo

```bash
git clone https://github.com/marcus-clay/riskos-fraud-detection.git
```

### Vidéos (dossier `videos/`)

Toutes les vidéos sont en MP4, H.264, 1920x1080, 30 fps. Embed en autoplay, loop, muted, playsinline.

| Fichier | Durée | Poids | Position dans le case study |
|---|---|---|---|
| `00-live-prototype.mp4` | 19s | 303 Ko | Optionnel, hero alternatif |
| `01-hero-triage.mp4` | 16s | 338 Ko | Section « Le triage » |
| `02-ai-insight.mp4` | 15s | 316 Ko | Section « L'analyse IA » |
| `03-decision-ellipses.mp4` | 15s | 372 Ko | Section « La décision » |
| `04-queue-cleared.mp4` | 14s | 297 Ko | Section « Le traitement en queue » |
| `05-false-positive.mp4` | 11s | 262 Ko | Section « Le faux positif » |
| `06-before-after.mp4` | 12s | 391 Ko | Section « L'insight fondateur » (après le texte) |
| `07-data-flow.mp4` | 11s | 249 Ko | Section « La question de design » (après le texte) |

### Screenshots (dossier `screenshots/`)

Retina 2x (3840x2160). Pour les thumbnails, og:image, ou illustrations statiques.

| Fichier | Contenu |
|---|---|
| `01-inbox.png` | Vue inbox avec 5 cas |
| `02-case-detail.png` | Vue cas détaillée (risk + timeline + profil) |
| `03-ai-insight-complete.png` | Insight IA terminé avec boutons d'action |
| `04-confirmation.png` | Confirmation post-action |
| `05-inbox-session.png` | Inbox avec barre de session |

### Texte du case study

- `case-study.md` : version française
- `case-study-en.md` : version anglaise

Le format utilise des balises `video:` et `link:` pour indiquer où placer les vidéos et liens. Syntaxe :
- `` `video:filename.mp4` `` : insérer la vidéo ici (autoplay, loop, muted, plein écran)
- `` `link:prototype` URL `` : lien vers le prototype
- `` `link:github` URL `` : lien vers le repo

---

## Structure de la page

Le case study suit le pattern Late Checkout Agency : sections espacées, vidéos plein écran, texte qui cadre sans dominer.

### Ordre des sections

1. **Header** : titre « RiskOS », sous-titre, catégorie, auteur
2. **Section texte** : « Pourquoi cette expérimentation » (3 paragraphes)
3. **Section texte** : « L'insight fondateur » (2 paragraphes)
4. **Vidéo plein écran** : `06-before-after.mp4` avec légende (frustration/bénéfice)
5. **Section texte** : « La question de design » (3 bullet points)
6. **Vidéo plein écran** : `07-data-flow.mp4` avec légende
7. **Section texte + vidéo** : « Le triage » + `01-hero-triage.mp4` avec légende
8. **Section texte + vidéo** : « L'analyse IA » + `02-ai-insight.mp4` avec légende
9. **Section texte + vidéo** : « La décision » + `03-decision-ellipses.mp4` avec légende
10. **Section texte + vidéo** : « Le faux positif » + `05-false-positive.mp4` avec légende
11. **Section texte + vidéo** : « Le traitement en queue » + `04-queue-cleared.mp4` avec légende
12. **Section texte** : « Ce que cette expérimentation m'a appris » (3 blocs)
13. **Section technique** : stack + liens prototype/GitHub
14. **Thumbnail og:image** : utiliser `screenshots/02-case-detail.png`

### Format des légendes vidéo

Chaque vidéo est accompagnée de :
- **Un titre en gras** (une phrase, ce que la vidéo montre)
- **Frustration** : le problème utilisateur auquel la fonctionnalité répond (préfixé « Frustration : »)
- **Bénéfice** : la valeur apportée (préfixé « Bénéfice : »)

### Style des vidéos

```html
<video
  src="/assets/projets/riskos/videos/01-hero-triage.mp4"
  autoplay
  loop
  muted
  playsinline
  style="width: 100%; border-radius: 12px;"
></video>
```

---

## Commandes à exécuter

### 1. Copier les assets dans le projet portfolio

```bash
# Adapter les chemins selon la structure du site
DEST="src/content/projets/riskos"  # ou le chemin de ton CMS
mkdir -p "$DEST/videos" "$DEST/screenshots"

# Depuis le repo cloné
cp videos/*.mp4 "$DEST/videos/"
cp screenshots/*.png "$DEST/screenshots/"
cp case-study.md "$DEST/content-fr.md"
cp case-study-en.md "$DEST/content-en.md"
```

### 2. Vérifier les vidéos

```bash
# Toutes les vidéos doivent être lisibles
for f in "$DEST/videos/"*.mp4; do
  echo "$f: $(ffprobe -v quiet -print_format json -show_format "$f" | grep duration | head -1)"
done
```

### 3. Publier

Dépend de la stack du site portfolio. Si Next.js :
- Placer les vidéos dans `public/assets/projets/riskos/videos/`
- Placer les screenshots dans `public/assets/projets/riskos/screenshots/`
- Créer la page projet en utilisant le contenu de `case-study.md`

---

## Checklist avant publication

- [ ] Vidéos en autoplay/loop/muted (pas de contrôles visibles par défaut)
- [ ] Légendes sous chaque vidéo (titre + frustration + bénéfice)
- [ ] Liens prototype Vercel et GitHub fonctionnels
- [ ] Screenshot og:image configuré (`02-case-detail.png`)
- [ ] Catégorie « Expérimentation UX agentiques » visible sur la page
- [ ] Versions FR et EN du contenu
- [ ] Vidéos dans l'ordre narratif (pas dans l'ordre numérique : 06, 07, 01, 02, 03, 05, 04)
