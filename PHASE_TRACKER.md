# Phase Tracker

> This file is automatically maintained by the Ralph Loop harness.
> It tracks which roadmap phase is being worked on and the current step within the iteration.

## Current Phase

- **phase:** 6.1
- **name:** Localization (i18n)
- **status:** in_progress

## Step Progress

- [x] Step 1: Implementation (working agent) — B10 fixed
- [x] Step 2: Code review + test writing (review agent)
- [x] Step 3: Playwright verification (evaluation agent)

## Bug Fix Queue

Remaining bugs:

- **B10** (user-reported): Shop data not translated — merchant names ("Old Barley"), merchant greetings ("Welcome, traveler! Stock up before the road ahead."), equipment/item names ("Oakwood Staff", "Traveler's Tunic", "Ranger's Cap"), stat descriptions ("+1 INT +1 WIS"), and shop UI labels ("Buy", "Sell") are all hardcoded English. Need key-based i18n lookup for all shop items, merchants, and equipment names across all 7 locales.

## Completed Phases

| Phase | Name                           | Completed |
| ----- | ------------------------------ | --------- |
| 1.1   | Location System                | done      |
| 1.2   | Mob System & Solo PvE          | done      |
| 1.3   | City Scene with Player Sprites | done      |
| 2.1   | Title System                   | done      |
| 3.1   | Guild System                   | done      |
| 3.2   | Raid Boss Fights               | done      |
| 4.1   | SpacetimeDB Server Module      | done      |
| 4.2   | Client Migration               | done      |
| 4.3   | Shared World Features          | done      |

## Log

### Iteration 1 — 2026-03-29

- Phase: 4.1 — SpacetimeDB Server Module
- Steps completed: Implementation, Code Review + Tests (132 new, 166 total), Playwright Verification
- Issues: Pages using SpacetimeDB hooks show loading state without running server (expected — client migration partial)

### Iteration 2 — 2026-03-29

- Phase: 4.2 — Client Migration
- Steps completed: Already implemented prior to harness setup (manually done)
- Issues: none

### Iteration 3 — 2026-03-29

- Phase: 4.3 — Shared World Features
- Steps completed: Implementation
- Features: Real players in city scenes, guild member online status, leaderboard, friend system
- Issues: none

### Iteration 3b — 2026-03-29

- Phase: 4.3 — Shared World Features (Playwright Verification)
- Result: 17/17 pass, 2 bugs found → fixed in 3c

### Iteration 3c — 2026-03-29

- Phase: 4.3 — Shared World Features (Bug Fixes)
- Result: All bugs resolved, phase complete

### Iteration 4 — 2026-03-30

- Phase: 6.1 — Localization (i18n)
- Steps completed: Implementation, Code Review + Tests (54 new, 297 total), Playwright Verification
- Issues: 8 categories of hardcoded strings found (B1-B8)

### Iteration 4b — 2026-03-30

- Phase: 6.1 — Localization (Bug Fix Iteration 1)
- Steps completed: Bug fixes (B1-B8), Code Review + Tests (391 total), Playwright Verification
- Result: 6/8 fixed, B3 not fixed, B7 partial, B9 (locations) user-reported

### Iteration 4c — 2026-03-30

- Phase: 6.1 — Localization (Bug Fix Iteration 2)
- Steps completed: (starting)
