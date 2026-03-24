import { t } from "spacetimedb/server";

export const GuildRole = t.enum("GuildRole", {
  Leader: t.unit(),
  Officer: t.unit(),
  Member: t.unit(),
});
