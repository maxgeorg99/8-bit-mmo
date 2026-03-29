# CLAUDE.md — Reallife MMO

> This file is the authoritative context document for all AI-assisted development sessions on Reallife MMO.
> Read this fully before touching any code.

---

## 1. Project Overview

**Reallife MMO** is a browser-based idle RPG where real-world habits, fitness, and learning directly power an in-game character. It is a freemium, PWA-first web app with real-time multiplayer state via SpacetimeDB.

**Elevator pitch:** Your life is the grind. The gym bro becomes a Tank, the PhD student becomes a Mage, the runner becomes a Rogue — all emergent from real logged activity. Daily quests, async PvP, and guild raids give the habit loop genuine MMO stakes.

**Full product spec:** See `docs/GDD.md` (or the Word document `reallife-mmo-gdd.docx`) for the complete Game Design Document including all system details, class definitions, stat formulas, and roadmap.

---

## 2. Tech Stack

### Frontend

| Concern        | Choice                    |
| -------------- | ------------------------- |
| Framework      | React 19 + TypeScript     |
| Build tool     | Vite                      |
| UI components  | shadcn/ui                 |
| Styling        | Tailwind CSS v4           |
| State (client) | Zustand                   |
| Routing        | TanStack Router           |
| PWA            | Vite PWA plugin (Workbox) |

### Backend / Game State

| Concern            | Choice                             |
| ------------------ | ---------------------------------- |
| Database + server  | SpacetimeDB (typescript module)    |
| Auth               | SpacetimeDB Identity (token-based) |
| Hosting (backend)  | SpacetimeDB Cloud                  |
| Hosting (frontend) | Vercel                             |

### External APIs

| Concern             | Choice                                             |
| ------------------- | -------------------------------------------------- |
| Food/nutrition data | Open Food Facts (`world.openfoodfacts.org/api/v2`) |
| Fitness sync (MVP)  | Manual logging only                                |
| Fitness sync (v1.2) | Strava OAuth 2.0                                   |

### Tooling

| Concern         | Choice                   |
| --------------- | ------------------------ |
| Package manager | pnpm                     |
| Linting         | ESLint + Biome           |
| Testing         | Vitest + Testing Library |
| CI              | GitHub Actions           |

---

## 3. Repository Structure

```
reallife-mmo/
├── CLAUDE.md                    ← you are here
├── docs/
│   └── GDD.md                   ← full game design document
├── apps/
│   └── web/                     ← React PWA
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/          ← shadcn/ui generated components (DO NOT EDIT)
│       │   │   └── game/        ← game-specific components
│       │   │       ├── CharacterCard.tsx
│       │   │       ├── StatBar.tsx
│       │   │       ├── QuestCard.tsx
│       │   │       ├── ActivityLogger.tsx
│       │   │       ├── GuildPanel.tsx
│       │   │       └── RaidPanel.tsx
│       │   ├── hooks/
│       │   │   ├── useSpacetimeDB.ts   ← connection singleton + subscriptions
│       │   │   ├── usePlayer.ts
│       │   │   ├── useQuests.ts
│       │   │   ├── useGuild.ts
│       │   │   └── usePvp.ts
│       │   ├── lib/
│       │   │   ├── stdb.ts             ← SpacetimeDB client singleton
│       │   │   ├── statEngine.ts       ← activity → stat delta calc (mirrors server)
│       │   │   ├── classEngine.ts      ← class derivation logic (mirrors server)
│       │   │   └── fitParser.ts        ← FIT/GPX parsing (post-MVP)
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── Character.tsx
│       │   │   ├── Quests.tsx
│       │   │   ├── Guild.tsx
│       │   │   └── Leaderboard.tsx
│       │   ├── types/
│       │   │   └── stdb-generated.ts   ← auto-generated from SpacetimeDB module
│       │   └── main.tsx
│       ├── public/
│       │   └── manifest.json
│       └── vite.config.ts
└── server/                      ← SpacetimeDB Rust module
    ├── src/
    │   ├── lib.rs               ← module entry point
    │   ├── tables/
    │   │   ├── player.rs
    │   │   ├── activity_log.rs
    │   │   ├── quest.rs
    │   │   ├── guild.rs
    │   │   ├── raid.rs
    │   │   └── item.rs
    │   ├── reducers/
    │   │   ├── activity.rs      ← log_activity reducer
    │   │   ├── quest.rs         ← claim_quest, generate_daily_quests
    │   │   ├── pvp.rs           ← challenge_pvp, refresh_shadow
    │   │   ├── guild.rs         ← create_guild, join_guild, start_raid
    │   │   └── idle_tick.rs     ← scheduled: every 1 hour
    │   ├── logic/
    │   │   ├── stat_engine.rs   ← delta calculation, diminishing returns
    │   │   ├── class_engine.rs  ← derive_class from activity profile
    │   │   └── combat.rs        ← deterministic combat resolution
    │   └── types.rs             ← enums: ActivityType, PlayerClass, QuestType, etc.
    └── Cargo.toml
```

