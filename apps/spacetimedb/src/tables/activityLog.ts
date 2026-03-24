import { table, t } from "spacetimedb/server";
import { ActivityType } from "../types/activityType";

export const activityLog = table(
  { name: "activity_log", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    playerId: t.identity().index("btree"),
    activityType: ActivityType,
    rawValue: t.f32(),
    durationMin: t.f32(),
    intensity: t.u8(),
    timestamp: t.timestamp(),
    note: t.option(t.string()),

    // Stat deltas recorded at time of logging
    deltaStr: t.f32(),
    deltaAgi: t.f32(),
    deltaInt: t.f32(),
    deltaCon: t.f32(),
    deltaWis: t.f32(),
    deltaCha: t.f32(),
    deltaMp: t.f32(),
  },
);
