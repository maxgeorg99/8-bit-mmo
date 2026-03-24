import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { quest } from "../tables/quest";

export const my_quests = spacetimedb.view(
  { name: "my_quests", public: true },
  t.array(quest.rowType),
  (ctx) => {
    const quests = [];
    for (const q of ctx.db.quest.playerId.filter(ctx.sender)) {
      if (!q.claimed) {
        quests.push(q);
      }
    }
    return quests;
  },
);
