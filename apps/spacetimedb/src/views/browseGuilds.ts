import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { guild } from "../tables/guild";

export const browse_guilds = spacetimedb.view(
  { name: "browse_guilds", public: true },
  t.array(guild.rowType),
  (ctx) => {
    // Uses denormalized memberCount — no nested loop needed
    const guilds = [];
    for (const g of ctx.db.guild.iter()) {
      if (g.memberCount < g.maxMembers) {
        guilds.push(g);
      }
    }
    return guilds;
  },
);
