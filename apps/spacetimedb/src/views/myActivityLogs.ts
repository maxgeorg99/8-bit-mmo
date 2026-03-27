import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { activityLog } from "../tables/activityLog";

export const my_activity_logs = spacetimedb.view(
  { name: "my_activity_logs", public: true },
  t.array(activityLog.rowType),
  (ctx) => {
    const logs = [];
    for (const log of ctx.db.activityLog.playerId.filter(ctx.sender)) {
      logs.push(log);
    }
    // Sort by timestamp desc, return last 100
    logs.sort((a, b) =>
      Number(b.timestamp.microsSinceUnixEpoch - a.timestamp.microsSinceUnixEpoch),
    );
    return logs.slice(0, 100);
  },
);
