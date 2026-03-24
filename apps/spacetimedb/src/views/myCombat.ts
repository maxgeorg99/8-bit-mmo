import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { combat } from "../tables/combat";

export const my_combat = spacetimedb.view(
  { name: "my_combat", public: true },
  t.option(combat.rowType),
  (ctx) => {
    // Use player1 index first, then check player2
    for (const c of ctx.db.combat.player1.filter(ctx.sender)) {
      if (c.status.tag !== "Finished") return c;
    }
    // No index on player2 (optional), so scan remaining
    for (const c of ctx.db.combat.iter()) {
      if (c.status.tag === "Finished") continue;
      if (c.player2 && c.player2.isEqual(ctx.sender)) return c;
    }
    return undefined;
  },
);
