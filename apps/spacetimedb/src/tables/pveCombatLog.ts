import { table, t } from "spacetimedb/server";

export const pveCombatLog = table(
  { name: "pve_combat_log", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    combatId: t.u64().index("btree"),
    casterName: t.string(),
    targetName: t.string(),
    spellName: t.string(),
    damage: t.u32(),
    isHeal: t.bool(),
    timestamp: t.timestamp(),
  },
);
