# 8-Bit Arena — Browser MMO

A retro-styled browser MMO built with SpacetimeDB and 8bitcn/ui. Turn-based 1v1 combat where a Mage and an Orc Warrior face off with spells.

## Tech Stack

| Layer    | Technology                                                                              |
| -------- | --------------------------------------------------------------------------------------- |
| Monorepo | pnpm workspaces + Vite+ (`vp` CLI)                                                      |
| Frontend | React 19, React Router 7, TypeScript                                                    |
| Styling  | Tailwind CSS 4, shadcn/ui, [8bitcn/ui](https://8bitcn.com) (retro pixel-art components) |
| Backend  | [SpacetimeDB](https://spacetimedb.com) v2 — real-time multiplayer database              |
| Build    | Vite+ (wraps Vite, Vitest, Oxlint, Oxfmt)                                               |

## Project Structure

```
8-bit/
├── apps/
│   ├── website/                  # React frontend
│   │   ├── src/
│   │   │   ├── pages/            # Route pages (home, combat, 404)
│   │   │   ├── components/
│   │   │   │   ├── combat/       # Combat UI (arena, spells, characters, logs)
│   │   │   │   └── ui/           # shadcn + 8bitcn components
│   │   │   ├── hooks/            # useCombat — SpacetimeDB reactive state
│   │   │   ├── lib/              # SpacetimeDB client connection
│   │   │   └── generated/        # Auto-generated SpacetimeDB TypeScript bindings
│   │   └── public/               # Character sprites (wizard, orc, ogre)
│   │
│   └── spacetimedb/              # SpacetimeDB server module (TypeScript)
│       └── src/
│           ├── tables/           # player, spell, combat, combatLog
│           ├── reducers/         # joinCombat, castSpell, leaveCombat
│           ├── views/            # myCombat, myPlayer
│           └── types/            # SpellElement, CombatStatus, CharacterClass
│
├── packages/utils/               # Shared utilities
├── vite.config.ts                # Root Vite+ config
└── pnpm-workspace.yaml           # Workspace + dependency catalog
```

## Getting Started

### Prerequisites

- Node.js >= 22.12
- [SpacetimeDB CLI](https://spacetimedb.com/install) v2.x
- pnpm (managed via Vite+)

### Install & Run

```bash
# Install dependencies
vp install

# Build and publish the SpacetimeDB module
cd apps/spacetimedb
spacetime build
spacetime publish 8bit-combat

# Generate TypeScript client bindings
npm run generate

# Start the dev server (from repo root)
cd ../..
vp dev
```

Open http://localhost:5173 and navigate to `/combat`. Open a second browser tab to the same URL to start a 1v1 match.

### SpacetimeDB Module Scripts

From `apps/spacetimedb/`:

| Script             | Command                                                |
| ------------------ | ------------------------------------------------------ |
| `npm run build`    | `spacetime build`                                      |
| `npm run publish`  | `spacetime publish 8bit-combat`                        |
| `npm run generate` | Generates TS bindings to `apps/website/src/generated/` |

### Environment Variables

| Variable               | Default               | Description               |
| ---------------------- | --------------------- | ------------------------- |
| `VITE_SPACETIMEDB_URI` | `ws://127.0.0.1:3000` | SpacetimeDB WebSocket URI |
| `VITE_SPACETIMEDB_DB`  | `8bit-combat`         | Database name             |

## Combat System

**Turn-based 1v1** — Player 1 (Mage) vs Player 2 (Orc Warrior).

- Each player starts with **100 HP** and **100 Mana**
- On your turn, pick a spell from the menu to cast at your opponent
- Spells cost mana and deal damage — choose wisely
- First to reduce the opponent to 0 HP wins

### Spells

| Spell           | Element   | Damage | Mana Cost |
| --------------- | --------- | ------ | --------- |
| Fireball        | Fire      | 25     | 20        |
| Ice Shard       | Ice       | 15     | 10        |
| Lightning Bolt  | Lightning | 30     | 25        |
| Arcane Missile  | Fire      | 10     | 5         |
| Frost Nova      | Ice       | 20     | 15        |
| Chain Lightning | Lightning | 35     | 30        |

## Roadmap

### Phase 1 — Core Combat

- [x] Project setup (monorepo, React, Tailwind, 8bitcn)
- [x] Home page with retro UI components
- [x] 404 page with pixel-art ogre character
- [x] SpacetimeDB module with tables, reducers, views
- [x] Player table with identity, class, wins/losses
- [x] Spell table with element, damage, mana cost
- [x] Combat table with HP, mana, turn tracking
- [x] Combat log table for action history
- [x] Join combat / matchmaking reducer
- [x] Cast spell reducer with turn validation
- [x] Leave combat / forfeit reducer
- [x] Combat page with character sprites (Mage vs Orc)
- [x] Health bars and mana bars (8bitcn health-bar + progress)
- [x] Spell selection menu with mana cost display
- [x] Real-time combat log
- [x] Waiting screen for matchmaking
- [x] Victory/defeat screen
- [x] SpacetimeDB client integration with generated bindings

### Phase 2 — Character Progression

- [ ] Player name input and display
- [ ] XP system and leveling
- [ ] Character class selection (Mage, Warrior, Rogue, etc.)
- [ ] Class-specific spell sets
- [ ] Persistent player stats and leaderboard
- [ ] Match history

### Phase 3 — Expanded Combat

- [ ] Spell cooldowns
- [ ] Defensive spells (shields, heals)
- [ ] Status effects (burn, freeze, stun)
- [ ] Critical hits and damage variance
- [ ] Mana regeneration per turn
- [ ] Combat animations and hit effects

### Phase 4 — World & Social

- [ ] Lobby system with room codes
- [ ] Chat system (global + combat)
- [ ] Player profiles with avatars
- [ ] Friends list and challenge system
- [ ] Spectator mode

### Phase 5 — Content & Polish

- [ ] More character sprites and enemies
- [ ] Equipment / loot system
- [ ] PvE encounters (fight monsters)
- [ ] Quests and daily challenges
- [ ] Sound effects and retro music
- [ ] Mobile-responsive layout
- [ ] Deploy to maincloud (SpacetimeDB hosted)
