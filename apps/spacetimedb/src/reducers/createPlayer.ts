import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";
import { generateDailyQuestRows } from "../logic/questGenerator";

/**
 * Explicit create_player reducer.
 * Can be called by the client to set the player name on first login.
 * If the player already exists, this is a no-op (returns silently).
 */
export const create_player = spacetimedb.reducer({ name: t.string() }, (ctx, { name }) => {
  // Validate name
  if (name.length < 1 || name.length > 20) {
    throw new SenderError("Name must be 1-20 characters");
  }

  // Check if player already exists (created by onConnect)
  const existing = ctx.db.player.identity.find(ctx.sender);
  if (existing) {
    // If name is empty (auto-created via onConnect), set it now
    if (existing.name === "") {
      ctx.db.player.identity.update({ ...existing, name });
    }
    return;
  }

  // Create new player
  ctx.db.player.insert({
    identity: ctx.sender,
    name,
    online: true,
    characterClass: { tag: "Unclassed" },
    level: 1,
    xp: 0,
    xpToNext: 25,
    hp: 50,
    maxHp: 50,
    gold: 50,
    streakDays: 0,
    totalActivities: 0,
    questsCompleted: 0,
    lastActivityAt: ctx.timestamp,
    strength: 0,
    agility: 0,
    intelligence: 0,
    constitution: 0,
    wisdom: 0,
    charisma: 0,
    mana: 0,
    currentBiome: "plains",
    currentLocation: undefined,
    activeTitle: undefined,
    pvpWins: 0,
    pvpLosses: 0,
    unlockedBiomes: ["plains"],
    joinedAt: ctx.timestamp,
  });

  // Generate initial daily quests
  const quests = generateDailyQuestRows(ctx.sender, ctx.timestamp);
  for (const q of quests) {
    ctx.db.quest.insert(q as any);
  }
});
