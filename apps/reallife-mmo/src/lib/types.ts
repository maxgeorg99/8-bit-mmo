// ── Activity Types ──────────────────────────────────────────────

export type ActivityType =
  | "StrengthTraining"
  | "Cardio"
  | "Hiit"
  | "MindLearning"
  | "Nutrition"
  | "Hydration"
  | "Sleep"
  | "Mindfulness"
  | "Creativity"
  | "Social";

export const ACTIVITY_TYPES: ActivityType[] = [
  "StrengthTraining",
  "Cardio",
  "Hiit",
  "MindLearning",
  "Nutrition",
  "Hydration",
  "Sleep",
  "Mindfulness",
  "Creativity",
  "Social",
];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  StrengthTraining: "Strength Training",
  Cardio: "Cardio",
  Hiit: "HIIT",
  MindLearning: "Study / Learning",
  Nutrition: "Healthy Eating",
  Hydration: "Hydration",
  Sleep: "Sleep",
  Mindfulness: "Mindfulness",
  Creativity: "Creativity",
  Social: "Social / Going Out",
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  StrengthTraining: "💪",
  Cardio: "🏃",
  Hiit: "⚡",
  MindLearning: "📚",
  Nutrition: "🥗",
  Hydration: "💧",
  Sleep: "😴",
  Mindfulness: "🧘",
  Creativity: "🎨",
  Social: "🎉",
};

// ── Activity Input Modes ────────────────────────────────────────
// Each activity type has a different natural way to measure it.

export type InputMode = "duration" | "meal" | "glasses" | "sleep";

export interface ActivityInputConfig {
  mode: InputMode;
  /** Label shown above the input */
  label: string;
  /** Unit shown after the value */
  unit: string;
  /** Preset quick-pick values */
  presets: Array<{ value: number; label: string }>;
  /** Slider min/max/step */
  min: number;
  max: number;
  step: number;
  /** Default value */
  defaultValue: number;
  /** Whether intensity makes sense for this activity */
  hasIntensity: boolean;
}

export const ACTIVITY_INPUT: Record<ActivityType, ActivityInputConfig> = {
  StrengthTraining: {
    mode: "duration",
    label: "Duration",
    unit: "min",
    presets: [
      { value: 30, label: "30m" },
      { value: 45, label: "45m" },
      { value: 60, label: "1h" },
      { value: 90, label: "1.5h" },
    ],
    min: 10,
    max: 180,
    step: 5,
    defaultValue: 45,
    hasIntensity: true,
  },
  Cardio: {
    mode: "duration",
    label: "Duration",
    unit: "min",
    presets: [
      { value: 15, label: "15m" },
      { value: 30, label: "30m" },
      { value: 45, label: "45m" },
      { value: 60, label: "1h" },
    ],
    min: 5,
    max: 180,
    step: 5,
    defaultValue: 30,
    hasIntensity: true,
  },
  Hiit: {
    mode: "duration",
    label: "Duration",
    unit: "min",
    presets: [
      { value: 15, label: "15m" },
      { value: 20, label: "20m" },
      { value: 30, label: "30m" },
      { value: 45, label: "45m" },
    ],
    min: 5,
    max: 90,
    step: 5,
    defaultValue: 20,
    hasIntensity: true,
  },
  MindLearning: {
    mode: "duration",
    label: "Duration",
    unit: "min",
    presets: [
      { value: 15, label: "15m" },
      { value: 30, label: "30m" },
      { value: 60, label: "1h" },
      { value: 120, label: "2h" },
    ],
    min: 5,
    max: 180,
    step: 5,
    defaultValue: 30,
    hasIntensity: true,
  },
  Nutrition: {
    mode: "meal",
    label: "Meal quality",
    unit: "meal",
    presets: [
      { value: 1, label: "Snack" },
      { value: 2, label: "Light" },
      { value: 3, label: "Full meal" },
    ],
    min: 1,
    max: 3,
    step: 1,
    defaultValue: 3,
    hasIntensity: false, // quality is the "intensity" here
  },
  Hydration: {
    mode: "glasses",
    label: "Water intake",
    unit: "glasses",
    presets: [
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
    ],
    min: 1,
    max: 12,
    step: 1,
    defaultValue: 2,
    hasIntensity: false,
  },
  Sleep: {
    mode: "sleep",
    label: "Sleep duration",
    unit: "hours",
    presets: [
      { value: 6, label: "6h" },
      { value: 7, label: "7h" },
      { value: 8, label: "8h" },
      { value: 9, label: "9h" },
    ],
    min: 3,
    max: 12,
    step: 0.5,
    defaultValue: 8,
    hasIntensity: false, // sleep quality could be a future feature
  },
  Mindfulness: {
    mode: "duration",
    label: "Duration",
    unit: "min",
    presets: [
      { value: 5, label: "5m" },
      { value: 10, label: "10m" },
      { value: 15, label: "15m" },
      { value: 30, label: "30m" },
    ],
    min: 5,
    max: 120,
    step: 5,
    defaultValue: 10,
    hasIntensity: false,
  },
  Creativity: {
    mode: "duration",
    label: "Duration",
    unit: "min",
    presets: [
      { value: 15, label: "15m" },
      { value: 30, label: "30m" },
      { value: 60, label: "1h" },
      { value: 120, label: "2h" },
    ],
    min: 5,
    max: 180,
    step: 5,
    defaultValue: 30,
    hasIntensity: true,
  },
  Social: {
    mode: "duration",
    label: "Duration",
    unit: "min",
    presets: [
      { value: 30, label: "30m" },
      { value: 60, label: "1h" },
      { value: 120, label: "2h" },
      { value: 180, label: "3h" },
    ],
    min: 15,
    max: 300,
    step: 15,
    defaultValue: 60,
    hasIntensity: false,
  },
};

