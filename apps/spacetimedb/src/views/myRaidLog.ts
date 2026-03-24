import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { raidLog } from "../tables/raidLog";

export const my_raid_log = spacetimedb.view(
  { name: "my_raid_log", public: true },
  t.array(raidLog.rowType),
  (ctx) => {
    // Find the caller's guild's active raid log
    for (const membership of ctx.db.guildMember.playerId.filter(ctx.sender)) {
      for (const r of ctx.db.raid.guildId.filter(membership.guildId)) {
        if (r.phase.tag === "Victory" || r.phase.tag === "Defeat") continue;
        const logs = [];
        for (const entry of ctx.db.raidLog.raidId.filter(r.id)) {
          logs.push(entry);
        }
        return logs;
      }
    }
    return [];
  },
);
