# SafeStep — Accessibility & Safety Map

> **Sprintathon 2026 · Track 3: Inclusive Innovation for Social Impact**

A crowdsourced, single-page web app where anyone can pin accessibility barriers and safety issues on a real map — broken ramps, poor lighting, unsafe crossings, missing Braille signage, inaccessible washrooms, and more. Reports are automatically ranked by an urgency score so that campus or city teams always have a clear, actionable priority list.

---

## Live Demo

Open `index.html` directly in any modern browser, or deploy to any static host (Netlify, Vercel, GitHub Pages — no build step required).

```bash
# No install needed. Just open:
open index.html
# or
npx serve .
```

---

## Urgency Score Formula

The core technical differentiator of SafeStep is its auto-prioritization algorithm:

```
urgency = (severityWeight × confirmations) + recencyBoost − resolvedPenalty
```

| Component | Value |
|---|---|
| `severityWeight` | High = **3** · Medium = **2** · Low = **1** |
| `recencyBoost` | Max **15 pts**, decays by half every **7 days** (exponential decay: `15 × 0.5^(ageDays/7)`) |
| `resolvedPenalty` | **−100** (pushes resolved issues below all active issues) |

**Why this formula?**  
- **Severity × confirmations** rewards issues that are both objectively serious *and* community-verified — preventing gaming by a single user.
- **Recency boost** ensures new reports surface quickly even before they accumulate confirmations.
- **Resolved penalty** (not just zero) means resolved issues drop to the bottom of the list, making the "what needs attention now" view immediately clear.

An **ⓘ info button** next to the Priority Ranking panel explains this formula inline, since it's part of the project's demo pitch.

---

## Features

| Feature | Status |
|---|---|
| 15 hardcoded seed reports (never empty on cold open) | ✅ |
| Leaflet.js map with OpenStreetMap tiles (no API key) | ✅ |
| Color-coded markers: red / amber / moss green + icons | ✅ |
| Click-to-add report flow with form | ✅ |
| Confirm button (increments community verification count) | ✅ |
| Auto-ranked urgency list (top 10, re-sorts in real time) | ✅ |
| Mark as resolved toggle (turns pin green, drops urgency) | ✅ |
| Download all reports as CSV (sorted by urgency score) | ✅ |
| Loading state for map tiles | ✅ |
| Pin-drop animation on load | ✅ |
| Severity labelled by text + icon (not color alone) | ✅ |
| Visible keyboard focus states | ✅ |
| Responsive layout (mobile: map stacks above panel) | ✅ |
| `prefers-reduced-motion` respected | ✅ |

---

## Project Framing

SafeStep is explicitly **not** scoped to "disabled people only." It's a tool for anyone who encounters a physical barrier or safety issue — women, disabled individuals, elderly people, parents with strollers, international students, delivery workers. The inclusion lens is baked into the issue taxonomy and the default framing of every report.

The "Confirm this issue" button is a simplified stand-in for community verification. A production version would require verified accounts to prevent inflation of urgency scores.

---

## Tech Stack

- **HTML / CSS / Vanilla JS** — no framework, no build step
- **Leaflet.js 1.9.4** via CDN — interactive map
- **OpenStreetMap** tiles — free, no API key
- **localStorage** — persists user-added reports across page refreshes (seed data is always hardcoded, never in localStorage)

---

## Design System

| Token | Value | Use |
|---|---|---|
| `--map-paper` | `#E4D9C8` | Page background |
| `--high` | `#C0392B` | High severity |
| `--medium` | `#D4860A` | Medium severity |
| `--low` / `--resolved` | `#3A7D44` | Low / resolved |
| `--accent` | `#2563A8` | Buttons, focus rings |
| Display font | **Barlow Condensed** 700/800 | Headings, urgency scores |
| Body font | **Inter** 400/500 | All body text |
| Mono font | **JetBrains Mono** | Scores, coordinates, timestamps |

---

## Deployed link

[![Deployed link:](https://shreyalbs.github.io/safestep-access-map/)



---

## License

MIT — free to use, adapt, and submit.
