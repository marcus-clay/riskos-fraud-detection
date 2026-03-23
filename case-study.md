# RiskOS : détection de fraude augmentée par IA agentique

## Le problème

Les équipes fraude des néobanques et établissements de paiement européens traitent en moyenne 80 % de faux positifs. Chaque alerte non qualifiée consomme du temps analyste, dégrade la réactivité sur les cas réels et augmente le risque de perte. Sous la réglementation PSD2, la détection doit se faire en temps réel, avec des équipes réduites (10 à 50 analystes) qui gèrent 80 à 150 alertes par shift.

## La question de design

Comment concevoir une interface où l'IA qualifie et contextualise une alerte en temps réel, sans retirer à l'analyste le contrôle de la décision finale ?

## Secteur et utilisateurs

**Secteur** : néobanques et établissements de paiement (Revolut, N26, Qonto, Lydia, Stripe issuing). Stack technique moderne (API-first), obligation réglementaire PSD2/DSP2 de détection en temps réel.

**Utilisateur principal** : l'analyste fraude niveau 1 (L1). Premier filtre du flux d'alertes. Travaille sur poste fixe, 2 à 3 écrans, traite 80 à 150 alertes par shift de 8h. Temps de réponse attendu : moins de 60 secondes par alerte.

**Utilisateur secondaire** : l'analyste fraude niveau 2 (L2). Reçoit les escalades du L1, mène les investigations approfondies, contacte le client. Travaille sur 10 à 20 cas par jour.

**Types de fraude couverts** :
- **Account takeover (ATO)** : un tiers accède au compte d'un client via credentials volées ou SIM swap. Signaux : device inconnu, géolocalisation incohérente, IP VPN, vélocité anormale.
- **Card-not-present (CNP)** : transaction en ligne avec des données de carte volées. Signaux : montant inhabituel, nouveau bénéficiaire, merchant category atypique.
- **Authorized push payment (APP)** : le client est manipulé par ingénierie sociale pour envoyer de l'argent. Signaux : virement élevé vers un compte récent, pattern horaire inhabituel.

## Ce que fait RiskOS

Un outil de détection et de gestion de cas en temps réel pour les analystes fraude L1. L'interface couvre le cycle complet d'une alerte : scoring composite multivarié (vélocité, device, géolocalisation, montant), investigation contextuelle, prise de décision, résolution.

## Fonctionnalités structurantes

- **Inbox avec triage actif** : vue liste filtrable par niveau de risque (high, medium, low) avec recherche textuelle et compteur dynamique. Le filtre persiste entre les navigations pour préserver le contexte de travail de l'analyste. Barre de session visible (cas traités, bloqués, escaladés, temps moyen).
- **Fiche cas sur un seul écran** : profil client avec statut KYC, timeline transactionnelle horodatée, scoring de risque avec facteurs contributifs détaillés, et comparatif comportemental (comportement normal du client vs. transaction suspecte) pour rendre l'anomalie immédiatement lisible.
- **Insight IA en streaming** : l'analyse apparaît en temps réel avec coloration sémantique des tokens (montants en amber, géolocalisations en rouge, devices en jaune, recommandations en blanc). Un indicateur de confiance (pourcentage + nombre de cas similaires) se révèle après l'analyse, accompagné d'un signal sonore. Les boutons d'action n'apparaissent qu'après que l'IA a terminé son analyse. Un bouton « Ask for more context » permet de demander des insights complémentaires.
- **Flux d'action complet** : blocage carte, escalade niveau 2 (avec note pré-remplie par l'IA), monitoring. Chaque action déclenche une vue de confirmation avec récapitulatif (cas, utilisateur, action, durée de review), export PDF, notification Slack simulée vers #fraud-ops, et ticket de suivi.
- **Traitement en queue** : l'analyste peut enchaîner les cas directement depuis la vue de confirmation (« Next in queue »). Un écran de fin de queue affiche les métriques de session (cas traités, temps total, moyenne par cas).
- **Connexions simulées** : sources de données connectées (Core Banking API, Device Fingerprint, Geo Intelligence) avec indicateur de latence, preview Slack du message envoyé à l'équipe, notification SMS simulée au client, lien CRM.

## La réflexion sur les interfaces agentiques

