import { useTable } from "spacetimedb/react";
import { tables } from "@/generated";
import { useMyPlayer } from "@/hooks/useStdbPlayer";
import { BIOME_UNLOCK_REQS, type BiomeId } from "@/lib/biomeThemes";

export interface BiomeProgress {
  current: number;
  required: number;
}

export function useBiomeProgress(biomeId: BiomeId): BiomeProgress {
  const [activityLogRows] = useTable(tables.my_activity_logs);
  const { player } = useMyPlayer();
  const streakDays = player?.streakDays ?? 0;
  const req = BIOME_UNLOCK_REQS[biomeId];

  if (!req.count && !req.specialCount) {
    // Plains — always unlocked
    return { current: 1, required: 1 };
  }

  if (req.activityType && req.count) {
    const count = activityLogRows.filter((row) => row.activityType.tag === req.activityType).length;
    return { current: Math.min(count, req.count), required: req.count };
  }

  if (req.special === "streak_days" && req.specialCount) {
    return { current: Math.min(streakDays, req.specialCount), required: req.specialCount };
  }

  if (req.special === "daily_quest_streak" && req.specialCount) {
    // TODO: track consecutive daily quest completions
    return { current: 0, required: req.specialCount };
  }

  if (req.special === "raid_wins" && req.specialCount) {
    // TODO: track raid wins when raid system is built
    return { current: 0, required: req.specialCount };
  }

  return { current: 0, required: 1 };
}
