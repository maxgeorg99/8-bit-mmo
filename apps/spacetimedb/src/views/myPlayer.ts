import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { player } from "../tables/player";

export const my_player = spacetimedb.view(
  { name: "my_player", public: true },
  t.option(player.rowType),
  (ctx) => {
    return ctx.db.player.identity.find(ctx.sender) ?? undefined;
  },
);
