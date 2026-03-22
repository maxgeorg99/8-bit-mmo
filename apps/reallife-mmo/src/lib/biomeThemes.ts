import { Theme } from "./themes";

export type BiomeId =
  | "plains"
  | "tundra"
  | "volcano"
  | "forest"
  | "dungeon"
  | "desert"
  | "spire"
  | "ruins"
  | "celestial";

export const ALL_BIOMES: BiomeId[] = [
  "plains",
  "tundra",
  "volcano",
  "forest",
  "dungeon",
  "desert",
  "spire",
  "ruins",
  "celestial",
];

export const BIOME_TO_THEME: Record<BiomeId, Theme> = {
  plains: Theme.PixelForest,
  tundra: Theme.IceCavern,
  volcano: Theme.LavaCore,
  forest: Theme.PixelForest,
  dungeon: Theme.DungeonTorch,
  desert: Theme.DwarvenVault,
  spire: Theme.AncientRunes,
  ruins: Theme.DragonHoard,
  celestial: Theme.SpaceStation,
};

export interface BiomeMeta {
  name: string;
  description: string;
  unlockHint: string;
  raidBoss: string;
  /** Emoji for the map label */
  icon: string;
  /** Fill color hint for the map polygon */
  mapColor: string;
}

export const BIOME_META: Record<BiomeId, BiomeMeta> = {
  plains: {
    name: "Verdant Plains",
    description: "Where all journeys begin.",
    unlockHint: "Starting zone — always unlocked.",
    raidBoss: "Thornback the Elder",
    icon: "🌿",
    mapColor: "#4ade80",
  },
  tundra: {
    name: "Ice Cavern",
    description: "Forged by a thousand cold mornings.",
    unlockHint: "Log 30 cardio sessions.",
    raidBoss: "The Frostlord",
    icon: "❄️",
    mapColor: "#67e8f9",
  },
  volcano: {
    name: "Lava Core",
    description: "Only the strongest reach the peak.",
    unlockHint: "Log 50 strength training sessions.",
    raidBoss: "Ignisfury",
    icon: "🌋",
    mapColor: "#f87171",
  },
  forest: {
    name: "Pixel Forest",
    description: "Peace earned through discipline.",
    unlockHint: "Log 20 mindfulness sessions.",
    raidBoss: "Rootwarden",
    icon: "🌲",
    mapColor: "#22c55e",
  },
  dungeon: {
    name: "Dungeon Torch",
    description: "Darkness hides what gold cannot buy.",
    unlockHint: "Complete 5 daily quests in a row.",
    raidBoss: "Shadow Baron",
    icon: "🕯️",
    mapColor: "#a855f7",
  },
  desert: {
    name: "Dwarven Vault",
    description: "No shortcuts. No shade.",
    unlockHint: "Log 15 HIIT sessions.",
    raidBoss: "King Stonefist",
    icon: "🏜️",
    mapColor: "#fbbf24",
  },
  spire: {
    name: "Ancient Runes",
    description: "Knowledge is the rarest power.",
    unlockHint: "Log 50 learning sessions.",
    raidBoss: "The Archivist",
    icon: "📜",
    mapColor: "#818cf8",
  },
  ruins: {
    name: "Dragon Hoard",
    description: "Ten victories. A legacy begins.",
    unlockHint: "Win 10 guild raids.",
    raidBoss: "Skarveth the Undying",
    icon: "🐉",
    mapColor: "#f59e0b",
  },
  celestial: {
    name: "Space Station",
    description: "365 days. You never stopped.",
    unlockHint: "Maintain a 365-day activity streak.",
    raidBoss: "The Architect",
    icon: "✨",
    mapColor: "#c084fc",
  },
};

/**
 * Biome unlock requirements — maps to activity log counts and player stats.
 * Used client-side for progress display and server-side for unlock checks.
 */
export interface BiomeUnlockReq {
  activityType?: string;
  count?: number;
  /** Special unlock conditions */
  special?: "daily_quest_streak" | "raid_wins" | "streak_days";
  specialCount?: number;
}

export const BIOME_UNLOCK_REQS: Record<BiomeId, BiomeUnlockReq> = {
  plains: {}, // always unlocked
  tundra: { activityType: "Cardio", count: 30 },
  volcano: { activityType: "StrengthTraining", count: 50 },
  forest: { activityType: "Mindfulness", count: 20 },
  dungeon: { special: "daily_quest_streak", specialCount: 5 },
  desert: { activityType: "Hiit", count: 15 },
  spire: { activityType: "MindLearning", count: 50 },
  ruins: { special: "raid_wins", specialCount: 10 },
  celestial: { special: "streak_days", specialCount: 365 },
};
