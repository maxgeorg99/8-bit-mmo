import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { guild } from "../tables/guild";

export const my_guild = spacetimedb.view(
  { name: "my_guild", public: true },
  t.option(guild.rowType),
  (ctx) => {
    // Find the guild the caller belongs to
    for (const membership of ctx.db.guildMember.playerId.filter(ctx.sender)) {
      const g = ctx.db.guild.id.find(membership.guildId);
      if (g) return g;
    }
    return undefined;
  },
);
