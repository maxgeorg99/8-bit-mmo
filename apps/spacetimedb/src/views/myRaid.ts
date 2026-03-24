import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { raid } from "../tables/raid";

export const my_raid = spacetimedb.view(
  { name: "my_raid", public: true },
  t.option(raid.rowType),
  (ctx) => {
    // Find the caller's guild, then find its active raid
    for (const membership of ctx.db.guildMember.playerId.filter(ctx.sender)) {
      for (const r of ctx.db.raid.guildId.filter(membership.guildId)) {
        if (r.phase.tag !== "Victory" && r.phase.tag !== "Defeat") {
          return r;
        }
      }
    }
    return undefined;
  },
);
