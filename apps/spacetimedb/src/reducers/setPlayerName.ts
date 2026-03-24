import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";

export const set_player_name = spacetimedb.reducer({ name: t.string() }, (ctx, { name }) => {
  const p = ctx.db.player.identity.find(ctx.sender);
  if (!p) throw new SenderError("Player not found");
  if (name.length < 1 || name.length > 20) throw new SenderError("Name must be 1-20 characters");

  ctx.db.player.identity.update({ ...p, name });
});