// ── Stats ───────────────────────────────────────────────────────

export type StatName = "STR" | "AGI" | "INT" | "CON" | "WIS" | "CHA" | "MP";

export interface Stats {
  STR: number;
  AGI: number;
  INT: number;
  CON: number;
  WIS: number;
  CHA: number;
  MP: number;
}

export const EMPTY_STATS: Stats = { STR: 0, AGI: 0, INT: 0, CON: 0, WIS: 0, CHA: 0, MP: 0 };

export const STAT_COLORS: Record<StatName, string> = {
  STR: "bg-red-500",
  AGI: "bg-green-500",
  INT: "bg-purple-500",
  CON: "bg-amber-600",
  WIS: "bg-blue-400",
  CHA: "bg-pink-500",
  MP: "bg-indigo-500",
};

// ── Player Class ────────────────────────────────────────────────

export type PlayerClass =
  | "Warrior"
  | "Mage"
  | "Rogue"
  | "Paladin"
  | "Druid"
  | "Ranger"
  | "Bard"
  | "Scholar"
  | "Unclassed";

export const CLASS_COLORS: Record<PlayerClass, string> = {
  Warrior: "text-red-500",
  Mage: "text-purple-500",
  Rogue: "text-green-500",
  Paladin: "text-amber-400",
  Druid: "text-emerald-500",
  Ranger: "text-lime-500",
  Bard: "text-pink-500",
  Scholar: "text-blue-500",
  Unclassed: "text-muted-foreground",
};

export const CLASS_DESCRIPTIONS: Record<PlayerClass, string> = {
  Warrior: "Heavy lifter. STR/CON dominant.",
  Mage: "Knowledge seeker. INT/MP dominant.",
  Rogue: "Cardio king. AGI/Crit dominant.",
  Paladin: "Balanced power. STR+CON+WIS.",
  Druid: "Inner peace. WIS/CON focus.",
  Ranger: "All-terrain. AGI+STR mix.",
  Bard: "Social creative. CHA/WIS.",
  Scholar: "Deep study. INT/WIS.",
  Unclassed: "Keep logging to discover your class!",
};

// ── Activity Log ────────────────────────────────────────────────

export interface ActivityLog {
  id: string;
  type: ActivityType;
  /** Raw input value in the activity's native unit (min, meals, glasses, hours) */
  rawValue: number;
  /** For backwards compat: effective minutes used in delta calc */
  durationMin: number;
  intensity: number; // 1-10 (ignored for activities without intensity)
  timestamp: number; // epoch ms
  statDeltas: Partial<Stats>;
  /** Optional free-text note, e.g. "Leg day" or "Coffee" */
  note?: string;
}

// ── Quest ───────────────────────────────────────────────────────

export type QuestType = "daily" | "weekly" | "custom";

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  /** Activity type that progresses this quest (null for custom quests completed manually) */
  activityType: ActivityType | null;
  targetMin: number;
  progressMin: number;
  xpReward: number;
  completed: boolean;
  expiresAt: number; // 0 = no expiry (custom quests)
  /** Whether this was manually marked as done (for custom quests) */
  manualComplete?: boolean;
}

// ── Player ──────────────────────────────────────────────────────

// ── Equipment ───────────────────────────────────────────────────

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type EquipSlot = "weapon" | "armor" | "head" | "accessory";

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipSlot;
  rarity: ItemRarity;
  /** Stat bonuses this item provides */
  statBonus: Partial<Stats>;
  /** Level requirement to equip */
  levelReq: number;
  /** How it was earned */
  source: string;
}

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: "text-muted-foreground",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-amber-400",
};

export const RARITY_BORDER: Record<ItemRarity, string> = {
  common: "border-muted-foreground/30",
  uncommon: "border-green-400/50",
  rare: "border-blue-400/50",
  epic: "border-purple-400/50",
  legendary: "border-amber-400/50",
};

export const SLOT_ICONS: Record<EquipSlot, string> = {
  weapon: "⚔️",
  armor: "🛡️",
  head: "👑",
  accessory: "💍",
};

// ── Character Appearance ────────────────────────────────────────

/** Visual tier based on level, affects avatar frame/glow */
export type CharacterTier = "novice" | "apprentice" | "adept" | "veteran" | "master" | "legend";

