import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";

export const travel_to_biome = spacetimedb.reducer({ biomeId: t.string() }, (ctx, { biomeId }) => {
  const p = ctx.db.player.identity.find(ctx.sender);
  if (!p) throw new SenderError("Player not found");

  // Check if biome is unlocked
  const unlocked = p.unlockedBiomes.split(",");
  if (!unlocked.includes(biomeId) && biomeId !== "plains") {
    throw new SenderError("Biome not unlocked");
  }

  ctx.db.player.identity.update({
    ...p,
    currentBiome: biomeId,
    currentLocation: undefined,
  });
});

export const enter_location = spacetimedb.reducer(
  { locationId: t.option(t.string()) },
  (ctx, { locationId }) => {
    const p = ctx.db.player.identity.find(ctx.sender);
    if (!p) throw new SenderError("Player not found");

    ctx.db.player.identity.update({
      ...p,
      currentLocation: locationId ?? undefined,
    });
  },
);
