import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { player } from "../tables/player";

export const leaderboard = spacetimedb.view(
  { name: "leaderboard", public: true },
  t.array(player.rowType),
  (ctx) => {
    const players = [];
    for (const p of ctx.db.player.iter()) {
      if (p.name) {
        players.push(p);
      }
    }
    // Sort by level desc, then by xp desc
    players.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.xp - a.xp;
    });
    return players.slice(0, 50);
  },
);
