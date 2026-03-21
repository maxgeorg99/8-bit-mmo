import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { combat } from "../tables/combat";

export const my_combat = spacetimedb.view(
  { name: "my_combat", public: true },
  t.option(combat.rowType),
  (ctx) => {
    for (const c of ctx.db.combat.iter()) {
      if (c.status.tag === "Finished") continue;
      if (c.player1.isEqual(ctx.sender) || (c.player2 && c.player2.isEqual(ctx.sender))) {
        return c;
      }
    }
    return undefined;
  },
);
