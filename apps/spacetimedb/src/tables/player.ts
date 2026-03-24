import { table, t } from "spacetimedb/server";
import { CharacterClass } from "../types/characterClass";

export const player = table(
  { name: "player", public: true },
  {
    identity: t.identity().primaryKey(),
    name: t.string(),
    online: t.bool(),
    characterClass: CharacterClass,

    // Level & XP
    level: t.u32(),
    xp: t.u32(),
    xpToNext: t.u32(),

    // Health
    hp: t.u32(),
    maxHp: t.u32(),

    // Economy
    gold: t.u32(),

    // Streaks & totals
    streakDays: t.u32(),
    totalActivities: t.u32(),
    questsCompleted: t.u32(),
    lastActivityDate: t.string(),

    // Stats — f32 to preserve fractional gains across sessions
    str: t.f32(),
    agi: t.f32(),
    intStat: t.f32(),
    con: t.f32(),
    wis: t.f32(),
    cha: t.f32(),
    mp: t.f32(),

    // World position
    currentBiome: t.string().index("btree"),
    currentLocation: t.option(t.string()),

    // Titles
    activeTitle: t.option(t.string()),

    // PvP record
    pvpWins: t.u32(),
    pvpLosses: t.u32(),

    // Biome unlocks (comma-separated IDs for simplicity)
    unlockedBiomes: t.string(),

    // Timestamps
    joinedAt: t.timestamp(),
  },
);
