import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";

/**
 * pve_cast_spell — player casts a spell during PvE combat.
 * After the player's turn, the mob automatically retaliates (AI turn).
 * If combat ends, marks it finished and awards XP/gold via the player table.
 */

function calculateDamage(base: number): number {
  const variance = 0.8 + Math.random() * 0.4; // 80% - 120%
  return Math.max(1, Math.round(base * variance));
}

function mobCalculateDamage(min: number, max: number): number {
  return Math.max(1, Math.round(min + Math.random() * (max - min)));
}

function xpToNextLevel(level: number): number {
  if (level <= 4) return 25 * level;
  return Math.round((level * level * 0.25 + 10 * level + 140) / 10) * 10;
}

function maxHp(level: number, con: number): number {
  return 50 + level * 2 + Math.floor(con / 2);
}

export const pve_cast_spell = spacetimedb.reducer(
  { combatId: t.u64(), spellId: t.u64() },
  (ctx, { combatId, spellId }) => {
    const p = ctx.db.player.identity.find(ctx.sender);
    if (!p) throw new SenderError("Player not found");

    const c = ctx.db.pveCombat.id.find(combatId);
    if (!c) throw new SenderError("PvE combat not found");
    if (!c.playerId.isEqual(ctx.sender)) throw new SenderError("Not your combat");
    if (c.finished) throw new SenderError("Combat is already finished");
    if (!c.isPlayerTurn) throw new SenderError("Not your turn");

    const sp = ctx.db.spell.id.find(spellId);
    if (!sp) throw new SenderError("Spell not found");

    // Check mana
    if (c.playerMana < sp.manaCost) throw new SenderError("Not enough mana");

    let playerHp = c.playerHp;
    let playerMana = c.playerMana - sp.manaCost;
    let mobHp = c.mobHp;

    // ── Player's turn ────────────────────────────────────────────
    if (sp.isHeal) {
      const heal = calculateDamage(sp.damage);
      playerHp = Math.min(c.playerMaxHp, playerHp + heal);
      ctx.db.pveCombatLog.insert({
        id: 0n,
        combatId: c.id,
        casterName: p.name || "Player",
        targetName: p.name || "Player",
        spellName: sp.name,
        damage: heal,
        isHeal: true,
        timestamp: ctx.timestamp,
      });
    } else {
      const dmg = calculateDamage(sp.damage);
      mobHp = Math.max(0, mobHp - dmg);
      ctx.db.pveCombatLog.insert({
        id: 0n,
        combatId: c.id,
        casterName: p.name || "Player",
        targetName: c.mobName,
        spellName: sp.name,
        damage: dmg,
        isHeal: false,
        timestamp: ctx.timestamp,
      });
    }

    // ── Check if mob is defeated ────────────────────────────────
    if (mobHp <= 0) {
      ctx.db.pveCombat.id.update({
        ...c,
        playerHp,
        playerMana,
        mobHp: 0,
        finished: true,
        playerWon: true,
        isPlayerTurn: false,
      });

      // Award XP and gold
      const mobDef = ctx.db.mob.id.find(c.mobId);
      const xpGain = mobDef?.xpReward ?? 20;
      const goldReward = 5 + Math.floor(p.level * 1.5);

      let level = p.level;
      let xp = p.xp + xpGain;
      let xpNext = xpToNextLevel(level);
      while (xp >= xpNext) {
        xp -= xpNext;
        level++;
        xpNext = xpToNextLevel(level);
      }

      const newMaxHp = maxHp(level, p.constitution);
      const leveledUp = level > p.level;

      ctx.db.player.identity.update({
        ...p,
        level,
        xp,
        xpToNext: xpNext,
        hp: leveledUp ? newMaxHp : Math.min(playerHp, newMaxHp),
        maxHp: newMaxHp,
        gold: p.gold + goldReward,
      });
      return;
    }

    // ── Mob's turn (AI) ─────────────────────────────────────────
    // Simple AI: mob always attacks with basic damage
    const mobDmg = mobCalculateDamage(c.mobDamageMin, c.mobDamageMax);
    playerHp = Math.max(0, playerHp - mobDmg);

    ctx.db.pveCombatLog.insert({
      id: 0n,
      combatId: c.id,
      casterName: c.mobName,
      targetName: p.name || "Player",
      spellName: "Attack",
      damage: mobDmg,
      isHeal: false,
      timestamp: ctx.timestamp,
    });

    // ── Check if player is defeated ─────────────────────────────
    if (playerHp <= 0) {
      ctx.db.pveCombat.id.update({
        ...c,
        playerHp: 0,
        playerMana,
        mobHp,
        finished: true,
        playerWon: false,
        isPlayerTurn: false,
      });

      // Player loses some HP but doesn't die -- set to 1 HP
      ctx.db.player.identity.update({
        ...p,
        hp: 1,
      });
      return;
    }

    // ── Combat continues ────────────────────────────────────────
    // Small mana regen each round
    playerMana = Math.min(c.playerMaxMana, playerMana + 2);

    ctx.db.pveCombat.id.update({
      ...c,
      playerHp,
      playerMana,
      mobHp,
      isPlayerTurn: true,
    });
  },
);
