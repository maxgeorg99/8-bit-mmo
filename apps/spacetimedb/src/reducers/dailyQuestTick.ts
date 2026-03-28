import spacetimedb from "../schema";
import { dailyQuestSchedule, setDailyQuestTickReducer } from "../tables/dailyQuestSchedule";
import { generateDailyQuestRows } from "../logic/questGenerator";

/**
 * Daily quest tick — runs every 24 hours via schedule table.
 * Generates 3 fresh daily quests for every player who has no active (unclaimed) dailies.
 */
export const daily_quest_tick = spacetimedb.reducer(
  { arg: dailyQuestSchedule.rowType },
  (ctx, { arg: _arg }) => {
    for (const p of ctx.db.player.iter()) {
      // Check if player already has active daily quests
      let hasActiveDailies = false;
      for (const q of ctx.db.quest.playerId.filter(p.identity)) {
        if (q.questType.tag === "Daily" && !q.claimed) {
          hasActiveDailies = true;
          break;
        }
      }

      if (!hasActiveDailies) {
        const quests = generateDailyQuestRows(p.identity, ctx.timestamp);
        for (const q of quests) {
          ctx.db.quest.insert(q as any);
        }
      }
    }
  },
);

// Wire up the lazy reference so the schedule table can find the reducer
setDailyQuestTickReducer(daily_quest_tick);
