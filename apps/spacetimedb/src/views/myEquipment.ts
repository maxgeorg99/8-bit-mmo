import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { equipmentItem } from "../tables/equipmentItem";

export const my_equipment = spacetimedb.view(
  { name: "my_equipment", public: true },
  t.array(equipmentItem.rowType),
  (ctx) => {
    const items = [];
    for (const item of ctx.db.equipmentItem.playerId.filter(ctx.sender)) {
      items.push(item);
    }
    return items;
  },
);
