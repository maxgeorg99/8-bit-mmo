import { table, t } from "spacetimedb/server";

export const message = table(
  { name: "message", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    guildId: t.u64().index("btree"), // 0 = no guild message
    biomeId: t.string().index("btree"), // 0 = no biome wide message
    whisperTo: t.identity().index("btree"), // 0 = no whisper message
    authorId: t.identity().index("btree"),
    authorName: t.option(t.string()),
    recipientName: t.option(t.string()),
    text: t.string(),
    timestamp: t.timestamp(),
  },
);
