/**
 * Tests for server-side title unlock logic.
 * The titleChecker is a pure function that can be tested independently.
 * We replicate the logic here for client-side testing since the server module
 * uses SpacetimeDB-specific imports not available in the test environment.
 */
import { describe, expect, it } from "vite-plus/test";

// ── Replicated logic from apps/spacetimedb/src/logic/titleChecker.ts ──
// (We test the algorithm; the server uses the same logic)

interface PlayerData {
  totalActivities: number;
  streakDays: number;
  level: number;
  pvpWins: number;
  questsCompleted: number;
  unlockedBiomes: string[];
}

interface LogData {
  activityType: string;
  durationMin: number;
  rawValue: number;
  intensity: number;
  timestamp: Date;
}

interface EquipData {
  slot: string;
  rarity: string;
  equipped: boolean;
}

type TitleChecker = (ctx: {
  player: PlayerData;
  logs: LogData[];
  equipment: EquipData[];
  raidKills: number;
}) => boolean;

function countByType(logs: LogData[], type: string): number {
  return logs.filter((l) => l.activityType === type).length;
}

function totalMinutesByType(logs: LogData[], type: string): number {
  return logs.filter((l) => l.activityType === type).reduce((sum, l) => sum + l.durationMin, 0);
}

function countBeforeHour(logs: LogData[], hour: number): number {
  return logs.filter((l) => l.timestamp.getHours() < hour).length;
}

function countAfterHour(logs: LogData[], hour: number): number {
  return logs.filter((l) => l.timestamp.getHours() >= hour).length;
}

const TITLE_CHECKS: Record<string, TitleChecker> = {
  first_step: ({ player }) => player.totalActivities >= 1,
  dedicated: ({ player }) => player.streakDays >= 7,
  iron_will: ({ player }) => player.streakDays >= 30,
  unstoppable: ({ player }) => player.streakDays >= 100,
  century: ({ player }) => player.totalActivities >= 100,
  thousand: ({ player }) => player.totalActivities >= 1000,
  marathon_finisher: ({ logs }) =>
    logs.some((l) => l.activityType === "Cardio" && l.durationMin >= 240),
  half_marathon_sub2h: ({ logs }) =>
    logs.some(
      (l) =>
        l.activityType === "Cardio" &&
        l.durationMin >= 90 &&
        l.durationMin <= 120 &&
        l.intensity >= 8,
    ),
  iron_pumper: ({ logs }) => countByType(logs, "StrengthTraining") >= 50,
  road_warrior: ({ logs }) => countByType(logs, "Cardio") >= 50,
  zen_master: ({ logs }) => countByType(logs, "Mindfulness") >= 100,
  master_of_engineering: ({ logs }) => totalMinutesByType(logs, "MindLearning") >= 30000,
  bookworm: ({ logs }) => countByType(logs, "MindLearning") >= 50,
  early_bird: ({ logs }) => countBeforeHour(logs, 7) >= 50,
  night_owl: ({ logs }) => countAfterHour(logs, 22) >= 50,
  social_butterfly: ({ logs }) => countByType(logs, "Social") >= 30,
  chef: ({ logs }) => countByType(logs, "Nutrition") >= 100,
  well_rested: ({ logs }) =>
    logs.filter((l) => l.activityType === "Sleep" && l.rawValue >= 8).length >= 30,
  creative_soul: ({ logs }) => countByType(logs, "Creativity") >= 50,
  world_explorer: ({ player }) => player.unlockedBiomes.length >= 9,
  legendary_equipped: ({ equipment }) =>
    equipment.some((e) => e.equipped && e.rarity === "Legendary"),
  class_master: ({ player }) => player.level >= 50,
  rising_star: ({ player }) => player.level >= 10,
  veteran_hero: ({ player }) => player.level >= 25,
  quest_hunter: ({ player }) => player.questsCompleted >= 50,
  well_equipped: ({ equipment }) => {
    const equippedSlots = new Set(equipment.filter((e) => e.equipped).map((e) => e.slot));
    return (
      equippedSlots.has("Weapon") &&
      equippedSlots.has("Armor") &&
      equippedSlots.has("Head") &&
      equippedSlots.has("Accessory")
    );
  },
  first_blood: ({ player }) => player.pvpWins >= 1,
  gladiator: ({ player }) => player.pvpWins >= 50,
  dragonslayer: ({ raidKills }) => raidKills >= 1,
  guild_champion: ({ raidKills }) => raidKills >= 10,
};

