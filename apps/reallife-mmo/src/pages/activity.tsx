import { useEffect, useRef } from "react";
import { ActivityLogger } from "@/components/game/ActivityLogger";
import { RecentActivity } from "@/components/game/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { toast } from "@/components/ui/8bit/toast";
import { useGameStore } from "@/lib/gameStore";

export function Activity() {
  const player = useGameStore((s) => s.player);
  const logActivity = useGameStore((s) => s.logActivity);
  const logs = useGameStore((s) => s.activityLogs);
  const lastActivityType = useGameStore((s) => s.lastActivityType);
  const consumeNotifications = useGameStore((s) => s.consumeNotifications);
  const pendingCount = useGameStore((s) => s.pendingNotifications.length);
  const prevPendingRef = useRef(pendingCount);

  // Show toast notifications when new ones appear
  useEffect(() => {
    if (pendingCount > prevPendingRef.current) {
      const notifs = consumeNotifications();
      for (const msg of notifs) {
        toast(msg);
      }
    }
    prevPendingRef.current = pendingCount;
  }, [pendingCount, consumeNotifications]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="retro text-lg text-foreground">Log Activity</h1>
        <p className="retro text-[8px] text-muted-foreground mt-1">
          Your real-world grind powers your character
        </p>
      </div>

      <ActivityLogger
        streakDays={player.streakDays}
        defaultActivityType={lastActivityType}
        onLog={logActivity}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs">Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivity logs={logs} limit={10} />
        </CardContent>
      </Card>
    </div>
  );
}
