import { table, t } from "spacetimedb/server";

// idle_tick reducer is defined in index.ts to avoid circular deps.
// The lazy getter resolves the reference at runtime after all modules are loaded.
let _idle_tick: any = null;

export function setIdleTickReducer(reducer: any) {
  _idle_tick = reducer;
}

export const idleTickSchedule = table(
  {
    name: "idle_tick_schedule",
    scheduled: (): any => _idle_tick,
  },
  {
    scheduledId: t.u64().primaryKey().autoInc(),
    scheduledAt: t.scheduleAt(),
  },
);