function checkNewTitles(
  alreadyUnlocked: Set<string>,
  player: PlayerData,
  logs: LogData[],
  equipment: EquipData[],
  raidKills: number,
): string[] {
  const newTitles: string[] = [];
  for (const titleId of Object.keys(TITLE_CHECKS)) {
    if (alreadyUnlocked.has(titleId)) continue;
    const check = TITLE_CHECKS[titleId];
    if (check && check({ player, logs, equipment, raidKills })) {
      newTitles.push(titleId);
    }
  }
  return newTitles;
}

// ── Helpers ─────────────────────────────────────────────────────

function defaultPlayer(overrides: Partial<PlayerData> = {}): PlayerData {
  return {
    totalActivities: 0,
    streakDays: 0,
    level: 1,
    pvpWins: 0,
    questsCompleted: 0,
    unlockedBiomes: ["plains"],
    ...overrides,
  };
}

function makeLog(type: string, durationMin: number, overrides: Partial<LogData> = {}): LogData {
  return {
    activityType: type,
    durationMin,
    rawValue: durationMin,
    intensity: 5,
    timestamp: new Date(2025, 5, 15, 12, 0),
    ...overrides,
  };
}

function makeLogs(type: string, count: number, durationMin = 60): LogData[] {
  return Array.from({ length: count }, () => makeLog(type, durationMin));
}

// ── Tests ───────────────────────────────────────────────────────

describe("checkNewTitles", () => {
  it("returns empty array for a brand new player", () => {
    const result = checkNewTitles(new Set(), defaultPlayer(), [], [], 0);
    expect(result).toEqual([]);
  });

  it("unlocks first_step at 1 activity", () => {
    const result = checkNewTitles(new Set(), defaultPlayer({ totalActivities: 1 }), [], [], 0);
    expect(result).toContain("first_step");
  });

  it("does not re-unlock already unlocked titles", () => {
    const result = checkNewTitles(
      new Set(["first_step"]),
      defaultPlayer({ totalActivities: 1 }),
      [],
      [],
      0,
    );
    expect(result).not.toContain("first_step");
  });

  it("unlocks dedicated at 7-day streak", () => {
    const result = checkNewTitles(
      new Set(),
      defaultPlayer({ streakDays: 7, totalActivities: 7 }),
      [],
      [],
      0,
    );
    expect(result).toContain("dedicated");
  });

  it("unlocks iron_will at 30-day streak", () => {
    const result = checkNewTitles(
      new Set(),
      defaultPlayer({ streakDays: 30, totalActivities: 30 }),
      [],
      [],
      0,
    );
    expect(result).toContain("iron_will");
  });

  it("unlocks century at 100 activities", () => {
    const result = checkNewTitles(new Set(), defaultPlayer({ totalActivities: 100 }), [], [], 0);
    expect(result).toContain("century");
  });
});

