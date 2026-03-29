import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { pveCombat } from "../tables/pveCombat";

export const my_pve_combat = spacetimedb.view(
  { name: "my_pve_combat", public: true },
  t.option(pveCombat.rowType),
  (ctx) => {
    // Return the active (unfinished) PvE combat for this player
    for (const c of ctx.db.pveCombat.playerId.filter(ctx.sender)) {
      if (!c.finished) return c;
    }
    return undefined;
  },
);
