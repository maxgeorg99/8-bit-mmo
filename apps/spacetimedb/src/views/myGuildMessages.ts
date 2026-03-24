import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { guildMessage } from "../tables/guildMessage";

export const my_guild_messages = spacetimedb.view(
  { name: "my_guild_messages", public: true },
  t.array(guildMessage.rowType),
  (ctx) => {
    // Find which guild the caller is in, then return last 50 messages
    for (const membership of ctx.db.guildMember.playerId.filter(ctx.sender)) {
      const messages = [];
      for (const msg of ctx.db.guildMessage.guildId.filter(membership.guildId)) {
        messages.push(msg);
      }
      // Sort by timestamp desc, take last 50
      messages.sort((a, b) =>
        Number(a.timestamp.microsSinceUnixEpoch - b.timestamp.microsSinceUnixEpoch),
      );
      return messages.slice(-50);
    }
    return [];
  },
);
