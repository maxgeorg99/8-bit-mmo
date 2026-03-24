import type { BiomeId } from "./biomeThemes";
import type { EquipmentItem } from "./types";

export interface BossAbility {
  id: string;
  name: string;
  element: string;
  damage: number;
  /** If true, hits ALL guild members */
  isAoe: boolean;
  /** Special effect description */
  effect?: string;
}

export interface RaidBoss {
  id: string;
  name: string;
  biome: BiomeId;
  /** Boss sprite emoji */
  sprite: string;
  /** Boss HP scales with guild size: baseHp + perMemberHp * memberCount */
  baseHp: number;
  perMemberHp: number;
  /** Boss damage range */
  abilities: BossAbility[];
  /** Mana the boss uses for abilities */
  mana: number;
  /** XP reward per participating member */
  xpReward: number;
  /** Gold reward per participating member */
  goldReward: number;
  /** Guaranteed loot drop for the guild */
  loot: EquipmentItem;
  /** Boss battle intro text */
  intro: string;
  /** Mechanic theme description */
  mechanic: string;
}

export const RAID_BOSSES: Record<BiomeId, RaidBoss> = {
  plains: {
    id: "boss-thornback",
    name: "Thornback the Elder",
    biome: "plains",
    sprite: "🌳",
    baseHp: 150,
    perMemberHp: 40,
    abilities: [
      { id: "thorn-lash", name: "Thorn Lash", element: "Nature", damage: 8, isAoe: false },
      {
        id: "vine-storm",
        name: "Vine Storm",
        element: "Nature",
        damage: 5,
        isAoe: true,
        effect: "Thorny vines lash all heroes!",
      },
      {
        id: "root-slam",
        name: "Root Slam",
        element: "Physical",
        damage: 14,
        isAoe: false,
        effect: "Massive roots crush a single target!",
      },
    ],
    mana: 60,
    xpReward: 80,
    goldReward: 30,
    loot: {
      id: "raid-thornback-staff",
      name: "Thornback's Living Staff",
      slot: "weapon",
      rarity: "rare",
      statBonus: { STR: 3, CON: 3, WIS: 2 },
      levelReq: 5,
      source: "Thornback the Elder",
    },
    intro: "The ancient tree shakes the earth as it awakens...",
    mechanic: "Nature/thorns — periodic AoE vine damage",
  },
  tundra: {
    id: "boss-frostlord",
    name: "The Frostlord",
    biome: "tundra",
    sprite: "🧊",
    baseHp: 200,
    perMemberHp: 50,
    abilities: [
      { id: "ice-lance", name: "Ice Lance", element: "Ice", damage: 12, isAoe: false },
      {
        id: "blizzard",
        name: "Blizzard",
        element: "Ice",
        damage: 7,
        isAoe: true,
        effect: "A freezing blizzard engulfs the party!",
      },
      {
        id: "frost-nova",
        name: "Frost Nova",
        element: "Ice",
        damage: 16,
        isAoe: false,
        effect: "Shattering ice pierces through armor!",
      },
    ],
    mana: 80,
    xpReward: 120,
    goldReward: 45,
    loot: {
      id: "raid-frostlord-crown",
      name: "Frostlord's Crown",
      slot: "head",
      rarity: "epic",
      statBonus: { CON: 4, WIS: 3, INT: 2 },
      levelReq: 8,
      source: "The Frostlord",
    },
    intro: "The temperature plummets as the Frostlord materializes from the blizzard...",
    mechanic: "Ice/freeze — slowing AoE blizzards",
  },
  volcano: {
    id: "boss-ignisfury",
    name: "Ignisfury",
    biome: "volcano",
    sprite: "🔥",
    baseHp: 250,
    perMemberHp: 60,
    abilities: [
      { id: "flame-breath", name: "Flame Breath", element: "Fire", damage: 14, isAoe: false },
      {
        id: "eruption",
        name: "Eruption",
        element: "Fire",
        damage: 9,
        isAoe: true,
        effect: "Magma erupts beneath the entire party!",
      },
      {
        id: "meteor",
        name: "Meteor Strike",
        element: "Fire",
        damage: 22,
        isAoe: false,
        effect: "A blazing meteor crashes down!",
      },
    ],
    mana: 100,
    xpReward: 150,
    goldReward: 55,
    loot: {
      id: "raid-ignisfury-plate",
      name: "Ignisfury's Molten Plate",
      slot: "armor",
      rarity: "epic",
      statBonus: { STR: 5, CON: 4, AGI: 1 },
      levelReq: 10,
      source: "Ignisfury",
    },
    intro: "The volcano shakes as Ignisfury rises from the lava...",
    mechanic: "Fire/AoE — devastating eruption attacks",
  },
  forest: {
    id: "boss-rootwarden",
    name: "Rootwarden",
    biome: "forest",
    sprite: "🌲",
    baseHp: 220,
    perMemberHp: 55,
    abilities: [
      { id: "branch-whip", name: "Branch Whip", element: "Nature", damage: 10, isAoe: false },
      {
        id: "regrowth",
        name: "Regrowth",
        element: "Heal",
        damage: 20,
        isAoe: false,
        effect: "Rootwarden regenerates health!",
      },
      {
        id: "forest-wrath",
        name: "Forest's Wrath",
        element: "Nature",
        damage: 8,
        isAoe: true,
        effect: "The entire forest strikes at the intruders!",
      },
    ],
    mana: 90,
    xpReward: 130,
    goldReward: 50,
    loot: {
      id: "raid-rootwarden-robe",
      name: "Rootwarden's Bark Robe",
      slot: "armor",
      rarity: "epic",
      statBonus: { WIS: 5, CON: 4, MP: 2 },
      levelReq: 8,
      source: "Rootwarden",
    },
    intro: "The forest itself awakens as Rootwarden unfurls...",
    mechanic: "Heal/regen — boss heals itself periodically",
  },
  dungeon: {
    id: "boss-shadow-baron",
    name: "Shadow Baron",
    biome: "dungeon",
    sprite: "👤",
    baseHp: 260,
    perMemberHp: 60,
    abilities: [
      { id: "shadow-bolt", name: "Shadow Bolt", element: "Arcane", damage: 13, isAoe: false },
      {
        id: "darkness",
        name: "Engulfing Darkness",
        element: "Arcane",
        damage: 8,
        isAoe: true,
        effect: "Shadows drain the life of all heroes!",
      },
      {
        id: "soul-rend",
        name: "Soul Rend",
        element: "Arcane",
        damage: 20,
        isAoe: false,
        effect: "The Baron tears at your very soul!",
      },
    ],
    mana: 100,
    xpReward: 160,
    goldReward: 60,
    loot: {
      id: "raid-baron-dagger",
      name: "Baron's Shadow Dagger",
      slot: "weapon",
      rarity: "epic",
      statBonus: { AGI: 5, STR: 3, INT: 2 },
      levelReq: 10,
      source: "Shadow Baron",
    },
    intro: "Shadows coalesce into a towering figure of pure darkness...",
    mechanic: "Darkness/debuff — AoE life drain",
  },
  desert: {
    id: "boss-stonefist",
    name: "King Stonefist",
    biome: "desert",
    sprite: "👊",
    baseHp: 280,
    perMemberHp: 65,
    abilities: [
      { id: "earth-punch", name: "Earth Punch", element: "Physical", damage: 15, isAoe: false },
      {
        id: "sandstorm",
        name: "Sandstorm",
        element: "Physical",
        damage: 8,
        isAoe: true,
        effect: "A blinding sandstorm batters the party!",
      },
      {
        id: "seismic-slam",
        name: "Seismic Slam",
        element: "Physical",
        damage: 24,
        isAoe: false,
        effect: "The ground shatters under Stonefist's power!",
      },
    ],
    mana: 90,
    xpReward: 170,
    goldReward: 65,
    loot: {
      id: "raid-stonefist-gauntlets",
      name: "Stonefist's Gauntlets",
      slot: "accessory",
      rarity: "epic",
      statBonus: { STR: 6, CON: 4 },
      levelReq: 12,
      source: "King Stonefist",
    },
    intro: "The Dwarf King cracks his stone knuckles and roars...",
    mechanic: "Earth/stun — heavy single-target hits",
  },
  spire: {
    id: "boss-archivist",
    name: "The Archivist",
    biome: "spire",
    sprite: "📖",
    baseHp: 300,
    perMemberHp: 70,
    abilities: [
      { id: "arcane-beam", name: "Arcane Beam", element: "Arcane", damage: 14, isAoe: false },
      {
        id: "knowledge-overload",
        name: "Knowledge Overload",
        element: "Arcane",
        damage: 10,
        isAoe: true,
        effect: "Pure knowledge overwhelms your senses!",
      },
      {
        id: "reality-warp",
        name: "Reality Warp",
        element: "Arcane",
        damage: 22,
        isAoe: false,
        effect: "Reality itself bends to the Archivist's will!",
      },
    ],
    mana: 120,
    xpReward: 200,
    goldReward: 75,
    loot: {
      id: "raid-archivist-tome",
      name: "Archivist's Infinite Tome",
      slot: "weapon",
      rarity: "epic",
      statBonus: { INT: 6, WIS: 4, MP: 3 },
      levelReq: 14,
      source: "The Archivist",
    },
    intro: "Books swirl in a vortex as the Archivist takes form...",
    mechanic: "Arcane/silence — mental AoE pressure",
  },
  ruins: {
    id: "boss-skarveth",
    name: "Skarveth the Undying",
    biome: "ruins",
    sprite: "⚰️",
    baseHp: 350,
    perMemberHp: 80,
    abilities: [
      { id: "death-touch", name: "Death Touch", element: "Arcane", damage: 16, isAoe: false },
      {
        id: "plague-wave",
        name: "Plague Wave",
        element: "Arcane",
        damage: 11,
        isAoe: true,
        effect: "A wave of necrotic energy washes over the party!",
      },
      {
        id: "drain-soul",
        name: "Drain Soul",
        element: "Arcane",
        damage: 25,
        isAoe: false,
        effect: "Skarveth drains life to heal himself!",
      },
    ],
    mana: 130,
    xpReward: 250,
    goldReward: 90,
    loot: {
      id: "raid-skarveth-armor",
      name: "Skarveth's Deathplate",
      slot: "armor",
      rarity: "legendary",
      statBonus: { CON: 8, STR: 5, WIS: 3 },
      levelReq: 18,
      source: "Skarveth the Undying",
    },
    intro: "Bones rattle as the Undying rises from his golden sarcophagus...",
    mechanic: "Undead/drain — heals from damage dealt",
  },
  celestial: {
    id: "boss-architect",
    name: "The Architect",
    biome: "celestial",
    sprite: "🌀",
    baseHp: 400,
    perMemberHp: 90,
    abilities: [
      { id: "cosmic-ray", name: "Cosmic Ray", element: "Arcane", damage: 18, isAoe: false },
      {
        id: "supernova",
        name: "Supernova",
        element: "Fire",
        damage: 12,
        isAoe: true,
        effect: "A star explodes across all dimensions!",
      },
      {
        id: "unmake",
        name: "Unmake",
        element: "Arcane",
        damage: 30,
        isAoe: false,
        effect: "The Architect attempts to erase you from existence!",
      },
    ],
    mana: 150,
    xpReward: 350,
    goldReward: 120,
    loot: {
      id: "raid-architect-halo",
      name: "Architect's Cosmic Halo",
      slot: "head",
      rarity: "legendary",
      statBonus: { INT: 7, WIS: 6, CHA: 5, MP: 4 },
      levelReq: 22,
      source: "The Architect",
    },
    intro: "Stars collapse as The Architect manifests from the fabric of reality...",
    mechanic: "Cosmic/phase — devastating ultimate attacks",
  },
};
