import type { TitleDefinition, ActivityLog, Player } from "./types";

// ── Title Definitions ───────────────────────────────────────────

export const TITLES: TitleDefinition[] = [
  // ── Real-world titles ──────────────────────────────────────────
  {
    id: "first_step",
    name: "First Step",
    description: "Log your very first activity",
    category: "real_world",
    icon: "👣",
  },
  {
    id: "iron_will",
    name: "Iron Will",
    description: "Maintain a 30-day activity streak",
    category: "real_world",
    icon: "🔥",
  },
  {
    id: "century",
    name: "Century",
    description: "Log 100 total activities",
    category: "real_world",
    icon: "💯",
  },
  {
    id: "marathon_finisher",
    name: "Marathon Finisher",
    description: "Log a single cardio session of 240+ minutes",
    category: "real_world",
    icon: "🏅",
  },
  {
    id: "half_marathon_sub2h",
    name: "Sub 2h Half Marathon",
    description: "Log a cardio session of 90-120 minutes at intensity 8+",
    category: "real_world",
    icon: "⏱️",
  },
  {
    id: "iron_pumper",
    name: "Iron Pumper",
    description: "Complete 50 strength training sessions",
    category: "real_world",
    icon: "🏋️",
  },
  {
    id: "road_warrior",
    name: "Road Warrior",
    description: "Complete 50 cardio sessions",
    category: "real_world",
    icon: "🏃",
  },
  {
    id: "zen_master",
    name: "Zen Master",
    description: "Complete 100 mindfulness sessions",
    category: "real_world",
    icon: "🧘",
  },
  {
    id: "master_of_engineering",
    name: "Master of Engineering",
    description: "Accumulate 500 hours of learning",
    category: "real_world",
    icon: "🎓",
  },
  {
    id: "bookworm",
    name: "Bookworm",
    description: "Complete 50 learning sessions",
    category: "real_world",
    icon: "📚",
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Log 50 activities before 7am",
    category: "real_world",
    icon: "🌅",
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Log 50 activities after 10pm",
    category: "real_world",
    icon: "🦉",
  },
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "Complete 30 social activities",
    category: "real_world",
    icon: "🦋",
  },
  {
    id: "chef",
    name: "Home Chef",
    description: "Log 100 nutrition activities",
    category: "real_world",
    icon: "👨‍🍳",
  },
  {
    id: "well_rested",
    name: "Well Rested",
    description: "Log 8+ hours of sleep 30 times",
    category: "real_world",
    icon: "😴",
  },
  {
    id: "creative_soul",
    name: "Creative Soul",
    description: "Complete 50 creativity sessions",
    category: "real_world",
    icon: "🎨",
  },
  {
    id: "dedicated",
    name: "Dedicated",
    description: "Maintain a 7-day activity streak",
    category: "real_world",
    icon: "⭐",
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "Maintain a 100-day activity streak",
    category: "real_world",
    icon: "💎",
  },
  {
    id: "thousand",
    name: "The Thousand",
    description: "Log 1000 total activities",
    category: "real_world",
    icon: "👑",
  },

  // ── In-game titles ─────────────────────────────────────────────
  {
    id: "world_explorer",
    name: "World Explorer",
    description: "Unlock all 9 biomes",
    category: "in_game",
    icon: "🗺️",
  },
  {
    id: "legendary_equipped",
    name: "Legendary",
    description: "Equip a legendary item",
    category: "in_game",
    icon: "✨",
  },
  {
    id: "class_master",
    name: "Class Master",
    description: "Reach Level 50",
    category: "in_game",
    icon: "🏆",
  },
  {
    id: "rising_star",
    name: "Rising Star",
    description: "Reach Level 10",
    category: "in_game",
    icon: "🌟",
  },
  {
    id: "veteran_hero",
    name: "Veteran Hero",
    description: "Reach Level 25",
    category: "in_game",
    icon: "⚔️",
  },
  {
    id: "quest_hunter",
    name: "Quest Hunter",
    description: "Complete 50 quests",
    category: "in_game",
    icon: "📜",
  },
  {
    id: "well_equipped",
    name: "Well Equipped",
    description: "Fill all 4 equipment slots",
    category: "in_game",
    icon: "🛡️",
  },
  {
    id: "first_blood",
    name: "First Blood",
    description: "Win your first PvP match",
    category: "in_game",
    icon: "🩸",
  },
  {
    id: "gladiator",
    name: "Gladiator",
    description: "Win 50 PvP matches",
    category: "in_game",
    icon: "🗡️",
  },
  {
    id: "dragonslayer",
    name: "Dragonslayer",
    description: "Defeat any raid boss",
    category: "in_game",
    icon: "🐉",
  },
  {
    id: "guild_champion",
    name: "Guild Champion",
    description: "Complete 10 guild raids",
    category: "in_game",
    icon: "🏰",
  },
];