---

## 4. Core Domain Models

### PlayerClass (enum)

```rust
pub enum PlayerClass {
    Warrior,   // STR/CON dominant — heavy lifting
    Mage,      // INT/MP dominant — learning/reading
    Rogue,     // AGI/Crit dominant — cardio/running
    Paladin,   // STR+CON+WIS — gym + nutrition + sleep
    Druid,     // WIS/CON — yoga/meditation/cooking
    Ranger,    // AGI+STR — mixed cardio + outdoor
    Bard,      // CHA/WIS — creative/social goals
    Scholar,   // INT/WIS — courses/research
    Unclassed, // < 7 days of data
}
```

### ActivityType (enum)

```rust
pub enum ActivityType {
    StrengthTraining,
    Cardio,
    Hiit,
    MindLearning,    // reading, lectures, online courses
    Nutrition,       // cooking, logging healthy meals
    Hydration,       // water intake
    Sleep,
    Mindfulness,     // meditation, yoga, journaling
    Creativity,      // music, art, writing
}
```

### Stat Delta Formula

```
delta = base_rate[activity_type] × (duration_min / 60) × intensity_multiplier × streak_multiplier

intensity_multiplier = 0.5 + (intensity / 20)   // intensity is 1-10, gives 0.55 to 1.0
streak_multiplier    = min(1.0 + (streak_days * 0.0167), 1.5)  // grows to 1.5x at 30 days
```

Sessions are capped at 180 minutes. The 4th+ same-type activity in one day yields 25% of normal deltas (diminishing returns anti-abuse rule).

### Class Derivation

Class is computed from a rolling 30-day activity log. Each activity type contributes weighted points toward class archetypes. The archetype with the highest score is the current class. This runs server-side in `class_engine.rs` and is called after every `log_activity` reducer.

Class **commitment** unlocks at Level 20. A committed player gets +10% primary stat gain for their class. The class still drifts: 30 consecutive days of divergent activity triggers a Drift Warning, and reclassification occurs 14 days later if the profile hasn't shifted back.

---

## 5. SpacetimeDB Conventions

- **Module language:** Typescript
- **Client SDK:** `@clockworklabs/spacetimedb-sdk` (TypeScript)
- **All game state lives in SpacetimeDB.** The React app is a thin subscriber — it never holds canonical state.
- **Subscriptions:** Subscribe per-page to only the tables needed. Do not subscribe to everything globally.
- **Reducers are the only write path.** Never attempt to mutate state client-side; always call a reducer and let the subscription update fire.
- **Generated types** from `spacetime generate --lang typescript` go into `src/types/stdb-generated.ts`. Regenerate after any schema change.
- **Idle tick** is a `#[spacetimedb::reducer(repeat = 1hour)]` — do not implement polling on the client.

### SpacetimeDB Client Singleton Pattern

```typescript
// lib/stdb.ts
import { SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";

let client: SpacetimeDBClient | null = null;

export function getClient(): SpacetimeDBClient {
  if (!client) {
    client = new SpacetimeDBClient(
      import.meta.env.VITE_STDB_HOST,
      import.meta.env.VITE_STDB_MODULE,
    );
  }
  return client;
}
```

---

## 6. Key Business Rules (Enforce in Reducers)

These rules must be validated **server-side** in the SpacetimeDB Rust module. Never trust the client.

