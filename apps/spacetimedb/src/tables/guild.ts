import { table, t } from "spacetimedb/server";

export const guild = table(
  { name: "guild", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    name: t.string().index("btree"),
    tag: t.string(),
    description: t.string(),
    createdAt: t.timestamp(),
    maxMembers: t.u32(),
    memberCount: t.u32(),
    raidWins: t.u32(),
  },
);
