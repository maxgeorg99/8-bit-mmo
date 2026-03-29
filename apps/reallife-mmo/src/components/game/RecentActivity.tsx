import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/8bit/badge";
import type { ActivityLog } from "@/lib/types";
import { ACTIVITY_ICONS, ACTIVITY_INPUT } from "@/lib/types";

interface RecentActivityProps {
  logs: ActivityLog[];
  limit?: number;
}

function useTimeAgo() {
  const { t } = useTranslation();
  return (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("timeAgo.justNow");
    if (mins < 60) return t("timeAgo.minutesAgo", { count: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t("timeAgo.hoursAgo", { count: hours });
    return t("timeAgo.daysAgo", { count: Math.floor(hours / 24) });
  };
}

function formatLogValue(log: ActivityLog): string {
  const config = ACTIVITY_INPUT[log.type];
  const raw = log.rawValue ?? log.durationMin; // backwards compat for old logs
  switch (config.mode) {
    case "meal":
      return ["", "Snack", "Light meal", "Full meal"][raw] ?? `${raw} meal(s)`;
    case "glasses":
      return `${raw} ${raw === 1 ? "glass" : "glasses"} of water`;
    case "sleep":
      return `${raw}h sleep`;
    case "duration":
    default: {
      const desc = `${raw}min`;
      return config.hasIntensity ? `${desc} · Intensity ${log.intensity}/10` : desc;
    }
  }
}

export function RecentActivity({ logs, limit = 5 }: RecentActivityProps) {
  const { t } = useTranslation();
  const timeAgo = useTimeAgo();
  const recent = [...logs].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

  if (recent.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="retro text-[8px] text-muted-foreground">{t("activity.noActivities")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recent.map((log) => (
        <div
          key={log.id}
          className="flex items-start justify-between p-3 border border-border gap-3"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">{ACTIVITY_ICONS[log.type]}</span>
            <div className="space-y-1">
              <div className="retro text-[9px]">{t(`activityTypes.${log.type}`)}</div>
              {log.note && <div className="retro text-[8px] text-foreground/80">{log.note}</div>}
              <div className="retro text-[7px] text-muted-foreground">{formatLogValue(log)}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
              {Object.entries(log.statDeltas)
                .filter(([, val]) => val != null && (val as number) > 0)
                .map(([stat, val]) => (
                  <Badge key={stat} variant="secondary" className="text-[6px] py-0">
                    +{(val as number).toFixed(1)} {stat}
                  </Badge>
                ))}
            </div>
            <span className="retro text-[7px] text-muted-foreground">{timeAgo(log.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