| Rule                | Details                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| Session cap         | Max 180 minutes per logged activity                                      |
| Daily same-type cap | 4th+ same-type activity/day = 25% delta                                  |
| Intensity range     | Must be 1–10 (inclusive). Reject outside range.                          |
| Streak shield       | Free: 1/week. Premium: 3/week. Reduces missed days.                      |
| Class commitment    | Requires Level >= 20. Only one committed class at a time.                |
| Drift warning       | After 30 days divergent profile. Reclassification after further 14 days. |
| Shadow refresh      | PvP shadows update every 24 hours via idle_tick.                         |
| PvP cooldown        | Same opponent cannot be challenged more than once per 24 hours.          |
| Raid window         | 7 days. Power = sum of member stat gains during window.                  |
| Guild size          | 3 minimum for raids. 20 maximum (expandable via guild upgrades).         |

---

## 7. Habitica Reference (Study, Don't Copy)

Habitica's source is at `https://github.com/HabitRPG/habitica`. Their code is **GPL v3** and their assets are **CC-BY-NC-SA 3.0** (non-commercial). Since Reallife MMO is a commercial freemium product, **do not copy any code or assets**.

However, the following Habitica source directories are valuable references for algorithm design and game balance — study them, then reimplement independently:

| Habitica path                              | What to learn                                          |
| ------------------------------------------ | ------------------------------------------------------ |
| `website/common/script/ops/scoreTask.js`   | How they calculate XP/stat deltas from task completion |
| `website/common/script/statHelpers.js`     | HP/MP/XP formulas, level scaling curves                |
| `website/common/script/content/classes.js` | Class stat bonuses, skill definitions                  |
| `website/common/script/ops/buyGear.js`     | Inventory / reward logic patterns                      |
| `website/common/script/libs/`              | Utility helpers for game math                          |

Their XP level curve (`Math.ceil(((lvl^2)*0.25) + 10*lvl + 139.75)`) is well-tuned and worth studying as a baseline before defining your own. Their stat-to-damage conversion in `statHelpers.js` is also a good reference for combat scaling.

**Key differences from Habitica to always keep in mind:**

- We are **activity/duration based**, not task-checkbox based
- Our classes are **emergent and drift** — Habitica classes are chosen
- We have **real-time idle combat** — Habitica's battles are manual turn-based
- Our social layer is **guild raids** — Habitica has parties but no async raid system
- We use **SpacetimeDB**, not MongoDB + Node

---

## 8. UI/UX Conventions

- **Component library:** shadcn/ui. Run `npx shadcn@latest add <component>` to add new components. Never hand-roll UI primitives that shadcn covers.
- **Theming:** Dark mode first. The game aesthetic is dark RPG with accent colours per class (Warrior = red, Mage = purple, Rogue = green, etc.).
- **Mobile first:** Design for 375px viewport. Expand to desktop. Use Tailwind responsive prefixes (`md:`, `lg:`).
- **Loading states:** Every async operation (reducer call, subscription connect) must have a skeleton or spinner. Never show a blank screen.
- **Error states:** Always handle SpacetimeDB connection failure gracefully with a reconnect UI.
- **Activity logger UX:** Target under 15 seconds from tap to confirmed log for a returning user. Prefer large touch targets, default to last-used values.
- **Stat changes:** Animate stat bar changes when they update from a subscription push. Use a brief highlight + count-up animation.

---

## 9. MVP Scope (Build This First)

The MVP is **v1.0**. Do not build beyond this scope without explicit instruction.

### In MVP

- [ ] SpacetimeDB module: `player`, `activity_log`, `quest` tables
- [ ] Reducers: `create_player`, `log_activity`, `claim_quest`
- [ ] Scheduled reducer: `idle_tick` (stamina regen, streak check, daily quest generation)
- [ ] Class derivation (read-only display — no commitment yet)
- [ ] React app: Dashboard, Character, Activity Logger, Quests pages
- [ ] Friend system: add by username, friend feed
- [ ] Guild: create, join, member list
- [ ] Basic cosmetics: earned through gameplay only (no shop yet)
- [ ] PWA: manifest, service worker, offline queue for activity logs
- [ ] Auth: SpacetimeDB Identity + Google OAuth

### NOT in MVP (do not implement)

