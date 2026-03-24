import { table, t } from "spacetimedb/server";

export const guildMessage = table(
  { name: "guild_message", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    guildId: t.u64().index("btree"),
    authorId: t.identity(),
    authorName: t.string(),
    text: t.string(),
    timestamp: t.timestamp(),
  },
);
