# Reallife MMO — Master Roadmap

> Last updated: 2026-03-22
> This is the living roadmap for Reallife MMO. Each phase is designed to be tackled independently across sessions.

---

## Current State

**What exists today:**

- 10 activity types with stat deltas, XP, streaks, diminishing returns (client-side Zustand)
- 9 classes derived from 30-day activity profile (client-side)
- 9 biomes with SVG world map, travel, theme switching, unlock progression
- Equipment system (4 slots, 5 rarities, milestone-based drops)
- Daily + custom quests with auto-refresh
- Real-time 1v1 PvP combat via SpacetimeDB (spells, HP/mana, turn-based)
- Full Zustand store with localStorage persistence
- PWA support

**Vision:**
A Final Fantasy-style shared overworld where you see other players standing in biome cities, inspect their gear and titles, form guilds, and raid bosses together — all powered by real-world habits.

---

## Phase 1: Locations & Solo PvE Combat

> **Goal:** Make biomes explorable and give players something to fight
> **Status:** Not started

### 1.1 — Location System

- Add 3 location types per biome: **City**, **Wilderness**, **Boss Lair**
- **City**: heal HP, buy/sell items (NPC shop), see other players idling
- **Wilderness**: encounter mobs, earn loot and XP from combat
- **Boss Lair**: locked until guild raid system (Phase 3), shows boss preview
- New types: `LocationType = "city" | "wilderness" | "boss_lair"`
- Extend `BiomeMeta` with locations array
- New page: location view (entered from world map region click → location select)

**Key files:**

- `src/lib/biomeThemes.ts` — add locations per biome
- `src/lib/types.ts` — LocationType, Location interface
- `src/pages/world-map.tsx` — after travel, show location picker
- New: `src/pages/location.tsx` — location scene page
- New: `src/components/game/LocationScene.tsx` — renders city/wilderness/boss lair

### 1.2 — Mob System & Solo PvE

- Define mobs per biome/wilderness (name, HP, stats, element, loot table)
- Reuse existing turn-based combat components (CombatArena, SpellMenu, etc.)
- PvE runs locally (no SpacetimeDB needed yet) — player vs AI mob
- AI: simple priority-based spell selection (highest damage affordable spell)
- Mob difficulty scales with biome tier (Plains = easy, Celestial = endgame)
- Victory rewards: XP + chance for equipment drops from mob loot table
- Defeat: lose some HP, return to city to heal

**Key files:**

- New: `src/lib/mobs.ts` — mob definitions per biome
- New: `src/lib/combatEngine.ts` — local turn-based combat resolution
- New: `src/hooks/usePveCombat.ts` — local combat state machine
- Modify: `src/components/combat/*` — make work for both PvP and PvE
- New: `src/pages/pve-combat.tsx` — PvE battle page

### 1.3 — City Scene with Player Sprites

- City view shows pixel-art player sprites standing around
- Initially: your own character + NPC merchants
- Later (after SpacetimeDB migration): show real players in same biome
- Tap NPC → shop dialog (buy/sell items)
- Resting at city restores HP to full

**Status:** Done

**Key files:**

- `src/components/game/LocationScene.tsx` — CityScene inline component with sprites, heal, shop
- `src/components/game/ShopDialog.tsx` — Buy/sell dialog with biome-specific gear
- `src/lib/shopItems.ts` — Shop inventories, merchants, and sell prices per biome

---

## Phase 2: Titles & Achievements

> **Goal:** Give players bragging rights for real-world and in-game accomplishments
> **Status:** Not started

### 2.1 — Title System

- Two categories: **Real-world** and **In-game** titles
- Player selects ONE active title displayed under name on overworld
- Title visible when inspecting any player

**Real-world titles:**
| Title | Requirement |
|-------|-------------|
| Marathon Finisher | Log 42km+ single cardio session |
| Iron Will | 30-day activity streak |
| Century | 100 total activities logged |
| Sub 2h Half Marathon | Log cardio ≥21km in <120min |
| Master of Engineering | 500 hours MindLearning |
| Zen Master | 100 mindfulness sessions |
| Early Bird | 50 activities logged before 7am |
| Night Owl | 50 activities logged after 10pm |

**In-game titles:**
| Title | Requirement |
|-------|-------------|
| Dragonslayer | Defeat any raid boss |
| World Explorer | Unlock all 9 biomes |
| Legendary | Equip a legendary item |
| Gladiator | Win 50 PvP matches |
| Guild Champion | Complete 10 guild raids |
| First Blood | Win first PvP match |
| Class Master | Reach Level 50 |

**Key files:**

- New: `src/lib/titles.ts` — title definitions & unlock checker
- `src/lib/types.ts` — Title interface, `activeTitle` + `unlockedTitles` on Player
- `src/lib/gameStore.ts` — title unlock checks
- `src/components/game/CharacterAvatar.tsx` — show active title
- New: `src/components/game/TitleSelector.tsx`
- `src/pages/character.tsx` — add title section

---

## Phase 3: Guilds & Raid Bosses

> **Goal:** The endgame social loop — form groups and take down biome bosses
> **Status:** Not started

### 3.1 — Guild System

