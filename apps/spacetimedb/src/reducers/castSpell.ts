import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";

export const cast_spell = spacetimedb.reducer(
  { combatId: t.u64(), spellId: t.u64() },
  (ctx, { combatId, spellId }) => {
    const sender = ctx.sender;

    const c = ctx.db.combat.id.find(combatId);
    if (!c) throw new SenderError("Combat not found");
    if (c.status.tag !== "InProgress") throw new SenderError("Combat is not in progress");
    if (!c.currentTurn.isEqual(sender)) throw new SenderError("Not your turn");

    const sp = ctx.db.spell.id.find(spellId);
    if (!sp) throw new SenderError("Spell not found");

    const isPlayer1 = c.player1.isEqual(sender);

    // Check mana
    const casterMana = isPlayer1 ? c.player1Mana : c.player2Mana;
    if (casterMana < sp.manaCost) throw new SenderError("Not enough mana");

    // Apply damage and deduct mana
    const newCasterMana = casterMana - sp.manaCost;
    const opponentHp = isPlayer1 ? c.player2Hp : c.player1Hp;
    const newOpponentHp = opponentHp > sp.damage ? opponentHp - sp.damage : 0;

    // Log the action
    ctx.db.combatLog.insert({
      id: 0n,
      combatId: c.id,
      casterId: sender,
      spellName: sp.name,
      damage: sp.damage,
      timestamp: ctx.timestamp,
    });

    // Check if opponent is defeated
    if (newOpponentHp === 0) {
      ctx.db.combat.id.update({
        ...c,
        player1Hp: isPlayer1 ? c.player1Hp : newOpponentHp,
        player2Hp: isPlayer1 ? newOpponentHp : c.player2Hp,
        player1Mana: isPlayer1 ? newCasterMana : c.player1Mana,
        player2Mana: isPlayer1 ? c.player2Mana : newCasterMana,
        status: { tag: "Finished" },
        winnerId: sender,
      });

      // Update win/loss stats
      const winner = ctx.db.player.identity.find(sender);
      if (winner) {
        ctx.db.player.identity.update({ ...winner, wins: winner.wins + 1 });
      }
      const loserId = isPlayer1 ? c.player2 : c.player1;
      if (loserId) {
        const loser = ctx.db.player.identity.find(loserId);
        if (loser) {
          ctx.db.player.identity.update({ ...loser, losses: loser.losses + 1 });
        }
      }
      return;
    }

    // Swap turn
    const nextTurn = isPlayer1 ? c.player2! : c.player1;
    ctx.db.combat.id.update({
      ...c,
      player1Hp: isPlayer1 ? c.player1Hp : newOpponentHp,
      player2Hp: isPlayer1 ? newOpponentHp : c.player2Hp,
      player1Mana: isPlayer1 ? newCasterMana : c.player1Mana,
      player2Mana: isPlayer1 ? c.player2Mana : newCasterMana,
      currentTurn: nextTurn,
    });
  },
);