describe("title checks - real world", () => {
  it("unlocks marathon_finisher for 240+ min cardio", () => {
    const logs = [makeLog("Cardio", 250)];
    const result = checkNewTitles(new Set(), defaultPlayer({ totalActivities: 1 }), logs, [], 0);
    expect(result).toContain("marathon_finisher");
  });

  it("does NOT unlock marathon_finisher for 239 min cardio", () => {
    const logs = [makeLog("Cardio", 239)];
    const result = checkNewTitles(new Set(), defaultPlayer({ totalActivities: 1 }), logs, [], 0);
    expect(result).not.toContain("marathon_finisher");
  });

  it("unlocks half_marathon_sub2h for high-intensity 90-120 min cardio", () => {
    const logs = [makeLog("Cardio", 100, { intensity: 9 })];
    const result = checkNewTitles(new Set(), defaultPlayer({ totalActivities: 1 }), logs, [], 0);
    expect(result).toContain("half_marathon_sub2h");
  });

  it("does NOT unlock half_marathon_sub2h with low intensity", () => {
    const logs = [makeLog("Cardio", 100, { intensity: 5 })];
    const result = checkNewTitles(new Set(), defaultPlayer({ totalActivities: 1 }), logs, [], 0);
    expect(result).not.toContain("half_marathon_sub2h");
  });

  it("unlocks iron_pumper at 50 strength sessions", () => {
    const logs = makeLogs("StrengthTraining", 50);
    const result = checkNewTitles(new Set(), defaultPlayer({ totalActivities: 50 }), logs, [], 0);
    expect(result).toContain("iron_pumper");
  });

  it("unlocks zen_master at 100 mindfulness sessions", () => {
    const logs = makeLogs("Mindfulness", 100);
    const result = checkNewTitles(new Set(), defaultPlayer({ totalActivities: 100 }), logs, [], 0);
    expect(result).toContain("zen_master");
  });

  it("unlocks master_of_engineering at 30000 min MindLearning", () => {
    const logs = makeLogs("MindLearning", 30, 1000); // 30 logs * 1000 min = 30000
    const result = checkNewTitles(new Set(), defaultPlayer({ totalActivities: 30 }), logs, [], 0);
    expect(result).toContain("master_of_engineering");
  });

  it("unlocks early_bird for 50+ activities before 7am", () => {
    const earlyLogs = Array.from({ length: 50 }, () =>
      makeLog("Cardio", 30, { timestamp: new Date(2025, 5, 15, 5, 30) }),
    );
    const result = checkNewTitles(
      new Set(),
      defaultPlayer({ totalActivities: 50 }),
      earlyLogs,
      [],
      0,
    );
    expect(result).toContain("early_bird");
  });

  it("unlocks night_owl for 50+ activities after 10pm", () => {
    const nightLogs = Array.from({ length: 50 }, () =>
      makeLog("Mindfulness", 30, { timestamp: new Date(2025, 5, 15, 23, 0) }),
    );
    const result = checkNewTitles(
      new Set(),
      defaultPlayer({ totalActivities: 50 }),
      nightLogs,
      [],
      0,
    );
    expect(result).toContain("night_owl");
  });

  it("unlocks well_rested for 30+ sleep sessions of 8+ hours", () => {
    const sleepLogs = Array.from({ length: 30 }, () => makeLog("Sleep", 480, { rawValue: 8 }));
    const result = checkNewTitles(
      new Set(),
      defaultPlayer({ totalActivities: 30 }),
      sleepLogs,
      [],
      0,
    );
    expect(result).toContain("well_rested");
  });

  it("does NOT unlock well_rested with only 7h sleep", () => {
    const sleepLogs = Array.from({ length: 30 }, () => makeLog("Sleep", 420, { rawValue: 7 }));
    const result = checkNewTitles(
      new Set(),
      defaultPlayer({ totalActivities: 30 }),
      sleepLogs,
      [],
      0,
    );
    expect(result).not.toContain("well_rested");
  });
});

