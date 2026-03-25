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
    lastActivityAt: t.timestamp(),

    // Stats — f32 to preserve fractional gains across sessions
    strength: t.f32(),
    agility: t.f32(),
    intelligence: t.f32(),
    constitution: t.f32(),
    wisdom: t.f32(),
    charisma: t.f32(),
    mana: t.f32(),

    // World position
    currentBiome: t.string().index("btree"),
    currentLocation: t.option(t.string()),

    // Titles
    activeTitle: t.option(t.string()),

    // PvP record
    pvpWins: t.u32(),
    pvpLosses: t.u32(),

    // Biome unlocks
    unlockedBiomes: t.array(t.string()),

    // Timestamps
    joinedAt: t.timestamp(),
  },
);
