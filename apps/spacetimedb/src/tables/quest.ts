import { table, t } from "spacetimedb/server";
import { QuestType } from "../types/questType";
import { ActivityType } from "../types/activityType";

export const quest = table(
  { name: "quest", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    playerId: t.identity().index("btree"),
    title: t.string(),
    description: t.string(),
    questType: QuestType,
    activityType: t.option(ActivityType),
    targetMin: t.u32(),
    progressMin: t.u32(),
    xpReward: t.u32(),
    completed: t.bool(),
    claimed: t.bool(),
    expiresAt: t.option(t.timestamp()),
    manualComplete: t.bool(),
  },
);
