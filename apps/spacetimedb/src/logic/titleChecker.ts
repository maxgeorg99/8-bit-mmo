/**
 * Server-side title unlock checker.
 * Mirrors the client-side titles.ts logic — checks all conditions and inserts
 * newly unlocked titles into the player_title table.
 */

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
  // Real-world
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

  // In-game
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

const ALL_TITLE_IDS = Object.keys(TITLE_CHECKS);

/**
 * Check all title conditions and return IDs of titles that should be unlocked
 * but aren't yet.
 */
export function checkNewTitles(
  alreadyUnlocked: Set<string>,
  player: PlayerData,
  logs: LogData[],
  equipment: EquipData[],
  raidKills: number,
): string[] {
  const newTitles: string[] = [];

  for (const titleId of ALL_TITLE_IDS) {
    if (alreadyUnlocked.has(titleId)) continue;
    const check = TITLE_CHECKS[titleId];
    if (check && check({ player, logs, equipment, raidKills })) {
      newTitles.push(titleId);
    }
  }

  return newTitles;
}