export const TITLE_MAP = new Map(TITLES.map((t) => [t.id, t]));

// ── Unlock Checkers ─────────────────────────────────────────────

/** Context needed to evaluate title unlock conditions */
interface TitleCheckContext {
  player: Player;
  logs: ActivityLog[];
  /** Number of quests the player has completed (claimed) lifetime */
  questsCompleted: number;
  /** PvP wins (future — defaults to 0) */
  pvpWins: number;
  /** Raid boss kills (future — defaults to 0) */
  raidKills: number;
}

type TitleChecker = (ctx: TitleCheckContext) => boolean;

function countByType(logs: ActivityLog[], type: string): number {
  return logs.filter((l) => l.type === type).length;
}

function totalMinutesByType(logs: ActivityLog[], type: string): number {
  return logs.filter((l) => l.type === type).reduce((sum, l) => sum + l.durationMin, 0);
}

function countBeforeHour(logs: ActivityLog[], hour: number): number {
  return logs.filter((l) => new Date(l.timestamp).getHours() < hour).length;
}

function countAfterHour(logs: ActivityLog[], hour: number): number {
  return logs.filter((l) => new Date(l.timestamp).getHours() >= hour).length;
}

const TITLE_CHECKS: Record<string, TitleChecker> = {
  // Real-world
  first_step: ({ player }) => player.totalActivities >= 1,
  dedicated: ({ player }) => player.streakDays >= 7,
  iron_will: ({ player }) => player.streakDays >= 30,
  unstoppable: ({ player }) => player.streakDays >= 100,
  century: ({ player }) => player.totalActivities >= 100,
  thousand: ({ player }) => player.totalActivities >= 1000,
  marathon_finisher: ({ logs }) => logs.some((l) => l.type === "Cardio" && l.durationMin >= 240),
  half_marathon_sub2h: ({ logs }) =>
    logs.some(
      (l) => l.type === "Cardio" && l.durationMin >= 90 && l.durationMin <= 120 && l.intensity >= 8,
    ),
  iron_pumper: ({ logs }) => countByType(logs, "StrengthTraining") >= 50,
  road_warrior: ({ logs }) => countByType(logs, "Cardio") >= 50,
  zen_master: ({ logs }) => countByType(logs, "Mindfulness") >= 100,
  master_of_engineering: ({ logs }) => totalMinutesByType(logs, "MindLearning") >= 30000, // 500h
  bookworm: ({ logs }) => countByType(logs, "MindLearning") >= 50,
  early_bird: ({ logs }) => countBeforeHour(logs, 7) >= 50,
  night_owl: ({ logs }) => countAfterHour(logs, 22) >= 50,
  social_butterfly: ({ logs }) => countByType(logs, "Social") >= 30,
  chef: ({ logs }) => countByType(logs, "Nutrition") >= 100,
  well_rested: ({ logs }) => logs.filter((l) => l.type === "Sleep" && l.rawValue >= 8).length >= 30,
  creative_soul: ({ logs }) => countByType(logs, "Creativity") >= 50,

  // In-game
  world_explorer: ({ player }) => (player.unlockedBiomes ?? []).length >= 9,
  legendary_equipped: ({ player }) =>
    Object.values(player.equipment).some((item) => item?.rarity === "legendary"),
  class_master: ({ player }) => player.level >= 50,
  rising_star: ({ player }) => player.level >= 10,
  veteran_hero: ({ player }) => player.level >= 25,
  quest_hunter: ({ questsCompleted }) => questsCompleted >= 50,
  well_equipped: ({ player }) =>
    (["weapon", "armor", "head", "accessory"] as const).every((s) => player.equipment[s] != null),
  first_blood: ({ pvpWins }) => pvpWins >= 1,
  gladiator: ({ pvpWins }) => pvpWins >= 50,
  dragonslayer: ({ raidKills }) => raidKills >= 1,
  guild_champion: ({ raidKills }) => raidKills >= 10,
};

/**
 * Check all titles and return IDs of newly unlocked ones.
 */
export function checkTitleUnlocks(ctx: TitleCheckContext): string[] {
  const alreadyUnlocked = new Set(ctx.player.unlockedTitles ?? []);
  const newlyUnlocked: string[] = [];

  for (const title of TITLES) {
    if (alreadyUnlocked.has(title.id)) continue;
    const check = TITLE_CHECKS[title.id];
    if (check && check(ctx)) {
      newlyUnlocked.push(title.id);
    }
  }

  return newlyUnlocked;
}
