import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { combatLog } from "../tables/combatLog";

export const my_combat_log = spacetimedb.view(
  { name: "my_combat_log", public: true },
  t.array(combatLog.rowType),
  (ctx) => {
    // Use player1 index first, then check player2
    for (const c of ctx.db.combat.player1.filter(ctx.sender)) {
      if (c.status.tag !== "Finished") {
        const logs = [];
        for (const entry of ctx.db.combatLog.combatId.filter(c.id)) {
          logs.push(entry);
        }
        return logs;
      }
    }
    for (const c of ctx.db.combat.iter()) {
      if (c.status.tag === "Finished") continue;
      if (c.player2 && c.player2.isEqual(ctx.sender)) {
        const logs = [];
        for (const entry of ctx.db.combatLog.combatId.filter(c.id)) {
          logs.push(entry);
        }
        return logs;
      }
    }
    return [];
  },
);
