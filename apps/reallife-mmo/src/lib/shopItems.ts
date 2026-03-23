import type { BiomeId } from "./biomeThemes";
import type { EquipmentItem, ItemRarity } from "./types";

export interface ShopItem {
  item: EquipmentItem;
  cost: number;
}

export const SELL_PRICES: Record<ItemRarity, number> = {
  common: 5,
  uncommon: 12,
  rare: 25,
  epic: 60,
  legendary: 150,
};

/**
 * NPC shop inventories per biome. Each city sells biome-themed gear.
 */
export const BIOME_SHOPS: Record<BiomeId, ShopItem[]> = {
  plains: [
    {
      cost: 15,
      item: {
        id: "shop-plains-staff",
        name: "Oakwood Staff",
        slot: "weapon",
        rarity: "common",
        statBonus: { INT: 1, WIS: 1 },
        levelReq: 1,
        source: "Greenhollow Shop",
      },
    },
    {
      cost: 20,
      item: {
        id: "shop-plains-tunic",
        name: "Traveler's Tunic",
        slot: "armor",
        rarity: "common",
        statBonus: { CON: 1, AGI: 1 },
        levelReq: 1,
        source: "Greenhollow Shop",
      },
    },
    {
      cost: 30,
      item: {
        id: "shop-plains-cap",
        name: "Ranger's Cap",
        slot: "head",
        rarity: "uncommon",
        statBonus: { AGI: 2 },
        levelReq: 3,
        source: "Greenhollow Shop",
      },
    },
  ],
  tundra: [
    {
      cost: 35,
      item: {
        id: "shop-tundra-axe",
        name: "Frost-Edged Axe",
        slot: "weapon",
        rarity: "uncommon",
        statBonus: { STR: 2, CON: 1 },
        levelReq: 5,
        source: "Frostwatch Keep Shop",
      },
    },
    {
      cost: 40,
      item: {
        id: "shop-tundra-cloak",
        name: "Blizzard Cloak",
        slot: "armor",
        rarity: "uncommon",
        statBonus: { CON: 3 },
        levelReq: 5,
        source: "Frostwatch Keep Shop",
      },
    },
    {
      cost: 25,
      item: {
        id: "shop-tundra-charm",
        name: "Warmth Charm",
        slot: "accessory",
        rarity: "common",
        statBonus: { WIS: 1, CON: 1 },
        levelReq: 3,
        source: "Frostwatch Keep Shop",
      },
    },
  ],
  volcano: [
    {
      cost: 60,
      item: {
        id: "shop-volcano-blade",
        name: "Molten Blade",
        slot: "weapon",
        rarity: "rare",
        statBonus: { STR: 4, AGI: 1 },
        levelReq: 8,
        source: "Ember Forge Shop",
      },
    },
    {
      cost: 55,
      item: {
        id: "shop-volcano-plate",
        name: "Volcanic Plate",
        slot: "armor",
        rarity: "rare",
        statBonus: { CON: 4, STR: 1 },
        levelReq: 8,
        source: "Ember Forge Shop",
      },
    },
    {
      cost: 45,
      item: {
        id: "shop-volcano-crown",
        name: "Cinder Crown",
        slot: "head",
        rarity: "uncommon",
        statBonus: { STR: 2, INT: 1 },
        levelReq: 6,
        source: "Ember Forge Shop",
      },
    },
  ],
  forest: [
    {
      cost: 40,
      item: {
        id: "shop-forest-bow",
        name: "Yew Longbow",
        slot: "weapon",
        rarity: "uncommon",
        statBonus: { AGI: 3 },
        levelReq: 5,
        source: "Mossgrove Shop",
      },
    },
    {
      cost: 35,
      item: {
        id: "shop-forest-robe",
        name: "Druid's Robe",
        slot: "armor",
        rarity: "uncommon",
        statBonus: { WIS: 2, CON: 1 },
        levelReq: 4,
        source: "Mossgrove Shop",
      },
    },
    {
      cost: 30,
      item: {
        id: "shop-forest-circlet",
        name: "Leaf Circlet",
        slot: "head",
        rarity: "uncommon",
        statBonus: { WIS: 2, MP: 1 },
        levelReq: 4,
        source: "Mossgrove Shop",
      },
    },
  ],
  dungeon: [
    {
      cost: 55,
      item: {
        id: "shop-dungeon-dagger",
        name: "Shadow Dagger",
        slot: "weapon",
        rarity: "rare",
        statBonus: { AGI: 3, STR: 2 },
        levelReq: 7,
        source: "Torchlight Camp Shop",
      },
    },
    {
      cost: 50,
      item: {
        id: "shop-dungeon-mail",
        name: "Nightwalker Mail",
        slot: "armor",
        rarity: "rare",
        statBonus: { AGI: 2, CON: 2 },
        levelReq: 7,
        source: "Torchlight Camp Shop",
      },
    },
    {
      cost: 40,
      item: {
        id: "shop-dungeon-lantern",
        name: "Soulfire Lantern",
        slot: "accessory",
        rarity: "uncommon",
        statBonus: { INT: 2, WIS: 1 },
        levelReq: 5,
        source: "Torchlight Camp Shop",
      },
    },
  ],
  desert: [
    {
      cost: 60,
      item: {
        id: "shop-desert-scimitar",
        name: "Sandsteel Scimitar",
        slot: "weapon",
        rarity: "rare",
        statBonus: { STR: 3, AGI: 2 },
        levelReq: 8,
        source: "Sandstone Bazaar Shop",
      },
    },
    {
      cost: 50,
      item: {
        id: "shop-desert-wrap",
        name: "Desert Wraps",
        slot: "armor",
        rarity: "uncommon",
        statBonus: { AGI: 2, CON: 2 },
        levelReq: 6,
        source: "Sandstone Bazaar Shop",
      },
    },
    {
      cost: 45,
      item: {
        id: "shop-desert-turban",
        name: "Sun-Blessed Turban",
        slot: "head",
        rarity: "uncommon",
        statBonus: { WIS: 2, CHA: 1 },
        levelReq: 5,
        source: "Sandstone Bazaar Shop",
      },
    },
  ],
  spire: [
    {
      cost: 75,
      item: {
        id: "shop-spire-tome",
        name: "Arcane Grimoire",
        slot: "weapon",
        rarity: "rare",
        statBonus: { INT: 4, MP: 2 },
        levelReq: 10,
        source: "Library of Echoes Shop",
      },
    },
    {
      cost: 65,
      item: {
        id: "shop-spire-robe",
        name: "Scholar's Vestments",
        slot: "armor",
        rarity: "rare",
        statBonus: { INT: 2, WIS: 2, MP: 1 },
        levelReq: 10,
        source: "Library of Echoes Shop",
      },
    },
    {
      cost: 50,
      item: {
        id: "shop-spire-monocle",
        name: "Runic Monocle",
        slot: "accessory",
        rarity: "uncommon",
        statBonus: { INT: 3 },
        levelReq: 8,
        source: "Library of Echoes Shop",
      },
    },
  ],
  ruins: [
    {
      cost: 90,
      item: {
        id: "shop-ruins-sword",
        name: "Bonecleaver",
        slot: "weapon",
        rarity: "epic",
        statBonus: { STR: 5, CON: 2 },
        levelReq: 15,
        source: "Bonehaven Shop",
      },
    },
    {
      cost: 85,
      item: {
        id: "shop-ruins-armor",
        name: "Dragonbone Plate",
        slot: "armor",
        rarity: "epic",
        statBonus: { CON: 5, STR: 2 },
        levelReq: 15,
        source: "Bonehaven Shop",
      },
    },
    {
      cost: 70,
      item: {
        id: "shop-ruins-skull",
        name: "Skull of Insight",
        slot: "head",
        rarity: "rare",
        statBonus: { INT: 3, WIS: 3 },
        levelReq: 12,
        source: "Bonehaven Shop",
      },
    },
  ],
  celestial: [
    {
      cost: 120,
      item: {
        id: "shop-celestial-blade",
        name: "Starforged Blade",
        slot: "weapon",
        rarity: "epic",
        statBonus: { STR: 6, AGI: 3, INT: 2 },
        levelReq: 20,
        source: "Starfall Sanctum Shop",
      },
    },
    {
      cost: 110,
      item: {
        id: "shop-celestial-robe",
        name: "Astral Vestments",
        slot: "armor",
        rarity: "epic",
        statBonus: { CON: 4, WIS: 3, MP: 3 },
        levelReq: 20,
        source: "Starfall Sanctum Shop",
      },
    },
    {
      cost: 80,
      item: {
        id: "shop-celestial-halo",
        name: "Celestial Halo",
        slot: "head",
        rarity: "epic",
        statBonus: { WIS: 4, CHA: 3 },
        levelReq: 18,
        source: "Starfall Sanctum Shop",
      },
    },
  ],
};

