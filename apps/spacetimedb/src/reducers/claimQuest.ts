import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";

function xpToNextLevel(level: number): number {
  if (level <= 4) return 25 * level;
  return Math.round((level * level * 0.25 + 10 * level + 140) / 10) * 10;
}

function maxHp(level: number, con: number): number {
  return 50 + level * 2 + Math.floor(con / 2);
}

export const claim_quest = spacetimedb.reducer({ questId: t.u64() }, (ctx, { questId }) => {
  const p = ctx.db.player.identity.find(ctx.sender);
  if (!p) throw new SenderError("Player not found");

  const q = ctx.db.quest.id.find(questId);
  if (!q) throw new SenderError("Quest not found");
  if (!q.playerId.isEqual(ctx.sender)) throw new SenderError("Not your quest");
  if (!q.completed) throw new SenderError("Quest not completed");
  if (q.claimed) throw new SenderError("Quest already claimed");

  // Mark quest as claimed
  ctx.db.quest.id.update({ ...q, claimed: true });

  // Grant XP
  let level = p.level;
  let xp = p.xp + q.xpReward;
  let xpNext = xpToNextLevel(level);
  while (xp >= xpNext) {
    xp -= xpNext;
    level++;
    xpNext = xpToNextLevel(level);
  }

  const newMaxHp = maxHp(level, p.constitution);
  ctx.db.player.identity.update({
    ...p,
    level,
    xp,
    xpToNext: xpNext,
    hp: newMaxHp,
    maxHp: newMaxHp,
    questsCompleted: p.questsCompleted + 1,
  });
});
