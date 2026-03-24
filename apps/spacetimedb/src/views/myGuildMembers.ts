import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { guildMember } from "../tables/guildMember";

export const my_guild_members = spacetimedb.view(
  { name: "my_guild_members", public: true },
  t.array(guildMember.rowType),
  (ctx) => {
    // Find which guild the caller is in, then return all members
    for (const membership of ctx.db.guildMember.playerId.filter(ctx.sender)) {
      const members = [];
      for (const m of ctx.db.guildMember.guildId.filter(membership.guildId)) {
        members.push(m);
      }
      return members;
    }
    return [];
  },
);