export function getCharacterTier(level: number): CharacterTier {
  if (level < 5) return "novice";
  if (level < 10) return "apprentice";
  if (level < 20) return "adept";
  if (level < 35) return "veteran";
  if (level < 50) return "master";
  return "legend";
}

export const TIER_LABELS: Record<CharacterTier, string> = {
  novice: "Novice",
  apprentice: "Apprentice",
  adept: "Adept",
  veteran: "Veteran",
  master: "Master",
  legend: "Legend",
};

export const TIER_GLOW: Record<CharacterTier, string> = {
  novice: "",
  apprentice: "drop-shadow-[0_0_6px_rgba(100,200,100,0.4)]",
  adept: "drop-shadow-[0_0_8px_rgba(60,130,246,0.5)]",
  veteran: "drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]",
  master: "drop-shadow-[0_0_12px_rgba(234,179,8,0.7)]",
  legend: "drop-shadow-[0_0_16px_rgba(239,68,68,0.8)]",
};

export const CLASS_SPRITES: Record<PlayerClass, string> = {
  Warrior: "8bit-orc-warrior.png",
  Mage: "8bit-wizard.png",
  Rogue: "8bit-ogre.png", // placeholder until we have a rogue sprite
  Paladin: "8bit-orc-warrior.png",
  Druid: "8bit-wizard.png",
  Ranger: "8bit-ogre.png",
  Bard: "8bit-wizard.png",
  Scholar: "8bit-wizard.png",
  Unclassed: "8bit-orc-warrior.png",
};

// ── Locations ───────────────────────────────────────────────────

export type LocationType = "city" | "wilderness" | "boss_lair";

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  /** Emoji icon for the location */
  icon: string;
}

export const LOCATION_TYPE_ICONS: Record<LocationType, string> = {
  city: "🏰",
  wilderness: "⚔️",
  boss_lair: "💀",
};

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  city: "City",
  wilderness: "Wilderness",
  boss_lair: "Boss Lair",
};

// ── Titles ──────────────────────────────────────────────────────

export type TitleCategory = "real_world" | "in_game";

export interface TitleDefinition {
  id: string;
  name: string;
  description: string;
  category: TitleCategory;
  icon: string;
}

// ── Player ──────────────────────────────────────────────────────

export interface Player {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  stats: Stats;
  playerClass: PlayerClass;
  streakDays: number;
  totalActivities: number;
  joinedAt: number;
  /** Equipped items by slot */
  equipment: Partial<Record<EquipSlot, EquipmentItem>>;
  /** All owned items (chest / bank) */
  chest: EquipmentItem[];
  /** Current biome the player is in */
  currentBiome: string;
  /** Unlocked biome IDs */
  unlockedBiomes: string[];
  /** Current location within the biome (null = biome overview) */
  currentLocation: string | null;
  /** Currently displayed title (null = none) */
  activeTitle: string | null;
  /** IDs of all unlocked titles */
  unlockedTitles: string[];
  /** Gold currency for buying/selling at shops */
  gold: number;
}

// ── Guild Types ────────────────────────────────────────────────

export interface GuildMember {
  name: string;
  playerClass: PlayerClass;
  level: number;
  /** Epoch ms when the member joined */
  joinedAt: number;
  /** Role within the guild */
  role: "leader" | "officer" | "member";
  /** Is the player currently online (client-side only for now) */
  online: boolean;
}

export interface GuildMessage {
  id: string;
  authorName: string;
  text: string;
  timestamp: number;
}

export interface Guild {
  id: string;
  name: string;
  tag: string;
  description: string;
  /** Epoch ms when the guild was created */
  createdAt: number;
  members: GuildMember[];
  messages: GuildMessage[];
  /** Maximum number of members allowed */
  maxMembers: number;
  /** Currently active raid, if any */
  activeRaid: Raid | null;
  /** Total raid wins for this guild */
  raidWins: number;
}

// ── Raid Types ─────────────────────────────────────────────────

export type RaidPhase = "lobby" | "fighting" | "victory" | "defeat";

export interface RaidCombatant {
  name: string;
  playerClass: PlayerClass;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  /** Is this combatant knocked out? */
  ko: boolean;
}

export interface RaidLogEntry {
  id: number;
  caster: string;
  target: string;
  spellName: string;
  element: string;
  damage: number;
  isHeal: boolean;
}

export interface Raid {
  /** Biome where the raid is happening */
  biomeId: string;
  /** Boss ID */
  bossId: string;
  /** Current phase */
  phase: RaidPhase;
  /** Boss current HP */
  bossHp: number;
  /** Boss max HP (scaled to guild size) */
  bossMaxHp: number;
  /** Boss current mana */
  bossMana: number;
  /** Guild members participating as combatants */
  combatants: RaidCombatant[];
  /** Index of the current combatant's turn */
  currentTurnIndex: number;
  /** Combat log */
  log: RaidLogEntry[];
  /** Epoch when the raid was started */
  startedAt: number;
}
