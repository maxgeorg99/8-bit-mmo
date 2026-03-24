import { table, t } from "spacetimedb/server";

export const playerTitle = table(
  { name: "player_title", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    playerId: t.identity().index("btree"),
    titleId: t.string(),
    unlockedAt: t.timestamp(),
  },
);
