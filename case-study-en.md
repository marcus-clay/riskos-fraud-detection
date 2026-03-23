# RiskOS: AI-Augmented Fraud Detection

## The Problem

Fraud teams at neobanks and European payment institutions deal with an average of 80% false positives. Every unqualified alert consumes analyst time, degrades responsiveness on real cases, and increases loss exposure. Under PSD2 regulation, detection must happen in real time, with lean teams (10 to 50 analysts) handling 80 to 150 alerts per shift.

## The Design Question

How do you design an interface where AI qualifies and contextualizes an alert in real time, without removing the analyst's control over the final decision?

## Industry and Users

**Industry**: neobanks and payment institutions (Revolut, N26, Qonto, Lydia, Stripe issuing). Modern technical stack (API-first), PSD2/DSP2 regulatory obligation for real-time detection.

**Primary user**: the Level 1 (L1) fraud analyst. First filter on the alert stream. Works at a fixed workstation with 2 to 3 screens, processes 80 to 150 alerts per 8-hour shift. Expected response time: under 60 seconds per alert.

**Secondary user**: the Level 2 (L2) fraud analyst. Receives L1 escalations, conducts in-depth investigations, contacts the customer. Handles 10 to 20 cases per day.

**Fraud types covered**:
- **Account takeover (ATO)**: a third party accesses a customer's account via stolen credentials or SIM swap. Signals: unrecognized device, inconsistent geolocation, VPN IP, abnormal velocity.
- **Card-not-present (CNP)**: online transaction with stolen card data. Signals: unusual amount, new beneficiary, atypical merchant category.
- **Authorized push payment (APP)**: the customer is manipulated through social engineering to send money voluntarily. Signals: high transfer to a recently created account, unusual time pattern.

## What RiskOS Does

A real-time detection and case management tool for L1 fraud analysts. The interface covers the full lifecycle of an alert: multivariate composite scoring (velocity, device, geolocation, amount), contextual investigation, decision-making, resolution.

## Key Features

- **Active triage inbox**: filterable list view by risk level (high, medium, low) with text search and dynamic counter. The filter persists across navigations to preserve the analyst's working context. Session bar visible (cases reviewed, blocked, escalated, average time).
- **Single-screen case view**: customer profile with KYC status, timestamped transaction timeline, risk score with detailed contributing factors, and behavioral comparison (customer's normal behavior vs. suspicious transaction) to make the anomaly immediately readable.
- **Streaming AI insight**: analysis appears in real time with semantic token coloring (amounts in amber, geolocations in red, devices in yellow, recommendations in white). A confidence indicator (percentage + number of similar cases) appears after the analysis, accompanied by an audio signal. Action buttons only appear after the AI completes its analysis. An "Ask for more context" button allows requesting additional insights.
- **Full action flow**: card block, Level 2 escalation (with AI-prefilled note), monitoring. Each action triggers a confirmation view with summary (case, user, action, review duration), PDF export, simulated Slack notification to #fraud-ops, and tracking ticket.
- **Queue processing**: the analyst can chain cases directly from the confirmation view ("Next in queue"). A queue-cleared screen displays session metrics (cases reviewed, total time, average per case).
- **Simulated connections**: connected data sources (Core Banking API, Device Fingerprint, Geo Intelligence) with latency indicator, Slack message preview sent to the team, simulated SMS notification to the customer, CRM link.

## The Thinking on Agentic Interfaces

The prototype explores an interaction model where the AI agent does not automate the decision. It prepares the analyst's cognitive ground. Four design choices embody this stance:

1. **Streaming makes reasoning visible.** The insight builds in front of the analyst, who can begin evaluating before the analysis completes. Sensitive tokens (amounts, locations, devices) highlight after streaming to guide attention.
2. **Actions are gated by analysis.** Decision buttons only appear after streaming completes, enforcing a minimum reading time and preventing reflexive decisions.
3. **Sensory feedback marks the transition.** The audio cue when the confidence indicator appears signals that the AI has finished its work and authority passes to the human.
4. **Ellipses show impact.** The analyst's action does not stay within the tool: the Slack notification, the customer SMS, the tracking ticket make visible the consequences of the decision in the real ecosystem.

## Screencasts

### 01: Triage (16s)
The L1 analyst starts their shift. The inbox shows 5 open cases, sorted by risk. They filter on "High Risk", select the most critical case (Sarah Connor, risk 92, withdrawal $12,450), and switch to the detail view with scoring, contributing factors, and behavioral comparison.

### 02: AI Insight (15s)
The AI agent analyzes the case in real time. Text appears word by word: "Device not recognized. Last known device: MacBook Pro, San Francisco. Current session originates from unregistered Android device in Kyiv, Ukraine." Sensitive tokens highlight (device in yellow, geolocation in red). The confidence indicator (94%, 7 similar cases) appears with an audio signal. Data sources (Core Banking API, Device Fingerprint, Geo Intelligence) light up sequentially to show where the analysis comes from.

### 03: Decision and Ellipses (15s)
The analyst clicks "Block Card". The confirmation view appears with the summary (case #4520, Sarah Connor, action Block, reviewed in 23s). The PDF export generates (spinner to checkmark). Two ellipses show impact outside the tool: the Slack message sent to #fraud-ops ("Account Frozen, Case #4520, Risk 92/100") and the SMS received by the customer ("Your card ending in **4520 has been temporarily frozen due to unusual activity"). The next case in queue appears.

### 04: Queue Processing (14s)
The analyst chains 5 cases in quick sequence. Each case goes through the confirmation to next in queue loop. The session bar updates in real time (blocked, escalated, safe). On the last case, the "Queue cleared" screen displays animated metrics: 5 cases reviewed, 92s total, 18s average per case.

### 05: False Positive (11s)
The Jean Dujardin case (risk 45, payment $450). The AI insight concludes "mark as safe, no action required". The analyst confirms with a single click. The case is resolved in under 10 seconds. Shows that the tool must be equally fast at disqualifying false positives as at handling real cases.

### 06: Before / After (12s)
Split screen: on the left, a raw data terminal (CSV) representing the current workflow at many institutions. On the right, the RiskOS interface with the same data, visually structured. The contrast makes the gap tangible.

### 07: Data Flow (11s)
Animated diagram of a suspicious transaction's path: Transaction > Rule Engine > Alert Queue > RiskOS (AI Insight + Human Decision) > Action (Block/Escalate/Monitor). Each step lights up sequentially. Contextualizes RiskOS within a detection system architecture.

## Stack and Scope

Functional prototype. React 18, Vite, Tailwind CSS, lucide-react. Dark mode, desktop-first. Web Audio API for audio feedback. Videos produced via Puppeteer + FFmpeg (frame-by-frame capture, H.264, 1920x1080, 30 fps).
