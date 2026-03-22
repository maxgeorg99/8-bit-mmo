import type { EquipmentItem, PlayerClass } from "./types";

/**
 * Milestone rewards — items earned at specific levels or activity counts.
 * Each milestone has a condition check and an item reward.
 */
interface Milestone {
  id: string;
  check: (ctx: { level: number; totalActivities: number; playerClass: PlayerClass }) => boolean;
  item: EquipmentItem;
}

const MILESTONES: Milestone[] = [
  // Level milestones
  {
    id: "starter-sword",
    check: ({ level }) => level >= 2,
    item: {
      id: "starter-sword",
      name: "Wooden Sword",
      slot: "weapon",
      rarity: "common",
      statBonus: { STR: 1 },
      levelReq: 2,
      source: "Reached Level 2",
    },
  },
  {
    id: "leather-armor",
    check: ({ level }) => level >= 3,
    item: {
      id: "leather-armor",
      name: "Leather Vest",
      slot: "armor",
      rarity: "common",
      statBonus: { CON: 1 },
      levelReq: 3,
      source: "Reached Level 3",
    },
  },
  {
    id: "iron-helm",
    check: ({ level }) => level >= 5,
    item: {
      id: "iron-helm",
      name: "Iron Helm",
      slot: "head",
      rarity: "uncommon",
      statBonus: { CON: 2 },
      levelReq: 5,
      source: "Reached Level 5",
    },
  },
  {
    id: "focus-amulet",
    check: ({ level }) => level >= 7,
    item: {
      id: "focus-amulet",
      name: "Amulet of Focus",
      slot: "accessory",
      rarity: "uncommon",
      statBonus: { INT: 2, WIS: 1 },
      levelReq: 7,
      source: "Reached Level 7",
    },
  },
  {
    id: "steel-blade",
    check: ({ level }) => level >= 10,
    item: {
      id: "steel-blade",
      name: "Steel Blade",
      slot: "weapon",
      rarity: "rare",
      statBonus: { STR: 3, AGI: 1 },
      levelReq: 10,
      source: "Reached Level 10",
    },
  },
  {
    id: "chainmail",
    check: ({ level }) => level >= 12,
    item: {
      id: "chainmail",
      name: "Chainmail",
      slot: "armor",
      rarity: "rare",
      statBonus: { CON: 3, STR: 1 },
      levelReq: 12,
      source: "Reached Level 12",
    },
  },
  {
    id: "crown-of-wisdom",
    check: ({ level }) => level >= 15,
    item: {
      id: "crown-of-wisdom",
      name: "Crown of Wisdom",
      slot: "head",
      rarity: "rare",
      statBonus: { WIS: 3, INT: 2 },
      levelReq: 15,
      source: "Reached Level 15",
    },
  },
  {
    id: "epic-class-weapon",
    check: ({ level }) => level >= 20,
    item: {
      id: "epic-class-weapon",
      name: "Battle Axe of Valor",
      slot: "weapon",
      rarity: "epic",
      statBonus: { STR: 5, CON: 2 },
      levelReq: 20,
      source: "Reached Level 20",
    },
  },
  // Activity milestones
  {
    id: "first-ten",
    check: ({ totalActivities }) => totalActivities >= 10,
    item: {
      id: "first-ten",
      name: "Ring of Dedication",
      slot: "accessory",
      rarity: "uncommon",
      statBonus: { WIS: 1, CHA: 1 },
      levelReq: 1,
      source: "Logged 10 activities",
    },
  },
  {
    id: "grinder-50",
    check: ({ totalActivities }) => totalActivities >= 50,
    item: {
      id: "grinder-50",
      name: "Cloak of the Grinder",
      slot: "armor",
      rarity: "epic",
      statBonus: { CON: 3, WIS: 2, CHA: 2 },
      levelReq: 1,
      source: "Logged 50 activities",
    },
  },
  {
    id: "legendary-100",
    check: ({ totalActivities }) => totalActivities >= 100,
    item: {
      id: "legendary-100",
      name: "Legendary Blade of the Century",
      slot: "weapon",
      rarity: "legendary",
      statBonus: { STR: 8, AGI: 4, INT: 4 },
      levelReq: 1,
      source: "Logged 100 activities",
    },
  },
];

/**
 * Check milestones and return any newly earned items that aren't already in chest.
 */
export function checkMilestoneRewards(
  level: number,
  totalActivities: number,
  playerClass: PlayerClass,
  existingItemIds: string[],
): EquipmentItem[] {
  const existing = new Set(existingItemIds);
  return MILESTONES.filter(
    (m) => m.check({ level, totalActivities, playerClass }) && !existing.has(m.item.id),
  ).map((m) => m.item);
}

/**
 * Get the next upcoming milestones that haven't been earned yet (max 3).
 */
export function getNextMilestones(
  level: number,
  totalActivities: number,
  playerClass: PlayerClass,
  existingItemIds: string[],
): Array<{ item: EquipmentItem; hint: string }> {
  const existing = new Set(existingItemIds);
  return MILESTONES.filter(
    (m) => !m.check({ level, totalActivities, playerClass }) && !existing.has(m.item.id),
  )
    .slice(0, 3)
    .map((m) => ({ item: m.item, hint: m.item.source }));
}