- Async PvP / shadow fights (v1.1)
- Guild raids (v1.1)
- Class commitment mechanic (v1.1)
- Premium subscription / payment (v1.1)
- Strava OAuth (v1.2)
- Food barcode scanner (v1.2)
- Multiclass / prestige (post-v1.2)

---

## 10. Environment Variables

```bash
# apps/web/.env.local
VITE_STDB_HOST=localhost:3000          # or your SpacetimeDB Cloud URL
VITE_STDB_MODULE=reallife-mmo          # module name as published
VITE_GOOGLE_CLIENT_ID=                 # for Google OAuth
VITE_APP_ENV=development               # development | production
```

```bash
# Never commit .env.local — it is gitignored
# For CI/CD, set these as GitHub Actions secrets
```

---

## 11. Running Locally

```bash
# Prerequisites: pnpm, Rust toolchain, SpacetimeDB CLI

# Install SpacetimeDB CLI
curl -sSf https://install.spacetimedb.com | sh

# Clone and install
git clone https://github.com/YOUR_ORG/reallife-mmo
cd reallife-mmo
pnpm install

# Start local SpacetimeDB instance
spacetime start

# Publish the server module
cd server
spacetime publish reallife-mmo --skip-clippy

# Generate TypeScript types
spacetime generate --lang typescript --out-dir ../apps/web/src/types/stdb-generated

# Start the React dev server
cd ../apps/web
pnpm dev
```

---

## 12. Testing Strategy

- **Unit tests (Vitest):** `statEngine.ts`, `classEngine.ts` — pure functions, fully testable without SpacetimeDB
- **Component tests (Testing Library):** ActivityLogger, StatBar, QuestCard
- **Integration tests:** SpacetimeDB reducer logic tested via Rust unit tests in `server/src/`
- **E2E (Playwright, post-MVP):** Full login → log activity → see stat change flow

Run tests:

```bash
pnpm test           # Vitest unit + component tests
```

---

## 13. Git Conventions

- **Branches:** `main` (production), `develop` (integration), `feature/<name>`, `fix/<name>`
- **Commits:** Conventional commits — `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`
- **PRs:** Squash merge into `develop`. Direct push to `main` only for hotfixes.
- **SpacetimeDB deploys:** Publishing a new module version is a manual step — always test locally first.

---

## 14. Agent Working Instructions

When implementing features, follow this order:

1. **Schema first** — define or update SpacetimeDB tables in `server/src/tables/`
2. **Reducer logic** — implement business rules in `server/src/reducers/` and `server/src/logic/`
3. **Publish module** — `spacetime publish reallife-mmo` and regenerate TS types
4. **Hook layer** — write or update React hooks in `apps/web/src/hooks/`
5. **UI last** — build the component, wire to hooks

**Always:**

- Validate all inputs server-side in Rust reducers — never trust client data
- Check the business rules table in Section 6 before implementing any reducer
- Use the SpacetimeDB subscription pattern — never poll or fetch manually
- Keep `statEngine.ts` and `classEngine.ts` in sync with their Rust counterparts so the UI can show delta previews before confirming a log

**Never:**

- Directly mutate SpacetimeDB state from the client (use reducers)
- Add shadcn components manually — always use the CLI
- Copy code from Habitica's repository (GPL v3 / CC-BY-NC-SA — see Section 7)
- Build features outside the MVP scope without explicit confirmation
- Use `any` in TypeScript — use generated SpacetimeDB types

---

## 15. Key Reference Links

| Resource                         | URL                                                         |
| -------------------------------- | ----------------------------------------------------------- |
| SpacetimeDB Docs                 | https://spacetimedb.com/docs                                |
| SpacetimeDB Rust SDK             | https://docs.rs/spacetimedb/latest                          |
| SpacetimeDB TS Client            | https://github.com/clockworklabs/spacetimedb-typescript-sdk |
| shadcn/ui                        | https://ui.shadcn.com                                       |
| Tailwind CSS v4                  | https://tailwindcss.com/docs                                |
| Habitica source (reference only) | https://github.com/HabitRPG/habitica                        |
| Open Food Facts API              | https://world.openfoodfacts.org/api/v2                      |
| Vite PWA Plugin                  | https://vite-pwa-org.netlify.app                            |
| Product GDD                      | `docs/GDD.md`                                               |
