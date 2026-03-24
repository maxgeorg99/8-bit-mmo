import { table, t } from "spacetimedb/server";
import { GuildRole } from "../types/guildRole";

export const guildMember = table(
  { name: "guild_member", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    guildId: t.u64().index("btree"),
    playerId: t.identity().index("btree"),
    role: GuildRole,
    joinedAt: t.timestamp(),
  },
);
