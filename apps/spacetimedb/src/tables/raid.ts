import { table, t } from "spacetimedb/server";
import { RaidPhase } from "../types/raidPhase";

export const raid = table(
  { name: "raid", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    guildId: t.u64().index("btree"),
    biomeId: t.string(),
    bossId: t.string(),
    phase: RaidPhase,
    bossHp: t.u32(),
    bossMaxHp: t.u32(),
    bossMana: t.u32(),
    currentTurnIndex: t.u32(),
    startedAt: t.timestamp(),
  },
);
