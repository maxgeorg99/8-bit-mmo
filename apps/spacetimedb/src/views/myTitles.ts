import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { playerTitle } from "../tables/playerTitle";

export const my_titles = spacetimedb.view(
  { name: "my_titles", public: true },
  t.array(playerTitle.rowType),
  (ctx) => {
    const titles = [];
    for (const title of ctx.db.playerTitle.playerId.filter(ctx.sender)) {
      titles.push(title);
    }
    return titles;
  },
);
