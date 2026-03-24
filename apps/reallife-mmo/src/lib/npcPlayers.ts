import type { PlayerClass, Stats, EquipSlot, EquipmentItem } from "./types";

/**
 * Fake NPC player profiles for leaderboards, city scenes, and inspection.
 * These will be replaced by real SpacetimeDB player data after Phase 4.
 */
export interface NpcPlayer {
  name: string;
  level: number;
  playerClass: PlayerClass;
  title?: string;
  stats: Stats;
  equipment: Partial<Record<EquipSlot, EquipmentItem>>;
  guildName?: string;
  online: boolean;
}

export const NPC_PLAYERS: NpcPlayer[] = [
  {
    name: "Grimjaw",
    level: 18,
    playerClass: "Warrior",
    title: "Iron Will",
    stats: { STR: 28, AGI: 8, INT: 4, CON: 22, WIS: 5, CHA: 3, MP: 2 },
    equipment: {
      weapon: {
        id: "npc-grim-weapon",
        name: "War Cleaver",
        slot: "weapon",
        rarity: "rare",
        statBonus: { STR: 4 },
        levelReq: 10,
        source: "NPC",
      },
      armor: {
        id: "npc-grim-armor",
        name: "Iron Plate",
        slot: "armor",
        rarity: "uncommon",
        statBonus: { CON: 3 },
        levelReq: 8,
        source: "NPC",
      },
    },
    guildName: "Iron Wolves",
    online: true,
  },
  {
    name: "Vex",
    level: 20,
    playerClass: "Mage",
    title: "Master of Engineering",
    stats: { STR: 3, AGI: 6, INT: 35, CON: 10, WIS: 20, CHA: 5, MP: 18 },
    equipment: {
      weapon: {
        id: "npc-vex-weapon",
        name: "Arcane Grimoire",
        slot: "weapon",
        rarity: "epic",
        statBonus: { INT: 6, MP: 3 },
        levelReq: 15,
        source: "NPC",
      },
    },
    guildName: "Arcanum",
    online: false,
  },
  {
    name: "Shade",
    level: 22,
    playerClass: "Rogue",
    title: "First Blood",
    stats: { STR: 12, AGI: 32, INT: 8, CON: 14, WIS: 4, CHA: 6, MP: 5 },
    equipment: {
      weapon: {
        id: "npc-shade-weapon",
        name: "Shadow Dagger",
        slot: "weapon",
        rarity: "epic",
        statBonus: { AGI: 5, STR: 3 },
        levelReq: 12,
        source: "NPC",
      },
    },
    guildName: "Shadowstep",
    online: true,
  },
  {
    name: "Willowroot",
    level: 17,
    playerClass: "Druid",
    title: "Zen Master",
    stats: { STR: 5, AGI: 7, INT: 12, CON: 18, WIS: 28, CHA: 8, MP: 10 },
    equipment: {
      armor: {
        id: "npc-willow-armor",
        name: "Bark Robe",
        slot: "armor",
        rarity: "rare",
        statBonus: { WIS: 4, CON: 2 },
        levelReq: 10,
        source: "NPC",
      },
    },
    guildName: "Order of the Green",
    online: true,
  },
  {
    name: "Stonehelm",
    level: 14,
    playerClass: "Paladin",
    stats: { STR: 18, AGI: 5, INT: 6, CON: 20, WIS: 12, CHA: 4, MP: 3 },
    equipment: {},
    guildName: "Iron Wolves",
    online: true,
  },
  {
    name: "Nyx",
    level: 16,
    playerClass: "Scholar",
    title: "Century",
    stats: { STR: 2, AGI: 4, INT: 30, CON: 8, WIS: 22, CHA: 6, MP: 12 },
    equipment: {
      head: {
        id: "npc-nyx-head",
        name: "Runic Monocle",
        slot: "head",
        rarity: "uncommon",
        statBonus: { INT: 3 },
        levelReq: 8,
        source: "NPC",
      },
    },
    guildName: "Arcanum",
    online: true,
  },
  {
    name: "Ragna",
    level: 10,
    playerClass: "Ranger",
    stats: { STR: 10, AGI: 15, INT: 3, CON: 12, WIS: 5, CHA: 2, MP: 4 },
    equipment: {},
    guildName: "Iron Wolves",
    online: false,
  },
  {
    name: "Seraphina",
    level: 11,
    playerClass: "Paladin",
    stats: { STR: 14, AGI: 6, INT: 5, CON: 16, WIS: 10, CHA: 3, MP: 2 },
    equipment: {},
    online: true,
  },
  {
    name: "Echo",
    level: 8,
    playerClass: "Bard",
    stats: { STR: 3, AGI: 10, INT: 8, CON: 6, WIS: 12, CHA: 18, MP: 6 },
    equipment: {},
    guildName: "Shadowstep",
    online: false,
  },
  {
    name: "Solace",
    level: 12,
    playerClass: "Paladin",
    stats: { STR: 15, AGI: 5, INT: 4, CON: 18, WIS: 14, CHA: 6, MP: 3 },
    equipment: {},
    guildName: "Order of the Green",
    online: true,
  },
];
