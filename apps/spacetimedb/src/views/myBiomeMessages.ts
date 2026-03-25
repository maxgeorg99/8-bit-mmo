import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { message } from "../tables/message";

export const my_biome_messages = spacetimedb.view(
  { name: "my_biome_messages", public: true },
  t.array(message.rowType),
  (ctx) => {
    // Find which biome the caller is in, then return last 50 messages
    const player = ctx.db.player.identity.find(ctx.sender);
    if (player && player.currentBiome) {
      const messages = [];
      for (const msg of ctx.db.message.biomeId.filter(player.currentBiome)) {
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
