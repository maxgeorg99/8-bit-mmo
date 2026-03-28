import { table, t } from "spacetimedb/server";

let _daily_quest_tick: any = null;

export function setDailyQuestTickReducer(reducer: any) {
  _daily_quest_tick = reducer;
}

export const dailyQuestSchedule = table(
  {
    name: "daily_quest_schedule",
    scheduled: (): any => _daily_quest_tick,
  },
  {
    scheduledId: t.u64().primaryKey().autoInc(),
    scheduledAt: t.scheduleAt(),
  },
);