- Create guild (name, tag, description)
- Join guild (browse or invite link)
- Guild member list with levels, classes, online status
- Guild size: 3 minimum for raids, 20 maximum
- Guild chat (simple message board initially)

### 3.2 — Raid Boss Fights

- Each biome has one raid boss (already defined in `biomeThemes.ts`)
- Guild leader initiates raid → members opt in (7-day contribution window)
- Raid power = sum of member stat gains during raid window
- Boss HP scales with guild size (small guilds can still win)
- Turn-based group combat: each member takes turns casting spells
- Boss has unique mechanics per biome
- Rewards: rare/epic/legendary gear + exclusive raid titles

**Boss roster:**
| Biome | Boss | Mechanic Theme |
|-------|------|----------------|
| Plains | Thornback the Elder | Nature/thorns |
| Tundra | The Frostlord | Ice/freeze |
| Volcano | Ignisfury | Fire/AoE |
| Forest | Rootwarden | Heal/regen |
| Dungeon | Shadow Baron | Darkness/debuff |
| Desert | King Stonefist | Earth/stun |
| Spire | The Archivist | Arcane/silence |
| Ruins | Skarveth the Undying | Undead/drain |
| Celestial | The Architect | Cosmic/phase |

**Key files:**

- New: `src/lib/raidEngine.ts`, `src/lib/bossDefinitions.ts`
- New: `src/pages/guild.tsx`, `src/pages/raid.tsx`
- New: `src/components/game/GuildPanel.tsx`, `RaidLobby.tsx`, `RaidBattle.tsx`

---

## Phase 4: SpacetimeDB Migration

> **Goal:** Move all game state server-side for true shared-world multiplayer
> **Status:** Not started
> **Depends on:** Phases 1-3 (gameplay systems built first)

### 4.1 — Server Module (Rust)

Migrate all tables and logic to SpacetimeDB Rust module:

**Tables:**

```
Player, ActivityLog, Quest, Equipment, Guild, GuildMember,
Raid, RaidParticipant, Title, Combat, CombatLog, Mob
```

**Reducers:**

```
create_player, log_activity, claim_quest, create_custom_quest,
equip_item, unequip_item, travel_to_biome,
create_guild, join_guild, leave_guild, start_raid, contribute_to_raid,
join_combat, cast_spell, leave_combat, start_pve_combat, pve_cast_spell,
select_title,
idle_tick (scheduled hourly: streak check, quest refresh, raid expiry)
```

### 4.2 — Client Migration

- Replace Zustand localStorage with SpacetimeDB subscriptions
- Keep Zustand as UI cache (subscribe → update store)
- Replace state mutations with reducer calls
- Keep `statEngine.ts` / `classEngine.ts` client-side for delta previews
- Add offline queue: buffer reducer calls when disconnected

### 4.3 — Shared World Features

- See real players in city scenes (subscribe to players in same biome)
- Real-time guild member status
- Leaderboard page
- Friend system

---

## Phase 5: Polish & Social

> **Goal:** Make it feel like a real MMO community
> **Status:** Not started
> **Depends on:** Phase 4 (SpacetimeDB)

### 5.1 — Leaderboards

- Global (by level), per-stat, guild, weekly

### 5.2 — Friend System

- Add by username, activity feed, stat comparison, PvP challenges

### 5.3 — Player Inspection

- Tap sprite in city → full character sheet (name, level, class, title, gear, stats)
- Add friend or challenge to PvP

---

## Architecture Decisions

1. **Build gameplay client-side first (Phases 1-3), migrate to SpacetimeDB after (Phase 4).** Avoids server bottleneck during rapid iteration.
2. **PvE combat is local** — player vs AI mob with no network dependency.
3. **Existing combat components are reusable** for PvE with minor prop changes.
4. **Stat/class engines live on both client and server** — client for previews, server as authority.
5. **Titles are client-side initially** — unlock checks in gameStore, migrate later.

---

## Priority Matrix

| Priority | Phase | What                      | Depends On |
| -------- | ----- | ------------------------- | ---------- |
| **P0**   | 1.1   | Location system           | —          |
| **P0**   | 1.2   | Solo PvE combat           | 1.1        |
| **P0**   | 2.1   | Title system              | —          |
| **P1**   | 1.3   | City scene with sprites   | 1.1        |
| **P1**   | 3.1   | Guild system              | —          |
| **P1**   | 3.2   | Raid boss fights          | 3.1        |
| **P2**   | 4.1   | SpacetimeDB server module | 1-3        |
| **P2**   | 4.2   | Client migration          | 4.1        |
| **P2**   | 4.3   | Shared world              | 4.2        |
| **P3**   | 5.1   | Leaderboards              | 4.2        |
| **P3**   | 5.2   | Friend system             | 4.2        |
| **P3**   | 5.3   | Player inspection         | 4.3        |

---

## Verification Checklist (per phase)

- [ ] `vp check` — TypeScript + lint passes
- [ ] `vp test` — all unit tests pass
- [ ] `vp build` — production build succeeds with PWA
- [ ] Manual: navigate all pages, test new features end-to-end
- [ ] Post Phase 4: verify SpacetimeDB connection, reducers, subscriptions
