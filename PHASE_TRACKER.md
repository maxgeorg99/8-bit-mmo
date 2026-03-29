# Phase Tracker

> This file is automatically maintained by the Ralph Loop harness.
> It tracks which roadmap phase is being worked on and the current step within the iteration.

## Current Phase

- **phase:** 4.3
- **name:** Shared World Features
- **status:** in_progress

## Step Progress

- [ ] Step 1: Implementation (working agent)
- [ ] Step 2: Code review + test writing (review agent)
- [ ] Step 3: Playwright verification (evaluation agent)

## Bug Fix Queue

| ID  | Severity | Page        | Description                                                                                                                                                                                                     |
| --- | -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Medium   | Leaderboard | Duplicate player entry: real player appears twice (as "TestHero" and "TestHero (You)"), causing React duplicate key errors. Deduplicate NPC + real player list by name/identity and use unique ID as React key. |
| B2  | Low      | Leaderboard | Grammar: "1 players online" should be "1 player online" (singular form when count is 1).                                                                                                                        |

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
- Features: Real players in city scenes (already working from 4.2 biome_players view), guild member online status (already working from 4.2), leaderboard with real SpacetimeDB data + guild names + online indicators, friend system (send/accept/reject/remove, friend list with online status, stat comparison, PvP challenge from friend list)
- Server changes: friendship table, send_friend_request/accept_friend_request/reject_friend_request/remove_friend reducers, my_friends view
- Client changes: /friends page, useFriends hook, updated leaderboard with guild name resolution + online indicators, Friends button on dashboard
- Issues: none

### Iteration 3b — 2026-03-29

- Phase: 4.3 — Shared World Features (Playwright Verification)
- Steps completed: Playwright verification run
- Result: 17/17 functional checks pass, 2 bugs found
- Bug B1 (Medium): Leaderboard duplicate player entry + React key collision
- Bug B2 (Low): Leaderboard "1 players online" grammar
- Verification report: `apps/reallife-mmo/docs/verification/phase-4.3.md`
- Screenshots saved to: `apps/reallife-mmo/docs/verification/screenshots/`
- Steps 1-3 unchecked pending bug fixes
