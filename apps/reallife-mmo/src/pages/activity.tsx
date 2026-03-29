import { useCallback } from "react";
import { useTable, useReducer } from "spacetimedb/react";
import { useTranslation } from "react-i18next";
import { tables, reducers } from "@/generated";
import { ActivityLogger } from "@/components/game/ActivityLogger";
import { RecentActivity } from "@/components/game/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { toast } from "@/components/ui/8bit/toast";
import { useMyPlayer } from "@/hooks/useStdbPlayer";
import type { ActivityLog, ActivityType } from "@/lib/types";

export function Activity() {
  const { t } = useTranslation();
  const { player } = useMyPlayer();
  const logActivityReducer = useReducer(reducers.logActivity);
  const [activityLogRows] = useTable(tables.my_activity_logs);

  // Convert SpacetimeDB activity log rows to local ActivityLog type
  const logs: ActivityLog[] = activityLogRows.map((row) => ({
    id: String(row.id),
    type: row.activityType.tag as ActivityType,
    rawValue: row.rawValue,
    durationMin: row.durationMin,
    intensity: row.intensity,
    timestamp: Number(row.timestamp.toMillis()),
    note: row.note ?? undefined,
    statDeltas: {
      STR: row.deltaStr,
      AGI: row.deltaAgi,
      INT: row.deltaInt,
      CON: row.deltaCon,
      WIS: row.deltaWis,
      CHA: row.deltaCha,
      MP: row.deltaMp,
    },
  }));

  const handleLog = useCallback(
    (type: ActivityType, rawValue: number, intensity: number, note?: string) => {
      void logActivityReducer({
        activityType: { tag: type } as any,
        rawValue,
        intensity,
        note: note ?? undefined,
      });
      toast(t("activity.activityLogged"));
    },
    [logActivityReducer, t],
  );

  // Determine last activity type from most recent log
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  const lastActivityType = sortedLogs[0]?.type;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="retro text-lg text-foreground">{t("activity.logActivity")}</h1>
        <p className="retro text-[8px] text-muted-foreground mt-1">{t("activity.subtitle")}</p>
      </div>

      <ActivityLogger
        streakDays={player?.streakDays ?? 0}
        defaultActivityType={lastActivityType}
        onLog={handleLog}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs">{t("activity.activityHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivity logs={logs} limit={10} />
        </CardContent>
      </Card>
    </div>
  );
}
