import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Progress } from "@/components/ui/8bit/progress";
import HealthBar from "@/components/ui/8bit/health-bar";
import XpBar from "@/components/ui/8bit/xp-bar";
import { CharacterAvatar } from "@/components/game/CharacterAvatar";
import { ChestPanel } from "@/components/game/ChestPanel";
import { TitleSelector } from "@/components/game/TitleSelector";
import { useGameStore } from "@/lib/gameStore";
import { getClassAffinities } from "@/lib/classEngine";
import { AnimatedStatBar } from "@/components/game/AnimatedStatBar";
import { CLASS_COLORS, type StatName } from "@/lib/types";
import { cn } from "@/lib/utils";

const STAT_ORDER: StatName[] = ["STR", "AGI", "INT", "CON", "WIS", "CHA", "MP"];

export function Character() {
  const player = useGameStore((s) => s.player);
  const logs = useGameStore((s) => s.activityLogs);
  const equipItem = useGameStore((s) => s.equipItem);
  const unequipSlot = useGameStore((s) => s.unequipSlot);
  const selectTitle = useGameStore((s) => s.selectTitle);

  const affinities = getClassAffinities(logs);
  const maxAffinity = affinities.length > 0 ? affinities[0].score : 1;
  const xpPercent = player.xpToNext > 0 ? Math.round((player.xp / player.xpToNext) * 100) : 0;
  const hpPercent = player.maxHp > 0 ? Math.round((player.hp / player.maxHp) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Character Avatar with equipment preview */}
      <CharacterAvatar
        playerClass={player.playerClass}
        level={player.level}
        name={player.name}
        equipment={player.equipment}
        activeTitle={player.activeTitle}
      />

      {/* HP + XP bars */}
      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="space-y-1">
            <div className="flex justify-between retro text-[8px] text-muted-foreground">
              <span className="text-red-500">HP</span>
              <span>
                {player.hp}/{player.maxHp}
              </span>
            </div>
            <HealthBar value={hpPercent} variant="retro" className="h-3" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between retro text-[8px] text-muted-foreground">
              <span className="text-yellow-500">XP</span>
              <span>
                {player.xp}/{player.xpToNext}
              </span>
            </div>
            <XpBar value={xpPercent} variant="retro" className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs">Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {STAT_ORDER.map((stat) => {
              const baseStat = player.stats[stat];
              const equipBonus = Object.values(player.equipment).reduce(
                (sum, item) => sum + (item?.statBonus[stat] ?? 0),
                0,
              );
              const total = baseStat + equipBonus;

              return (
                <div key={stat} className="relative">
                  <AnimatedStatBar stat={stat} value={total} />
                  {equipBonus > 0 && (
                    <span className="absolute right-0 top-0 retro text-[6px] text-green-400">
                      (+{equipBonus})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between retro text-[7px] text-muted-foreground pt-3">
            <span>Streak: {player.streakDays}d</span>
            <span>Activities: {player.totalActivities}</span>
          </div>
        </CardContent>
      </Card>

      {/* Class affinities */}
      {affinities.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Class Affinities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="retro text-[7px] text-muted-foreground">
              Your activity profile determines your class
            </p>
            {affinities.map((a) => {
              const pct = Math.round((a.score / maxAffinity) * 100);
              return (
                <div key={a.class} className="space-y-1">
                  <div className="flex justify-between">
                    <span className={cn("retro text-[8px]", CLASS_COLORS[a.class])}>{a.class}</span>
                    <span className="retro text-[7px] text-muted-foreground">
                      {a.score.toFixed(1)}
                    </span>
                  </div>
                  <Progress value={pct} variant="retro" progressBg="bg-primary" className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Titles */}
      <TitleSelector
        unlockedTitles={player.unlockedTitles ?? []}
        activeTitle={player.activeTitle ?? null}
        onSelect={selectTitle}
      />

      {/* Chest / Equipment */}
      <ChestPanel
        items={player.chest}
        equipped={player.equipment}
        playerLevel={player.level}
        onEquip={equipItem}
        onUnequip={unequipSlot}
      />
    </div>
  );
}
