import { SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";

export const join_combat = spacetimedb.reducer({}, (ctx) => {
  const sender = ctx.sender;

  // Check player is not already in an active combat (use player1 index + scan for player2)
  for (const c of ctx.db.combat.player1.filter(sender)) {
    if (c.status.tag !== "Finished") {
      throw new SenderError("Already in an active combat");
    }
  }
  for (const c of ctx.db.combat.iter()) {
    if (c.status.tag === "Finished") continue;
    if (c.player2 && c.player2.isEqual(sender)) {
      throw new SenderError("Already in an active combat");
    }
  }

  // Look for a combat waiting for a second player
  for (const c of ctx.db.combat.iter()) {
    if (c.status.tag === "WaitingForPlayers" && !c.player1.isEqual(sender)) {
      ctx.db.combat.id.update({
        ...c,
        player2: sender,
        status: { tag: "InProgress" },
      });
      return;
    }
  }

  // No waiting combat — create a new one
  ctx.db.combat.insert({
    id: 0n,
    player1: sender,
    player2: undefined,
    player1Hp: 100,
    player2Hp: 100,
    player1Mana: 100,
    player2Mana: 100,
    currentTurn: sender,
    status: { tag: "WaitingForPlayers" },
    winnerId: undefined,
  });
});
