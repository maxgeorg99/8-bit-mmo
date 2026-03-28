import { useTable, useReducer } from "spacetimedb/react";
import { tables, reducers } from "@/generated";
import type { Player as StdbPlayer, EquipmentItem as StdbEquipmentItem } from "@/generated/types";
import type { Player, EquipmentItem, EquipSlot, Stats, PlayerClass, ItemRarity } from "@/lib/types";
import { TITLE_MAP } from "@/lib/titles";

/**
 * Map a SpacetimeDB Player row to the client-side Player shape.
 * The Zustand gameStore uses this same shape — so components don't need to change.
 */
export function stdbPlayerToLocal(p: StdbPlayer, equipment: readonly StdbEquipmentItem[]): Player {
  const equipped: Partial<Record<EquipSlot, EquipmentItem>> = {};
  const chest: EquipmentItem[] = [];

  for (const item of equipment) {
    const localItem = stdbItemToLocal(item);
    if (item.equipped) {
      equipped[localItem.slot] = localItem;
    }
    chest.push(localItem);
  }

  return {
    name: p.name,
    level: p.level,
    xp: p.xp,
    xpToNext: p.xpToNext,
    hp: p.hp,
    maxHp: p.maxHp,
    stats: {
      STR: Math.round(p.strength),
      AGI: Math.round(p.agility),
      INT: Math.round(p.intelligence),
      CON: Math.round(p.constitution),
      WIS: Math.round(p.wisdom),
      CHA: Math.round(p.charisma),
      MP: Math.round(p.mana),
    },
    playerClass: (p.characterClass.tag as PlayerClass) ?? "Unclassed",
    streakDays: p.streakDays,
    totalActivities: p.totalActivities,
    joinedAt: Number(p.joinedAt.toMillis()),
    equipment: equipped,
    chest,
    currentBiome: p.currentBiome,
    unlockedBiomes: Array.isArray(p.unlockedBiomes) ? p.unlockedBiomes : [],
    currentLocation: p.currentLocation ?? null,
    activeTitle: p.activeTitle ?? null,
    unlockedTitles: [], // loaded separately from player_title table
    gold: p.gold,
  };
}

export function stdbItemToLocal(item: StdbEquipmentItem): EquipmentItem {
  return {
    id: item.id,
    name: item.name,
    slot: item.slot.tag.toLowerCase() as EquipSlot,
    rarity: item.rarity.tag.toLowerCase() as ItemRarity,
    statBonus: {
      ...(item.bonusStr ? { STR: item.bonusStr } : {}),
      ...(item.bonusAgi ? { AGI: item.bonusAgi } : {}),
      ...(item.bonusInt ? { INT: item.bonusInt } : {}),
      ...(item.bonusCon ? { CON: item.bonusCon } : {}),
      ...(item.bonusWis ? { WIS: item.bonusWis } : {}),
      ...(item.bonusCha ? { CHA: item.bonusCha } : {}),
      ...(item.bonusMp ? { MP: item.bonusMp } : {}),
    },
    levelReq: item.levelReq,
    source: item.source,
  };
}

/**
 * Convert a SpacetimeDB biome_players row to the NpcPlayer-compatible shape
 * used by PlayerInspect.
 */
export function stdbPlayerToInspectable(
  p: StdbPlayer,
  equipmentItems: readonly StdbEquipmentItem[] = [],
): {
  name: string;
  level: number;
  playerClass: PlayerClass;
  title?: string;
  stats: Stats;
  equipment: Partial<Record<EquipSlot, EquipmentItem>>;
  guildName?: string;
  online: boolean;
} {
  // Resolve title ID to formatted display string (e.g. "first_step" → "👣 First Step")
  const titleDef = p.activeTitle ? TITLE_MAP.get(p.activeTitle) : undefined;
  const titleDisplay = titleDef ? `${titleDef.icon} ${titleDef.name}` : undefined;

  // Build equipped items map from equipment data
  const equipped: Partial<Record<EquipSlot, EquipmentItem>> = {};
  for (const item of equipmentItems) {
    if (item.equipped) {
      const localItem = stdbItemToLocal(item);
      equipped[localItem.slot] = localItem;
    }
  }

  return {
    name: p.name,
    level: p.level,
    playerClass: (p.characterClass.tag as PlayerClass) ?? "Unclassed",
    title: titleDisplay,
    stats: {
      STR: Math.round(p.strength),
      AGI: Math.round(p.agility),
      INT: Math.round(p.intelligence),
      CON: Math.round(p.constitution),
      WIS: Math.round(p.wisdom),
      CHA: Math.round(p.charisma),
      MP: Math.round(p.mana),
    },
    equipment: equipped,
    online: p.online,
  };
}

/**
 * Hook: own player data + equipment from SpacetimeDB views.
 * Falls back to null if not connected yet.
 */
export function useMyPlayer() {
  const [myPlayerRows, playerReady] = useTable(tables.my_player);
  const [equipmentRows, equipReady] = useTable(tables.my_equipment);

  const stdbPlayer = myPlayerRows[0] ?? null;
  const ready = playerReady && equipReady;

  const player = stdbPlayer ? stdbPlayerToLocal(stdbPlayer, equipmentRows) : null;

  return { player, stdbPlayer, equipment: equipmentRows, ready };
}

/**
 * Hook: other players in the same biome (for city scenes).
 */
export function useBiomePlayers() {
  const [biomePlayers] = useTable(tables.biome_players);
  const [allEquipment] = useTable(tables.equipmentItem);

  return biomePlayers.map((p) => {
    const playerEquip = allEquipment.filter((e) => e.playerId.isEqual(p.identity));
    return stdbPlayerToInspectable(p, playerEquip);
  });
}

/**
 * Hook: equipment reducer actions.
 */
export function useEquipmentActions() {
  const equipItem = useReducer(reducers.equipItem);
  const unequipItem = useReducer(reducers.unequipItem);
  const restAtCity = useReducer(reducers.restAtCity);

  return {
    equipItem: (itemId: string) => equipItem({ itemId }),
    unequipItem: (itemId: string) => unequipItem({ itemId }),
    restAtCity: () => restAtCity(),
  };
}
