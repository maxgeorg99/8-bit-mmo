import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";

/**
 * start_pve_combat — initiates server-side PvE combat against a mob.
 * Validates that the mob exists in the given biome, the player is in that biome,
 * and the player is not already in an active PvE combat.
 */
export const start_pve_combat = spacetimedb.reducer({ mobId: t.string() }, (ctx, { mobId }) => {
  const p = ctx.db.player.identity.find(ctx.sender);
  if (!p) throw new SenderError("Player not found");

  // Check player is not already in an active PvE combat
  for (const c of ctx.db.pveCombat.playerId.filter(ctx.sender)) {
    if (!c.finished) {
      throw new SenderError("Already in an active PvE combat");
    }
  }

  // Find the mob definition
  const mobDef = ctx.db.mob.id.find(mobId);
  if (!mobDef) throw new SenderError("Mob not found");

  // Validate player is in the correct biome
  if (p.currentBiome !== mobDef.biomeId) {
    throw new SenderError("You are not in the correct biome for this mob");
  }

  // Player combat stats derived from level and stats
  const playerMaxHp = p.maxHp;
  const playerMaxMana = Math.max(20, 20 + p.level * 3 + Math.floor(p.intelligence / 2));

  ctx.db.pveCombat.insert({
    id: 0n,
    playerId: ctx.sender,
    mobId: mobDef.id,
    mobName: mobDef.name,
    biomeId: mobDef.biomeId,

    playerHp: Math.min(p.hp, playerMaxHp),
    playerMaxHp,
    playerMana: playerMaxMana,
    playerMaxMana,

    mobHp: mobDef.hp,
    mobMaxHp: mobDef.hp,
    mobMana: mobDef.mana,
    mobDamageMin: mobDef.damageMin,
    mobDamageMax: mobDef.damageMax,

    isPlayerTurn: true,
    finished: false,
    playerWon: false,

    startedAt: ctx.timestamp,
  });
});
