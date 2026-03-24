import { table, t } from "spacetimedb/server";

export const raidCombatant = table(
  { name: "raid_combatant", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    raidId: t.u64().index("btree"),
    playerId: t.identity(),
    playerName: t.string(),
    playerClass: t.string(),
    hp: t.u32(),
    maxHp: t.u32(),
    mana: t.u32(),
    maxMana: t.u32(),
    ko: t.bool(),
  },
);