/** NPC merchant names per biome */
export const BIOME_MERCHANTS: Record<BiomeId, { name: string; sprite: string; greeting: string }> =
  {
    plains: {
      name: "Old Barley",
      sprite: "🧓",
      greeting: "Welcome, traveler! Stock up before the road ahead.",
    },
    tundra: {
      name: "Frostbeard",
      sprite: "🧔",
      greeting: "Brrr! Warm yer bones and check me wares!",
    },
    volcano: {
      name: "Smeltara",
      sprite: "👩‍🔧",
      greeting: "Forged in fire! Only the finest for warriors like you.",
    },
    forest: {
      name: "Willowwhisper",
      sprite: "🧝",
      greeting: "The forest provides. Take what you need, friend.",
    },
    dungeon: {
      name: "Grim",
      sprite: "🦹",
      greeting: "Psst... need gear for the dark ahead?",
    },
    desert: {
      name: "Hazeel",
      sprite: "🧕",
      greeting: "The finest goods from across the dunes!",
    },
    spire: {
      name: "Arcanist Vex",
      sprite: "🧙",
      greeting: "Knowledge has a price. As does power.",
    },
    ruins: {
      name: "Rattlejaw",
      sprite: "💀",
      greeting: "Heh heh... the dead need no gold. But you do.",
    },
    celestial: {
      name: "Stellara",
      sprite: "✨",
      greeting: "You have journeyed far. These items are worthy of you.",
    },
  };
