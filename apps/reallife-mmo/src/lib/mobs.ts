import type { BiomeId } from "./biomeThemes";
import type { EquipmentItem } from "./types";

// ── Mob Definition ──────────────────────────────────────────────

export interface MobDefinition {
  id: string;
  name: string;
  sprite: string;
  hp: number;
  mana: number;
  /** Base damage range [min, max] */
  damage: [number, number];
  /** XP awarded on defeat */
  xpReward: number;
  /** Possible equipment drops with drop chance (0-1) */
  lootTable: Array<{ item: EquipmentItem; chance: number }>;
}

// ── Biome Tiers (determines difficulty scaling) ─────────────────

const BIOME_TIER: Record<BiomeId, number> = {
  plains: 1,
  forest: 2,
  tundra: 2,
  desert: 3,
  dungeon: 3,
  volcano: 4,
  spire: 4,
  ruins: 5,
  celestial: 6,
};

// ── Mob Definitions Per Biome ───────────────────────────────────

export const BIOME_MOBS: Record<BiomeId, MobDefinition[]> = {
  plains: [
    {
      id: "slime",
      name: "Green Slime",
      sprite: "🟢",
      hp: 30,
      mana: 20,
      damage: [3, 6],
      xpReward: 15,
      lootTable: [
        {
          item: {
            id: "slime-ring",
            name: "Slime Ring",
            slot: "accessory",
            rarity: "common",
            statBonus: { CON: 1 },
            levelReq: 1,
            source: "Green Slime drop",
          },
          chance: 0.2,
        },
      ],
    },
    {
      id: "wild-boar",
      name: "Wild Boar",
      sprite: "🐗",
      hp: 40,
      mana: 15,
      damage: [4, 8],
      xpReward: 20,
      lootTable: [
        {
          item: {
            id: "boar-tusk",
            name: "Boar Tusk Dagger",
            slot: "weapon",
            rarity: "common",
            statBonus: { STR: 2 },
            levelReq: 2,
            source: "Wild Boar drop",
          },
          chance: 0.15,
        },
      ],
    },
    {
      id: "field-sprite",
      name: "Field Sprite",
      sprite: "🧚",
      hp: 25,
      mana: 40,
      damage: [5, 9],
      xpReward: 18,
      lootTable: [
        {
          item: {
            id: "sprite-hood",
            name: "Sprite Hood",
            slot: "head",
            rarity: "uncommon",
            statBonus: { WIS: 2, MP: 1 },
            levelReq: 3,
            source: "Field Sprite drop",
          },
          chance: 0.12,
        },
      ],
    },
  ],
  forest: [
    {
      id: "treant",
      name: "Angry Treant",
      sprite: "🌳",
      hp: 55,
      mana: 25,
      damage: [6, 11],
      xpReward: 30,
      lootTable: [
        {
          item: {
            id: "bark-armor",
            name: "Bark Armor",
            slot: "armor",
            rarity: "uncommon",
            statBonus: { CON: 3, STR: 1 },
            levelReq: 5,
            source: "Angry Treant drop",
          },
          chance: 0.15,
        },
      ],
    },
    {
      id: "forest-wolf",
      name: "Shadow Wolf",
      sprite: "🐺",
      hp: 45,
      mana: 20,
      damage: [7, 12],
      xpReward: 28,
      lootTable: [
        {
          item: {
            id: "wolf-fang",
            name: "Wolf Fang Pendant",
            slot: "accessory",
            rarity: "uncommon",
            statBonus: { AGI: 2, STR: 1 },
            levelReq: 4,
            source: "Shadow Wolf drop",
          },
          chance: 0.15,
        },
      ],
    },
    {
      id: "vine-creeper",
      name: "Vine Creeper",
      sprite: "🌿",
      hp: 35,
      mana: 35,
      damage: [5, 10],
      xpReward: 25,
      lootTable: [
        {
          item: {
            id: "vine-staff",
            name: "Living Vine Staff",
            slot: "weapon",
            rarity: "uncommon",
            statBonus: { WIS: 3, MP: 2 },
            levelReq: 5,
            source: "Vine Creeper drop",
          },
          chance: 0.12,
        },
      ],
    },
  ],
  tundra: [
    {
      id: "ice-wolf",
      name: "Frost Wolf",
      sprite: "🐺",
      hp: 50,
      mana: 25,
      damage: [7, 12],
      xpReward: 30,
      lootTable: [
        {
          item: {
            id: "frost-cloak",
            name: "Frost Cloak",
            slot: "armor",
            rarity: "uncommon",
            statBonus: { CON: 2, WIS: 2 },
            levelReq: 6,
            source: "Frost Wolf drop",
          },
          chance: 0.15,
        },
      ],
    },
    {
      id: "frost-sprite",
      name: "Frost Sprite",
      sprite: "❄️",
      hp: 35,
      mana: 45,
      damage: [8, 13],
      xpReward: 28,
      lootTable: [
        {
          item: {
            id: "ice-crown",
            name: "Ice Crystal Crown",
            slot: "head",
            rarity: "rare",
            statBonus: { INT: 3, MP: 3 },
            levelReq: 7,
            source: "Frost Sprite drop",
          },
          chance: 0.1,
        },
      ],
    },
    {
      id: "yeti",
      name: "Mountain Yeti",
      sprite: "🦍",
      hp: 65,
      mana: 15,
      damage: [9, 15],
      xpReward: 35,
      lootTable: [
        {
          item: {
            id: "yeti-gauntlet",
            name: "Yeti Fur Gauntlets",
            slot: "accessory",
            rarity: "uncommon",
            statBonus: { STR: 3, CON: 2 },
            levelReq: 6,
            source: "Mountain Yeti drop",
          },
          chance: 0.12,
        },
      ],
    },
  ],
  desert: [
    {
      id: "sand-worm",
      name: "Sand Worm",
      sprite: "🪱",
      hp: 70,
      mana: 20,
      damage: [10, 16],
      xpReward: 40,
      lootTable: [
        {
          item: {
            id: "worm-scale",
            name: "Worm Scale Vest",
            slot: "armor",
            rarity: "rare",
            statBonus: { CON: 4, AGI: 2 },
            levelReq: 10,
            source: "Sand Worm drop",
          },
          chance: 0.1,
        },
      ],
    },
    {
      id: "desert-bandit",
      name: "Desert Bandit",
      sprite: "🗡️",
      hp: 55,
      mana: 30,
      damage: [9, 14],
      xpReward: 35,
      lootTable: [
        {
          item: {
            id: "bandit-blade",
            name: "Curved Scimitar",
            slot: "weapon",
            rarity: "rare",
            statBonus: { STR: 3, AGI: 3 },
            levelReq: 9,
            source: "Desert Bandit drop",
          },
          chance: 0.12,
        },
      ],
    },
    {
      id: "scorpion",
      name: "Giant Scorpion",
      sprite: "🦂",
      hp: 60,
      mana: 25,
      damage: [11, 17],
      xpReward: 38,
      lootTable: [
        {
          item: {
            id: "scorpion-ring",
            name: "Venom Ring",
            slot: "accessory",
            rarity: "rare",
            statBonus: { AGI: 4, CHA: 1 },
            levelReq: 10,
            source: "Giant Scorpion drop",
          },
          chance: 0.1,
        },
      ],
    },
  ],
  dungeon: [
    {
      id: "cave-bat",
      name: "Giant Bat",
      sprite: "🦇",
      hp: 50,
      mana: 30,
      damage: [9, 15],
      xpReward: 35,
      lootTable: [
        {
          item: {
            id: "bat-wing-hood",
            name: "Bat Wing Hood",
            slot: "head",
            rarity: "rare",
            statBonus: { AGI: 3, INT: 2 },
            levelReq: 9,
            source: "Giant Bat drop",
          },
          chance: 0.12,
        },
      ],
    },
    {
      id: "wraith",
      name: "Dungeon Wraith",
      sprite: "👻",
      hp: 45,
      mana: 50,
      damage: [12, 18],
      xpReward: 42,
      lootTable: [
        {
          item: {
            id: "wraith-orb",
            name: "Soul Orb",
            slot: "accessory",
            rarity: "rare",
            statBonus: { INT: 4, MP: 3 },
            levelReq: 10,
            source: "Dungeon Wraith drop",
          },
          chance: 0.1,
        },
      ],
    },
    {
      id: "skeleton",
      name: "Skeleton Warrior",
      sprite: "💀",
      hp: 60,
      mana: 20,
      damage: [10, 16],
      xpReward: 38,
      lootTable: [
        {
          item: {
            id: "bone-blade",
            name: "Bone Blade",
            slot: "weapon",
            rarity: "rare",
            statBonus: { STR: 4, CON: 2 },
            levelReq: 9,
            source: "Skeleton Warrior drop",
          },
          chance: 0.12,
        },
      ],
    },
  ],
  volcano: [
    {
      id: "fire-elemental",
      name: "Fire Elemental",
      sprite: "🔥",
      hp: 75,
      mana: 40,
      damage: [14, 20],
      xpReward: 50,
      lootTable: [
        {
          item: {
            id: "flame-staff",
            name: "Inferno Staff",
            slot: "weapon",
            rarity: "epic",
            statBonus: { INT: 5, MP: 4, STR: 2 },
            levelReq: 15,
            source: "Fire Elemental drop",
          },
          chance: 0.08,
        },
      ],
    },
    {
      id: "magma-crawler",
      name: "Magma Crawler",
      sprite: "🐛",
      hp: 85,
      mana: 20,
      damage: [13, 19],
      xpReward: 48,
      lootTable: [
        {
          item: {
            id: "magma-plate",
            name: "Magma Plate Armor",
            slot: "armor",
            rarity: "epic",
            statBonus: { CON: 6, STR: 3 },
            levelReq: 15,
            source: "Magma Crawler drop",
          },
          chance: 0.08,
        },
      ],
    },
    {
      id: "lava-imp",
      name: "Lava Imp",
      sprite: "😈",
      hp: 55,
      mana: 55,
      damage: [15, 22],
      xpReward: 45,
      lootTable: [
        {
          item: {
            id: "imp-crown",
            name: "Imp Flame Crown",
            slot: "head",
            rarity: "epic",
            statBonus: { INT: 4, WIS: 3, MP: 3 },
            levelReq: 14,
            source: "Lava Imp drop",
          },
          chance: 0.08,
        },
      ],
    },
  ],
  spire: [
    {
      id: "spell-construct",
      name: "Spell Construct",
      sprite: "🤖",
      hp: 70,
      mana: 60,
      damage: [14, 21],
      xpReward: 50,
      lootTable: [
        {
          item: {
            id: "rune-blade",
            name: "Runic Blade",
            slot: "weapon",
            rarity: "epic",
            statBonus: { STR: 4, INT: 4, MP: 2 },
            levelReq: 15,
            source: "Spell Construct drop",
          },
          chance: 0.08,
        },
      ],
    },
    {
      id: "animated-book",
      name: "Animated Tome",
      sprite: "📕",
      hp: 50,
      mana: 70,
      damage: [16, 23],
      xpReward: 48,
      lootTable: [
        {
          item: {
            id: "tome-amulet",
            name: "Tome of Echoes",
            slot: "accessory",
            rarity: "epic",
            statBonus: { INT: 5, WIS: 4 },
            levelReq: 16,
            source: "Animated Tome drop",
          },
          chance: 0.08,
        },
      ],
    },
    {
      id: "rune-golem",
      name: "Rune Golem",
      sprite: "🗿",
      hp: 95,
      mana: 30,
      damage: [13, 19],
      xpReward: 52,
      lootTable: [
        {
          item: {
            id: "golem-armor",
            name: "Golem Core Plate",
            slot: "armor",
            rarity: "epic",
            statBonus: { CON: 7, STR: 4 },
            levelReq: 16,
            source: "Rune Golem drop",
          },
          chance: 0.07,
        },
      ],
    },
  ],
  ruins: [
    {
      id: "undead-knight",
      name: "Undead Knight",
      sprite: "⚔️",
      hp: 100,
      mana: 30,
      damage: [16, 24],
      xpReward: 60,
      lootTable: [
        {
          item: {
            id: "cursed-sword",
            name: "Cursed Greatsword",
            slot: "weapon",
            rarity: "epic",
            statBonus: { STR: 7, AGI: 3 },
            levelReq: 20,
            source: "Undead Knight drop",
          },
          chance: 0.07,
        },
      ],
    },
    {
      id: "bone-mage",
      name: "Bone Mage",
      sprite: "☠️",
      hp: 65,
      mana: 70,
      damage: [18, 26],
      xpReward: 58,
      lootTable: [
        {
          item: {
            id: "bone-circlet",
            name: "Circlet of the Dead",
            slot: "head",
            rarity: "epic",
            statBonus: { INT: 6, MP: 5, WIS: 2 },
            levelReq: 20,
            source: "Bone Mage drop",
          },
          chance: 0.07,
        },
      ],
    },
    {
      id: "dragon-whelp",
      name: "Dragon Whelp",
      sprite: "🐲",
      hp: 110,
      mana: 45,
      damage: [17, 25],
      xpReward: 65,
      lootTable: [
        {
          item: {
            id: "dragon-scale",
            name: "Dragon Scale Mail",
            slot: "armor",
            rarity: "legendary",
            statBonus: { CON: 8, STR: 5, AGI: 3 },
            levelReq: 22,
            source: "Dragon Whelp drop",
          },
          chance: 0.05,
        },
      ],
    },
  ],
  celestial: [
    {
      id: "void-walker",
      name: "Void Walker",
      sprite: "🌀",
      hp: 120,
      mana: 60,
      damage: [20, 30],
      xpReward: 80,
      lootTable: [
        {
          item: {
            id: "void-blade",
            name: "Void Edge",
            slot: "weapon",
            rarity: "legendary",
            statBonus: { STR: 8, INT: 5, AGI: 4 },
            levelReq: 30,
            source: "Void Walker drop",
          },
          chance: 0.05,
        },
      ],
    },
    {
      id: "astral-phantom",
      name: "Astral Phantom",
      sprite: "👁️",
      hp: 90,
      mana: 80,
      damage: [22, 32],
      xpReward: 75,
      lootTable: [
        {
          item: {
            id: "astral-crown",
            name: "Astral Crown",
            slot: "head",
            rarity: "legendary",
            statBonus: { INT: 8, WIS: 6, MP: 5 },
            levelReq: 30,
            source: "Astral Phantom drop",
          },
          chance: 0.04,
        },
      ],
    },
    {
      id: "star-golem",
      name: "Star Colossus",
      sprite: "⭐",
      hp: 140,
      mana: 40,
      damage: [19, 28],
      xpReward: 85,
      lootTable: [
        {
          item: {
            id: "star-plate",
            name: "Starsteel Plate",
            slot: "armor",
            rarity: "legendary",
            statBonus: { CON: 10, STR: 6, WIS: 4 },
            levelReq: 32,
            source: "Star Colossus drop",
          },
          chance: 0.04,
        },
      ],
    },
  ],
};

/** Pick a random mob from the given biome */
export function getRandomMob(biomeId: BiomeId): MobDefinition {
  const mobs = BIOME_MOBS[biomeId];
  return mobs[Math.floor(Math.random() * mobs.length)];
}

/** Roll loot drops after defeating a mob */
export function rollLoot(mob: MobDefinition): EquipmentItem[] {
  const drops: EquipmentItem[] = [];
  for (const entry of mob.lootTable) {
    if (Math.random() < entry.chance) {
      // Give each drop a unique ID so duplicates don't collide
      drops.push({
        ...entry.item,
        id: `${entry.item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      });
    }
  }
  return drops;
}

export { BIOME_TIER };
