import { Theme } from "./themes";
import type { Location } from "./types";

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
  plains: Theme.Default,
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
  /** Locations within this biome */
  locations: Location[];
}

export const BIOME_META: Record<BiomeId, BiomeMeta> = {
  plains: {
    name: "Verdant Plains",
    description: "Where all journeys begin.",
    unlockHint: "Starting zone — always unlocked.",
    raidBoss: "Thornback the Elder",
    icon: "🌿",
    mapColor: "#4ade80",
    locations: [
      {
        id: "plains-city",
        name: "Greenhollow",
        type: "city",
        description: "A peaceful village where adventurers resupply.",
        icon: "🏘️",
      },
      {
        id: "plains-wild",
        name: "Whispering Fields",
        type: "wilderness",
        description: "Gentle meadows with lurking slimes and boars.",
        icon: "🌾",
      },
      {
        id: "plains-boss",
        name: "Thornback's Grove",
        type: "boss_lair",
        description: "Ancient roots guard the Elder's den.",
        icon: "🌳",
      },
    ],
  },
  tundra: {
    name: "Ice Cavern",
    description: "Forged by a thousand cold mornings.",
    unlockHint: "Log 30 cardio sessions.",
    raidBoss: "The Frostlord",
    icon: "❄️",
    mapColor: "#67e8f9",
    locations: [
      {
        id: "tundra-city",
        name: "Frostwatch Keep",
        type: "city",
        description: "A fortified outpost against the endless blizzard.",
        icon: "🏔️",
      },
      {
        id: "tundra-wild",
        name: "Glacial Wastes",
        type: "wilderness",
        description: "Ice wolves and frost sprites prowl the drifts.",
        icon: "🌨️",
      },
      {
        id: "tundra-boss",
        name: "The Frozen Throne",
        type: "boss_lair",
        description: "The Frostlord waits in eternal winter.",
        icon: "🧊",
      },
    ],
  },
  volcano: {
    name: "Lava Core",
    description: "Only the strongest reach the peak.",
    unlockHint: "Log 50 strength training sessions.",
    raidBoss: "Ignisfury",
    icon: "🌋",
    mapColor: "#f87171",
    locations: [
      {
        id: "volcano-city",
        name: "Ember Forge",
        type: "city",
        description: "Blacksmiths temper weapons in volcanic heat.",
        icon: "⚒️",
      },
      {
        id: "volcano-wild",
        name: "Cinder Slopes",
        type: "wilderness",
        description: "Fire elementals and magma crawlers roam.",
        icon: "🔥",
      },
      {
        id: "volcano-boss",
        name: "Ignisfury's Caldera",
        type: "boss_lair",
        description: "The heart of the volcano pulses with rage.",
        icon: "💥",
      },
    ],
  },
  forest: {
    name: "Pixel Forest",
    description: "Peace earned through discipline.",
    unlockHint: "Log 20 mindfulness sessions.",
    raidBoss: "Rootwarden",
    icon: "🌲",
    mapColor: "#22c55e",
    locations: [
      {
        id: "forest-city",
        name: "Mossgrove",
        type: "city",
        description: "A hidden treetop village of druids.",
        icon: "🍃",
      },
      {
        id: "forest-wild",
        name: "Tangled Thicket",
        type: "wilderness",
        description: "Living vines and forest sprites guard the paths.",
        icon: "🌿",
      },
      {
        id: "forest-boss",
        name: "Rootwarden's Heart",
        type: "boss_lair",
        description: "The ancient tree stirs at the forest core.",
        icon: "🌳",
      },
    ],
  },
  dungeon: {
    name: "Dungeon Torch",
    description: "Darkness hides what gold cannot buy.",
    unlockHint: "Complete 5 daily quests in a row.",
    raidBoss: "Shadow Baron",
    icon: "🕯️",
    mapColor: "#a855f7",
    locations: [
      {
        id: "dungeon-city",
        name: "Torchlight Camp",
        type: "city",
        description: "Brave souls rest before descending deeper.",
        icon: "🏕️",
      },
      {
        id: "dungeon-wild",
        name: "Shadow Corridors",
        type: "wilderness",
        description: "Bats, wraiths, and traps lurk in every passage.",
        icon: "🦇",
      },
      {
        id: "dungeon-boss",
        name: "The Baron's Vault",
        type: "boss_lair",
        description: "Shadows coalesce into the Baron himself.",
        icon: "👤",
      },
    ],
  },
  desert: {
    name: "Dwarven Vault",
    description: "No shortcuts. No shade.",
    unlockHint: "Log 15 HIIT sessions.",
    raidBoss: "King Stonefist",
    icon: "🏜️",
    mapColor: "#fbbf24",
    locations: [
      {
        id: "desert-city",
        name: "Sandstone Bazaar",
        type: "city",
        description: "Merchants trade rare goods under canvas tents.",
        icon: "🏪",
      },
      {
        id: "desert-wild",
        name: "Scorching Dunes",
        type: "wilderness",
        description: "Sand worms and desert bandits ambush travelers.",
        icon: "🏜️",
      },
      {
        id: "desert-boss",
        name: "Stonefist's Arena",
        type: "boss_lair",
        description: "The Dwarf King challenges all who enter.",
        icon: "👊",
      },
    ],
  },
  spire: {
    name: "Ancient Runes",
    description: "Knowledge is the rarest power.",
    unlockHint: "Log 50 learning sessions.",
    raidBoss: "The Archivist",
    icon: "📜",
    mapColor: "#818cf8",
    locations: [
      {
        id: "spire-city",
        name: "Library of Echoes",
        type: "city",
        description: "Endless shelves of arcane knowledge.",
        icon: "📚",
      },
      {
        id: "spire-wild",
        name: "Runic Labyrinth",
        type: "wilderness",
        description: "Animated books and spell constructs guard secrets.",
        icon: "🔮",
      },
      {
        id: "spire-boss",
        name: "The Archivist's Study",
        type: "boss_lair",
        description: "Reality bends around the keeper of all knowledge.",
        icon: "📖",
      },
    ],
  },
  ruins: {
    name: "Dragon Hoard",
    description: "Ten victories. A legacy begins.",
    unlockHint: "Win 10 guild raids.",
    raidBoss: "Skarveth the Undying",
    icon: "🐉",
    mapColor: "#f59e0b",
    locations: [
      {
        id: "ruins-city",
        name: "Bonehaven",
        type: "city",
        description: "Built from the bones of fallen dragons.",
        icon: "🦴",
      },
      {
        id: "ruins-wild",
        name: "Cursed Catacombs",
        type: "wilderness",
        description: "Undead warriors patrol crumbling halls.",
        icon: "💀",
      },
      {
        id: "ruins-boss",
        name: "Skarveth's Tomb",
        type: "boss_lair",
        description: "The Undying stirs in his golden prison.",
        icon: "⚰️",
      },
    ],
  },
  celestial: {
    name: "Space Station",
    description: "365 days. You never stopped.",
    unlockHint: "Maintain a 365-day activity streak.",
    raidBoss: "The Architect",
    icon: "✨",
    mapColor: "#c084fc",
    locations: [
      {
        id: "celestial-city",
        name: "Starfall Sanctum",
        type: "city",
        description: "A floating haven among the stars.",
        icon: "⭐",
      },
      {
        id: "celestial-wild",
        name: "Cosmic Rift",
        type: "wilderness",
        description: "Void creatures and astral phantoms drift.",
        icon: "🌌",
      },
      {
        id: "celestial-boss",
        name: "The Architect's Domain",
        type: "boss_lair",
        description: "The creator of worlds awaits.",
        icon: "🌀",
      },
    ],
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
