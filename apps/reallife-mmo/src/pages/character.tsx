import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Progress } from "@/components/ui/8bit/progress";
import HealthBar from "@/components/ui/8bit/health-bar";
import XpBar from "@/components/ui/8bit/xp-bar";
import { CharacterAvatar } from "@/components/game/CharacterAvatar";
import { ChestPanel } from "@/components/game/ChestPanel";
import { TitleSelector } from "@/components/game/TitleSelector";
import { useTable, useReducer } from "spacetimedb/react";
import { useTranslation } from "react-i18next";
import { tables, reducers } from "@/generated";
import { useMyPlayer, useEquipmentActions } from "@/hooks/useStdbPlayer";
import { getClassAffinities } from "@/lib/classEngine";
import { AnimatedStatBar } from "@/components/game/AnimatedStatBar";
import { CLASS_COLORS, type StatName, type ActivityLog } from "@/lib/types";
import { cn } from "@/lib/utils";

const STAT_ORDER: StatName[] = ["STR", "AGI", "INT", "CON", "WIS", "CHA", "MP"];

export function Character() {
  const { t } = useTranslation();
  const { player } = useMyPlayer();
  const [activityLogRows] = useTable(tables.my_activity_logs);
  const { equipItem, unequipItem } = useEquipmentActions();
  const selectTitle = useReducer(reducers.selectTitle);
  const [titleRows] = useTable(tables.my_titles);

  if (!player) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="retro text-[10px] text-muted-foreground">{t("character.loadingCharacter")}</p>
      </div>
    );
  }

  // Convert SpacetimeDB activity log rows to the local ActivityLog shape
  const logs: ActivityLog[] = activityLogRows.map((row) => ({
    id: String(row.id),
    type: row.activityType.tag,
    rawValue: row.rawValue,
    durationMin: row.durationMin,
    intensity: row.intensity,
    timestamp: Number(row.timestamp.toMillis()),
    statDeltas: {
      ...(row.deltaStr ? { STR: row.deltaStr } : {}),
      ...(row.deltaAgi ? { AGI: row.deltaAgi } : {}),
      ...(row.deltaInt ? { INT: row.deltaInt } : {}),
      ...(row.deltaCon ? { CON: row.deltaCon } : {}),
      ...(row.deltaWis ? { WIS: row.deltaWis } : {}),
      ...(row.deltaCha ? { CHA: row.deltaCha } : {}),
      ...(row.deltaMp ? { MP: row.deltaMp } : {}),
    },
  }));

  // Read unlocked titles from SpacetimeDB table
  const unlockedTitles = titleRows.map((t) => t.titleId);

  const affinities = getClassAffinities(logs);
  const maxAffinity = affinities.length > 0 ? affinities[0].score : 1;
  const xpPercent = player.xpToNext > 0 ? Math.round((player.xp / player.xpToNext) * 100) : 0;
  const hpPercent = player.maxHp > 0 ? Math.round((player.hp / player.maxHp) * 100) : 100;

  // Adapter: ChestPanel calls onUnequip(slot), but SpacetimeDB needs an itemId.
  // Find the equipped item for that slot and pass its ID.
  const handleUnequip = (slot: string) => {
    const equippedItem = player.equipment[slot as keyof typeof player.equipment];
    if (equippedItem) {
      void unequipItem(equippedItem.id);
    }
  };

  const handleSelectTitle = (titleId: string | null) => {
    void selectTitle({ titleId: titleId ?? undefined });
  };

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
              <span className="text-red-500">{t("common.hp")}</span>
              <span>
                {player.hp}/{player.maxHp}
              </span>
            </div>
            <HealthBar value={hpPercent} variant="retro" className="h-3" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between retro text-[8px] text-muted-foreground">
              <span className="text-yellow-500">{t("common.xp")}</span>
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
          <CardTitle className="text-xs">{t("character.attributes")}</CardTitle>
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

              return <AnimatedStatBar key={stat} stat={stat} value={total} bonus={equipBonus} />;
            })}
          </div>
          <div className="flex justify-between retro text-[7px] text-muted-foreground pt-3">
            <span>{t("character.streak", { days: player.streakDays })}</span>
            <span>{t("character.activities", { count: player.totalActivities })}</span>
          </div>
        </CardContent>
      </Card>

      {/* Class affinities */}
      {affinities.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">{t("character.classAffinities")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="retro text-[7px] text-muted-foreground">
              {t("character.affinityDescription")}
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
        unlockedTitles={unlockedTitles}
        activeTitle={player.activeTitle ?? null}
        onSelect={handleSelectTitle}
      />

      {/* Chest / Equipment */}
      <ChestPanel
        items={player.chest}
        equipped={player.equipment}
        playerLevel={player.level}
        onEquip={equipItem}
        onUnequip={handleUnequip}
      />
    </div>
  );
}
