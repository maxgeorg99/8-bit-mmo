import { table, t } from "spacetimedb/server";

export const combatLog = table(
  { name: "combat_log", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    combatId: t.u64().index("btree"),
    casterId: t.identity(),
    spellName: t.string(),
    damage: t.u32(),
    timestamp: t.timestamp(),
  },
);
