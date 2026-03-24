import { table, t } from "spacetimedb/server";

export const raidLog = table(
  { name: "raid_log", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    raidId: t.u64().index("btree"),
    caster: t.string(),
    target: t.string(),
    spellName: t.string(),
    element: t.string(),
    damage: t.u32(),
    isHeal: t.bool(),
  },
);
