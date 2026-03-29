import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { mob } from "../tables/mob";

export const biome_mobs = spacetimedb.view(
  { name: "biome_mobs", public: true },
  t.array(mob.rowType),
  (ctx) => {
    // Return mobs in the caller's current biome
    const p = ctx.db.player.identity.find(ctx.sender);
    if (!p) return [];
    const mobs = [];
    for (const m of ctx.db.mob.biomeId.filter(p.currentBiome)) {
      mobs.push(m);
    }
    return mobs;
  },
);