describe("title checks - in-game", () => {
  it("unlocks world_explorer at 9 biomes", () => {
    const result = checkNewTitles(
      new Set(),
      defaultPlayer({
        unlockedBiomes: [
          "plains",
          "forest",
          "tundra",
          "desert",
          "dungeon",
          "volcano",
          "spire",
          "ruins",
          "celestial",
        ],
      }),
      [],
      [],
      0,
    );
    expect(result).toContain("world_explorer");
  });

  it("does NOT unlock world_explorer with 8 biomes", () => {
    const result = checkNewTitles(
      new Set(),
      defaultPlayer({
        unlockedBiomes: [
          "plains",
          "forest",
          "tundra",
          "desert",
          "dungeon",
          "volcano",
          "spire",
          "ruins",
        ],
      }),
      [],
      [],
      0,
    );
    expect(result).not.toContain("world_explorer");
  });

  it("unlocks legendary_equipped when wearing legendary gear", () => {
    const equipment: EquipData[] = [{ slot: "Weapon", rarity: "Legendary", equipped: true }];
    const result = checkNewTitles(new Set(), defaultPlayer(), [], equipment, 0);
    expect(result).toContain("legendary_equipped");
  });

  it("does NOT unlock legendary_equipped for unequipped legendary", () => {
    const equipment: EquipData[] = [{ slot: "Weapon", rarity: "Legendary", equipped: false }];
    const result = checkNewTitles(new Set(), defaultPlayer(), [], equipment, 0);
    expect(result).not.toContain("legendary_equipped");
  });

  it("unlocks class_master at level 50", () => {
    const result = checkNewTitles(new Set(), defaultPlayer({ level: 50 }), [], [], 0);
    expect(result).toContain("class_master");
  });

  it("unlocks rising_star at level 10", () => {
    const result = checkNewTitles(new Set(), defaultPlayer({ level: 10 }), [], [], 0);
    expect(result).toContain("rising_star");
  });

  it("unlocks well_equipped with all 4 slots equipped", () => {
    const equipment: EquipData[] = [
      { slot: "Weapon", rarity: "Common", equipped: true },
      { slot: "Armor", rarity: "Common", equipped: true },
      { slot: "Head", rarity: "Common", equipped: true },
      { slot: "Accessory", rarity: "Common", equipped: true },
    ];
    const result = checkNewTitles(new Set(), defaultPlayer(), [], equipment, 0);
    expect(result).toContain("well_equipped");
  });

  it("does NOT unlock well_equipped with 3 slots", () => {
    const equipment: EquipData[] = [
      { slot: "Weapon", rarity: "Common", equipped: true },
      { slot: "Armor", rarity: "Common", equipped: true },
      { slot: "Head", rarity: "Common", equipped: true },
    ];
    const result = checkNewTitles(new Set(), defaultPlayer(), [], equipment, 0);
    expect(result).not.toContain("well_equipped");
  });

  it("unlocks first_blood at 1 PvP win", () => {
    const result = checkNewTitles(
      new Set(),
      defaultPlayer({ pvpWins: 1, totalActivities: 1 }),
      [],
      [],
      0,
    );
    expect(result).toContain("first_blood");
  });

  it("unlocks gladiator at 50 PvP wins", () => {
    const result = checkNewTitles(
      new Set(),
      defaultPlayer({ pvpWins: 50, totalActivities: 1 }),
      [],
      [],
      0,
    );
    expect(result).toContain("gladiator");
  });

  it("unlocks dragonslayer at 1 raid kill", () => {
    const result = checkNewTitles(new Set(), defaultPlayer({ totalActivities: 1 }), [], [], 1);
    expect(result).toContain("dragonslayer");
  });

  it("unlocks guild_champion at 10 raid kills", () => {
    const result = checkNewTitles(new Set(), defaultPlayer({ totalActivities: 1 }), [], [], 10);
    expect(result).toContain("guild_champion");
  });
});

describe("checkNewTitles edge cases", () => {
  it("unlocks multiple titles at once", () => {
    const result = checkNewTitles(
      new Set(),
      defaultPlayer({ totalActivities: 100, level: 50, streakDays: 30 }),
      [],
      [],
      0,
    );
    expect(result).toContain("first_step");
    expect(result).toContain("century");
    expect(result).toContain("class_master");
    expect(result).toContain("iron_will");
  });

  it("handles empty already-unlocked set", () => {
    const result = checkNewTitles(new Set(), defaultPlayer({ totalActivities: 1 }), [], [], 0);
    expect(result).toContain("first_step");
  });

  it("handles all titles already unlocked", () => {
    const allTitles = new Set(Object.keys(TITLE_CHECKS));
    const result = checkNewTitles(
      allTitles,
      defaultPlayer({ totalActivities: 9999, level: 99 }),
      [],
      [],
      999,
    );
    expect(result).toHaveLength(0);
  });
});
