import { t } from "spacetimedb/server";

export const EquipSlot = t.enum("EquipSlot", {
  Weapon: t.unit(),
  Armor: t.unit(),
  Head: t.unit(),
  Accessory: t.unit(),
});
