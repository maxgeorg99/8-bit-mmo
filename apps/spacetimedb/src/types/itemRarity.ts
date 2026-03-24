import { t } from "spacetimedb/server";

export const ItemRarity = t.enum("ItemRarity", {
  Common: t.unit(),
  Uncommon: t.unit(),
  Rare: t.unit(),
  Epic: t.unit(),
  Legendary: t.unit(),
});
