import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { player } from "../tables/player";

export const biome_players = spacetimedb.view(
  { name: "biome_players", public: true },
  t.array(player.rowType),
  (ctx) => {
    const me = ctx.db.player.identity.find(ctx.sender);
    if (!me) return [];

    const players = [];
    for (const p of ctx.db.player.currentBiome.filter(me.currentBiome)) {
      if (p.online && !p.identity.isEqual(ctx.sender)) {
        players.push(p);
      }
    }
    return players;
  },
);
