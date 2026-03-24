import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";
import { EquipSlot } from "../types/equipSlot";
import { ItemRarity } from "../types/itemRarity";

function xpToNextLevel(level: number): number {
  if (level <= 4) return 25 * level;
  return Math.round((level * level * 0.25 + 10 * level + 140) / 10) * 10;
}

function maxHp(level: number, con: number): number {
  return 50 + level * 2 + Math.floor(con / 2);
}

// Server-enforced caps to prevent client abuse
const MAX_XP_PER_COMBAT = 200;
const MAX_LOOT_RARITY_BY_LEVEL: Record<string, number> = {
  Common: 1,
  Uncommon: 5,
  Rare: 10,
  Epic: 20,
  Legendary: 35,
};

export const grant_pve_rewards = spacetimedb.reducer(
  {
    xpGain: t.u32(),
    lootItemId: t.option(t.string()),
    lootName: t.option(t.string()),
    lootSlot: t.option(EquipSlot),
    lootRarity: t.option(ItemRarity),
    lootLevelReq: t.option(t.u32()),
    lootBonusStr: t.option(t.i32()),
    lootBonusAgi: t.option(t.i32()),
    lootBonusInt: t.option(t.i32()),
    lootBonusCon: t.option(t.i32()),
    lootBonusWis: t.option(t.i32()),
    lootBonusCha: t.option(t.i32()),
    lootBonusMp: t.option(t.i32()),
  },
  (ctx, args) => {
    const p = ctx.db.player.identity.find(ctx.sender);
    if (!p) throw new SenderError("Player not found");

    // Server-side cap: never trust client XP value
    const clampedXp = Math.min(args.xpGain, MAX_XP_PER_COMBAT);

    // Validate loot rarity vs player level
    if (args.lootRarity) {
      const minLevel = MAX_LOOT_RARITY_BY_LEVEL[args.lootRarity.tag] ?? 1;
      if (p.level < minLevel) {
        throw new SenderError("Loot rarity too high for player level");
      }
    }

    // Validate stat bonuses are within reasonable range
    const bonuses = [
      args.lootBonusStr ?? 0,
      args.lootBonusAgi ?? 0,
      args.lootBonusInt ?? 0,
      args.lootBonusCon ?? 0,
      args.lootBonusWis ?? 0,
      args.lootBonusCha ?? 0,
      args.lootBonusMp ?? 0,
    ];
    for (const b of bonuses) {
      if (b < -50 || b > 50) throw new SenderError("Invalid stat bonus");
    }

    // Level up
    let level = p.level;
    let xp = p.xp + clampedXp;
    let xpNext = xpToNextLevel(level);
    while (xp >= xpNext) {
      xp -= xpNext;
      level++;
      xpNext = xpToNextLevel(level);
    }

    // Gold reward computed server-side (not trusted from client)
    const goldReward = 5 + Math.floor(level * 1.5);

    const newMaxHp = maxHp(level, p.con);
    ctx.db.player.identity.update({
      ...p,
      level,
      xp,
      xpToNext: xpNext,
      hp: newMaxHp,
      maxHp: newMaxHp,
      gold: p.gold + goldReward,
    });

    // Insert loot if provided
    if (args.lootItemId && args.lootName && args.lootSlot && args.lootRarity) {
      ctx.db.equipmentItem.insert({
        id: args.lootItemId,
        playerId: ctx.sender,
        name: args.lootName,
        slot: args.lootSlot,
        rarity: args.lootRarity,
        equipped: false,
        levelReq: args.lootLevelReq ?? 0,
        source: "pve_drop",
        bonusStr: args.lootBonusStr ?? 0,
        bonusAgi: args.lootBonusAgi ?? 0,
        bonusInt: args.lootBonusInt ?? 0,
        bonusCon: args.lootBonusCon ?? 0,
        bonusWis: args.lootBonusWis ?? 0,
        bonusCha: args.lootBonusCha ?? 0,
        bonusMp: args.lootBonusMp ?? 0,
      });
    }
  },
);
