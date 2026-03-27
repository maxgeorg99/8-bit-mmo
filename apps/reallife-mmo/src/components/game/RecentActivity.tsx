import { Badge } from "@/components/ui/8bit/badge";
import type { ActivityLog } from "@/lib/types";
import { ACTIVITY_ICONS, ACTIVITY_INPUT, ACTIVITY_LABELS } from "@/lib/types";

interface RecentActivityProps {
  logs: ActivityLog[];
  limit?: number;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
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
  const recent = [...logs].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

  if (recent.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="retro text-[8px] text-muted-foreground">No activities yet. Start logging!</p>
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
              <div className="retro text-[9px]">{ACTIVITY_LABELS[log.type]}</div>
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
