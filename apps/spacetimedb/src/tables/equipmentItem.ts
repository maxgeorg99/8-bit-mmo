import { table, t } from "spacetimedb/server";
import { EquipSlot } from "../types/equipSlot";
import { ItemRarity } from "../types/itemRarity";

export const equipmentItem = table(
  { name: "equipment_item", public: true },
  {
    id: t.string().primaryKey(),
    playerId: t.identity().index("btree"),
    name: t.string(),
    slot: EquipSlot,
    rarity: ItemRarity,
    equipped: t.bool(),
    levelReq: t.u32(),
    source: t.string(),

    // Stat bonuses
    bonusStr: t.i32(),
    bonusAgi: t.i32(),
    bonusInt: t.i32(),
    bonusCon: t.i32(),
    bonusWis: t.i32(),
    bonusCha: t.i32(),
    bonusMp: t.i32(),
  },
);
