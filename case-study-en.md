# RiskOS

## Agentic UX Experimentation · Fraud Detection

Victor Soussan · Product Design
Category: Agentic UX Experimentation

---

## Why This Experimentation

Agentic interfaces raise a design question that has no settled answer yet: how do you integrate an AI agent into a human decision flow without creating dependency, passivity, or distrust?

This experimentation explores that question in a context where the stakes are concrete and measurable: fraud detection in European banking. A domain where every second of cognitive latency costs money, where 80% of alerts are false positives, and where the analyst must retain control over the final decision.

RiskOS is a functional prototype built to test design hypotheses on human/AI collaboration under time pressure.

---

## The Founding Insight

Fraud analysts at European neobanks process 80 to 150 alerts per 8-hour shift. 80% of those alerts are false positives. Time wasted on false positives is time stolen from real cases.

The current tool for most teams: a CSV table, a terminal, static rules. No contextual analysis, no intelligent prioritization, no pattern memory.

---

`video:06-before-after.mp4`
**The gap between current state and proposal.**
On the left, the alert stream as it arrives in many institutions: raw CSV, data columns with no visual hierarchy. On the right, the same data structured in RiskOS. The comparison makes the cognitive cost of the current interface tangible.

---

## The Design Question

How do you design an interface where AI qualifies and contextualizes an alert in real time, without removing the analyst's control over the final decision?

Three principles guide the prototype:
- The AI prepares the analyst's cognitive ground. It does not decide in their place.
- The agent's reasoning must be visible, not just its conclusion.
- Every action must have traceable consequences in the real ecosystem.

---

`video:07-data-flow.mp4`
**Where RiskOS sits in the detection chain.**
The path of a suspicious transaction: from core banking to rule engine, from alert queue to AI analysis, to human decision. RiskOS intervenes when the alert needs judgment, not another rule.

---

## Triage: Prioritizing Under Pressure

The L1 analyst starts their shift. The inbox shows 5 open cases, sorted by risk. Filtering by level (high, medium, low) focuses attention on critical cases. The session counter tracks what has been processed and what remains.

`video:01-hero-triage.mp4`
**Frustration:** the analyst wastes time scanning an unprioritized list to identify urgent cases.
**Benefit:** color coding, risk filtering, and the dynamic counter reduce triage time to a few seconds.

---

## AI Analysis: Making Reasoning Visible

The AI agent analyzes the case in real time. Text appears word by word: pattern matching, behavioral analysis, recommendation. Sensitive tokens (amounts, geolocations, devices) highlight to guide attention. A confidence indicator quantifies the analysis certainty. Data sources (Core Banking API, Device Fingerprint, Geo Intelligence) light up to show where the intelligence comes from.

Action buttons only appear after streaming completes. This design choice enforces a minimum reading time and prevents reflexive decisions.

`video:02-ai-insight.mp4`
**Frustration:** the analyst receives a risk score without understanding why. They must mentally reconstruct the reasoning from scattered data.
**Benefit:** the AI structures weak signals into a readable narrative. The analyst understands "why" before deciding "what."

---

## Decision: Act and See the Impact

The analyst chooses an action (block, escalate, monitor). The confirmation summarizes the case, the action, and review duration. Two ellipses show the action leaving the tool: the Slack message sent to the #fraud-ops team, and the SMS received by the customer whose card was frozen.

Escalation to Level 2 includes a note pre-filled by the AI, which the analyst can edit before transmitting. Escalation becomes an act of transmission, not abandonment.

`video:03-decision-ellipses.mp4`
**Frustration:** the analyst acts in the tool but never sees the consequence of their decision. Escalations disappear into a void.
**Benefit:** every action echoes across the ecosystem (Slack, SMS, ticket). The analyst knows their decision was transmitted, received, and executed.

---

## False Positive: As Fast to Dismiss as to Handle

A medium-risk case (score 45, 450 euro payment). The AI concludes: "Transaction within acceptable range. Consistent patterns. Mark as safe." The analyst confirms with a single click. Case resolved in 8 seconds.

`video:05-false-positive.mp4`
**Frustration:** false positives consume as much time as real cases, even though they require no action.
**Benefit:** the AI qualifies false positives in seconds, freeing the analyst's attention for the cases that matter.

---

## Queue Processing: Chaining Without Friction

The analyst processes 5 cases in sequence. Each confirmation directly offers the next case. The session bar updates in real time. On the last case, a summary screen shows: 5 cases reviewed, 92 seconds total, 18 seconds average per case.

`video:04-queue-cleared.mp4`
**Frustration:** every case switch imposes a cognitive cold start. The analyst loses rhythm between files.
**Benefit:** direct chaining and session metrics maintain workflow continuity and make productivity visible.

---

## What This Experimentation Taught Me

Integrating AI into a human decision flow is not solved by automation. The design problem is more nuanced: distributing authority between the agent and the human at each step of the process.

Three mechanisms proved structurally important in this experimentation:

**Streaming as a trust-building tool.** When the AI shows its reasoning in real time, the analyst can begin evaluating before the analysis completes. Process transparency builds trust more effectively than a confidence score displayed after the fact.

**Conditional action gating.** Delaying decision buttons until the AI analysis completes enforces a minimum reading time. Under time pressure, this intentional friction protects against reflexive decisions without significantly slowing the workflow.

**Ellipses as proof of impact.** Showing the Slack notification, customer SMS, and tracking ticket after an action transforms the tool from a silo into a node in a network. The analyst sees that their decision has consequences, which reinforces accountability and work satisfaction.

These mechanisms are transferable to other B2B contexts where AI assists human decisions: regulatory compliance, medical triage, content moderation, incident management.

---

## Technical Scope

Functional prototype. React 18, Vite, Tailwind CSS, lucide-react. Dark mode, desktop-first. Web Audio API for audio feedback. Deployed on Vercel.

`link:prototype` https://riskos-gulcbxw52-hugos-projects-0ac0cf31.vercel.app
`link:github` https://github.com/marcus-clay/riskos-fraud-detection
