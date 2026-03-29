import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { pveCombatLog } from "../tables/pveCombatLog";

export const my_pve_combat_log = spacetimedb.view(
  { name: "my_pve_combat_log", public: true },
  t.array(pveCombatLog.rowType),
  (ctx) => {
    // Find the player's active PvE combat and return its logs
    for (const c of ctx.db.pveCombat.playerId.filter(ctx.sender)) {
      if (!c.finished) {
        const logs = [];
        for (const log of ctx.db.pveCombatLog.combatId.filter(c.id)) {
          logs.push(log);
        }
        return logs;
      }
    }
    return [];
  },
);
