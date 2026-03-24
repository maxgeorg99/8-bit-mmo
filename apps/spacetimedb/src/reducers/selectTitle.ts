import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";

export const select_title = spacetimedb.reducer(
  { titleId: t.option(t.string()) },
  (ctx, { titleId }) => {
    const p = ctx.db.player.identity.find(ctx.sender);
    if (!p) throw new SenderError("Player not found");

    // Verify the player has unlocked this title (if setting one)
    if (titleId) {
      let found = false;
      for (const pt of ctx.db.playerTitle.playerId.filter(ctx.sender)) {
        if (pt.titleId === titleId) {
          found = true;
          break;
        }
      }
      if (!found) throw new SenderError("Title not unlocked");
    }

    ctx.db.player.identity.update({
      ...p,
      activeTitle: titleId ?? undefined,
    });
  },
);
