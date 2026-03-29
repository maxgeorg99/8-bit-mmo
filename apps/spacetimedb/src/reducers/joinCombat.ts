import { SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";

/**
 * join_combat — join an existing PvP combat or create a new waiting lobby.
 * Enforces:
 * - Player cannot be in an active combat already
 * - PvP cooldown: same opponent cannot be challenged more than once per 24 hours
 */
export const join_combat = spacetimedb.reducer({}, (ctx) => {
  const sender = ctx.sender;
  const now = ctx.timestamp.toDate();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Check player is not already in an active combat
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
      // PvP cooldown check: same opponent once per 24h
      const opponent = c.player1;
      let recentlyFought = false;

      for (const prev of ctx.db.combat.player1.filter(sender)) {
        if (
          prev.status.tag === "Finished" &&
          prev.player2 &&
          prev.player2.isEqual(opponent) &&
          prev.finishedAt
        ) {
          const finishedMs = prev.finishedAt.toDate().getTime();
          if (now.getTime() - finishedMs < oneDayMs) {
            recentlyFought = true;
            break;
          }
        }
      }

      if (!recentlyFought) {
        for (const prev of ctx.db.combat.player1.filter(opponent)) {
          if (
            prev.status.tag === "Finished" &&
            prev.player2 &&
            prev.player2.isEqual(sender) &&
            prev.finishedAt
          ) {
            const finishedMs = prev.finishedAt.toDate().getTime();
            if (now.getTime() - finishedMs < oneDayMs) {
              recentlyFought = true;
              break;
            }
          }
        }
      }

      if (recentlyFought) {
        // Skip this waiting combat, keep looking for another opponent
        continue;
      }

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
    startedAt: ctx.timestamp,
    finishedAt: undefined,
  });
});
