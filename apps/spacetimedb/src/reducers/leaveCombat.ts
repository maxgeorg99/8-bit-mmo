import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";

export const leave_combat = spacetimedb.reducer({ combatId: t.u64() }, (ctx, { combatId }) => {
  const sender = ctx.sender;

  const c = ctx.db.combat.id.find(combatId);
  if (!c) throw new SenderError("Combat not found");

  const isPlayer1 = c.player1.isEqual(sender);
  const isPlayer2 = c.player2 && c.player2.isEqual(sender);
  if (!isPlayer1 && !isPlayer2) throw new SenderError("Not in this combat");

  if (c.status.tag === "WaitingForPlayers") {
    // Just delete the waiting combat
    ctx.db.combat.id.delete(c.id);
    return;
  }

  if (c.status.tag === "InProgress") {
    // Forfeit — opponent wins
    const winnerId = isPlayer1 ? c.player2! : c.player1;
    ctx.db.combat.id.update({
      ...c,
      status: { tag: "Finished" },
      winnerId,
    });

    const winner = ctx.db.player.identity.find(winnerId);
    if (winner) {
      ctx.db.player.identity.update({ ...winner, pvpWins: winner.pvpWins + 1 });
    }
    const loser = ctx.db.player.identity.find(sender);
    if (loser) {
      ctx.db.player.identity.update({ ...loser, pvpLosses: loser.pvpLosses + 1 });
    }
  }
});