Le prototype explore un modèle d'interaction où l'agent IA n'automatise pas la décision, il prépare le terrain cognitif de l'analyste. Quatre choix de design matérialisent cette posture :

1. **Le streaming rend le raisonnement visible.** L'insight se construit sous les yeux de l'analyste, qui peut commencer à évaluer avant la fin de l'analyse. Les tokens sensibles (montants, lieux, devices) se colorent après le streaming pour guider l'attention.
2. **Les actions sont conditionnées à l'analyse.** Les boutons de décision n'apparaissent qu'après le streaming complet, imposant un temps de lecture minimum et empêchant la décision réflexe.
3. **Le feedback sensoriel marque la transition.** Le son à l'apparition de l'indicateur de confiance signale que l'IA a terminé son travail et que l'autorité passe à l'humain.
4. **Les ellipses montrent l'impact.** L'action de l'analyste ne reste pas dans l'outil : la notification Slack, le SMS client, le ticket de suivi rendent visibles les conséquences de la décision dans l'écosystème réel.

## Screencasts

### 01 : Triage (16s)
L'analyste L1 ouvre son shift. L'inbox affiche 5 cas ouverts, triés par risque. Il filtre sur « High Risk », sélectionne le cas le plus critique (Sarah Connor, risk 92, withdrawal $12,450), et bascule sur la vue détaillée avec le scoring, les facteurs contributifs et le comparatif comportemental.

### 02 : AI Insight (15s)
L'agent IA analyse le cas en temps réel. Le texte apparaît mot par mot : « Device not recognized. Last known device: MacBook Pro, San Francisco. Current session originates from unregistered Android device in Kyiv, Ukraine. » Les tokens sensibles se colorent (device en jaune, géolocalisation en rouge). L'indicateur de confiance (94 %, 7 cas similaires) apparaît avec un signal sonore. Les sources de données (Core Banking API, Device Fingerprint, Geo Intelligence) s'allument séquentiellement pour montrer d'où vient l'analyse.

### 03 : Décision et ellipses (15s)
L'analyste clique « Block Card ». La vue de confirmation apparaît avec le récapitulatif (cas #4520, Sarah Connor, action Block, reviewé en 23s). L'export PDF se génère (spinner > checkmark). Deux ellipses montrent l'impact hors de l'outil : le message Slack envoyé à #fraud-ops (« Account Frozen, Case #4520, Risk 92/100 ») et le SMS reçu par la cliente (« Your card ending in **4520 has been temporarily frozen due to unusual activity »). Le prochain cas en queue s'affiche.

### 04 : Queue processing (14s)
L'analyste enchaîne 5 cas en séquence rapide. Chaque cas passe par la boucle confirmation > next in queue. La barre de session se met à jour en temps réel (blocked, escalated, safe). Au dernier cas, l'écran « Queue cleared » affiche les métriques animées : 5 cas reviewés, 92s au total, 18s de moyenne par cas.

### 05 : Le faux positif (à produire)
Le cas Jean Dujardin (risk 45, payment $450). L'insight IA conclut « mark as safe, no action required ». L'analyste confirme en un clic. Le cas est résolu en moins de 10 secondes. Montre que l'outil doit être aussi rapide à disqualifier les faux positifs qu'à traiter les cas réels.

### 06 : Avant/après (à produire)
Écran split : à gauche, un tableau de données brut (terminal ou Excel) représentant le workflow actuel de nombreux établissements. À droite, l'interface RiskOS avec les mêmes données, structurées visuellement. Le contraste rend le gap tangible.

### 07 : Le flux de données (à produire)
Schéma animé du parcours d'une transaction suspecte : Transaction > Rule Engine > Alert Queue > RiskOS (AI Insight + Human Decision) > Action (Block/Escalate/Monitor). Chaque étape s'illumine séquentiellement. Contextualise RiskOS dans l'architecture d'un système de détection.

## Stack et périmètre

Prototype fonctionnel. React 18, Vite, Tailwind CSS, lucide-react. Dark mode, desktop-first. Web Audio API pour le feedback sonore. Vidéos produites via Puppeteer + FFmpeg (capture frame-par-frame, H.264, 1920x1080, 30 fps).
