import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";

export const create_custom_quest = spacetimedb.reducer(
  { title: t.string(), description: t.string(), xpReward: t.u32() },
  (ctx, { title, description, xpReward }) => {
    const p = ctx.db.player.identity.find(ctx.sender);
    if (!p) throw new SenderError("Player not found");
    if (title.length < 1 || title.length > 50) throw new SenderError("Title must be 1-50 chars");
    if (xpReward > 100) throw new SenderError("XP reward too high");

    ctx.db.quest.insert({
      id: 0n,
      playerId: ctx.sender,
      title,
      description,
      questType: { tag: "Custom" },
      activityType: undefined,
      targetMin: 0,
      progressMin: 0,
      xpReward,
      completed: false,
      claimed: false,
      expiresAt: 0n,
      manualComplete: false,
    });
  },
);

export const complete_custom_quest = spacetimedb.reducer(
  { questId: t.u64() },
  (ctx, { questId }) => {
    const q = ctx.db.quest.id.find(questId);
    if (!q) throw new SenderError("Quest not found");
    if (!q.playerId.isEqual(ctx.sender)) throw new SenderError("Not your quest");
    if (q.questType.tag !== "Custom") throw new SenderError("Not a custom quest");
    if (q.completed) throw new SenderError("Already completed");

    ctx.db.quest.id.update({ ...q, completed: true, manualComplete: true });
  },
);
