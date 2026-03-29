import { useNavigate } from "react-router";
import { useTable } from "spacetimedb/react";
import { useTranslation } from "react-i18next";
import { tables } from "@/generated";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Progress } from "@/components/ui/8bit/progress";
import PlayerProfileCard from "@/components/ui/8bit/blocks/player-profile-card";
import { RecentActivity } from "@/components/game/RecentActivity";
import { useMyPlayer } from "@/hooks/useStdbPlayer";
import {
  CLASS_SPRITES,
  TIER_GLOW,
  STAT_COLORS,
  getCharacterTier,
  type StatName,
  type ActivityLog,
  type ActivityType,
  type Quest,
} from "@/lib/types";
import { TITLE_MAP } from "@/lib/titles";
import { asset, cn } from "@/lib/utils";

/** Convert SpacetimeDB quest row to local Quest type */
function stdbQuestToLocal(row: any): Quest {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    type: row.questType.tag.toLowerCase() as Quest["type"],
    activityType: row.activityType ? ((row.activityType.value?.tag as ActivityType) ?? null) : null,
    targetMin: row.targetMin,
    progressMin: row.progressMin,
    xpReward: row.xpReward,
    completed: row.completed,
    expiresAt: row.expiresAt ? Number(row.expiresAt.value?.toMillis?.() ?? 0) : 0,
    manualComplete: row.manualComplete,
  };
}

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { player } = useMyPlayer();
  const [questRows] = useTable(tables.my_quests);
  const [activityLogRows] = useTable(tables.my_activity_logs);

  const quests = questRows.map(stdbQuestToLocal);

  // Convert activity logs
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

  // Handle loading state
  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="retro text-[8px] text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  const completedQuests = quests.filter((q) => q.completed).length;

  const customStats = (["STR", "AGI", "INT", "CON", "WIS", "CHA", "MP"] as StatName[])
    .filter((s) => player.stats[s] > 0)
    .map((stat) => ({
      label: stat,
      value: Math.round(player.stats[stat] * 10) / 10,
      max: 100,
      color: STAT_COLORS[stat],
      variant: "retro" as const,
    }));

  return (
    <div className="space-y-6">
      {/* Character sprite + profile */}
      <div className="flex justify-center pb-2">
        <img
          src={asset(CLASS_SPRITES[player.playerClass as keyof typeof CLASS_SPRITES])}
          alt={player.playerClass}
          className={cn("pixelated w-24 h-24", TIER_GLOW[getCharacterTier(player.level)])}
        />
      </div>
      <PlayerProfileCard
        playerName={player.name || t("dashboard.unnamedHero")}
        playerClass={t(`classes.${player.playerClass}`)}
        level={player.level}
        stats={{
          health: { current: player.hp, max: player.maxHp },
          experience: { current: player.xp, max: player.xpToNext },
        }}
        showMana={false}
        customStats={customStats}
      />
      {player.activeTitle && TITLE_MAP.get(player.activeTitle) && (
        <div className="flex justify-center -mt-3">
          <span className="retro text-[8px] text-amber-400/80">
            {TITLE_MAP.get(player.activeTitle)!.icon} {t(`titles.${player.activeTitle}`)}
          </span>
        </div>
      )}

      {/* Streak banner */}
      {player.streakDays > 0 && (
        <div className="flex items-center justify-center gap-2 py-2 border border-border">
          <span className="text-lg">🔥</span>
          <span className="retro text-[10px] text-foreground">
            {t("dashboard.dayStreak", { count: player.streakDays })}
          </span>
          {player.streakDays >= 7 && <span className="text-lg">🔥</span>}
        </div>
      )}

      {/* Gold display */}
      <div className="flex items-center justify-center gap-1">
        <span className="text-sm">💰</span>
        <span className="retro text-[10px] text-amber-400">
          {t("common.goldAmount", { amount: player.gold })}
        </span>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => navigate("/activity")} className="text-[8px]">
          {t("dashboard.logActivity")}
        </Button>
        <Button onClick={() => navigate("/quests")} variant="outline" className="text-[8px]">
          {completedQuests > 0
            ? t("dashboard.questsReady", { count: completedQuests })
            : t("dashboard.quests")}
        </Button>
        <Button onClick={() => navigate("/leaderboard")} variant="outline" className="text-[8px]">
          {t("dashboard.leaderboard")}
        </Button>
        <Button onClick={() => navigate("/guild")} variant="outline" className="text-[8px]">
          {t("dashboard.guild")}
        </Button>
        <Button
          onClick={() => navigate("/friends")}
          variant="outline"
          className="text-[8px] col-span-2"
        >
          {t("dashboard.friends")}
        </Button>
      </div>

      {/* Quest summary */}
      {quests.filter((q) => !q.completed).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">{t("dashboard.activeQuests")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quests
                .filter((q) => !q.completed)
                .slice(0, 3)
                .map((q) => {
                  const pct = Math.min(Math.round((q.progressMin / q.targetMin) * 100), 100);
                  return (
                    <div key={q.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="retro text-[7px]">{q.title}</div>
                        <Progress
                          value={pct}
                          variant="retro"
                          progressBg="bg-yellow-500"
                          className="h-1.5 mt-1"
                        />
                      </div>
                      <span className="retro text-[7px] text-muted-foreground">{pct}%</span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs">{t("dashboard.recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivity logs={logs} limit={5} />
        </CardContent>
      </Card>
    </div>
  );
}
