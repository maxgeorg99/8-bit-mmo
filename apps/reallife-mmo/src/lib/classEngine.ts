import type { ActivityLog, ActivityType, PlayerClass } from "./types";

/**
 * Archetype weight map: each activity type contributes points toward class archetypes.
 * Higher weight = stronger signal for that class.
 */
const ARCHETYPE_WEIGHTS: Record<ActivityType, Partial<Record<PlayerClass, number>>> = {
  StrengthTraining: { Warrior: 3, Paladin: 1, Ranger: 1 },
  Cardio: { Rogue: 3, Ranger: 2 },
  Hiit: { Warrior: 1, Rogue: 2, Ranger: 1 },
  MindLearning: { Mage: 3, Scholar: 2 },
  Nutrition: { Paladin: 2, Druid: 2 },
  Hydration: { Druid: 1, Paladin: 1 },
  Sleep: { Druid: 2, Paladin: 1 },
  Mindfulness: { Druid: 3, Bard: 1 },
  Creativity: { Bard: 3, Mage: 1 },
  Social: { Bard: 3, Paladin: 1 },
};

const MIN_DAYS_FOR_CLASS = 7;

/**
 * Derive the player's class from a rolling window of activity logs.
 * Uses a 30-day window. Requires at least 7 days of data.
 */
export function deriveClass(logs: ActivityLog[]): PlayerClass {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const recentLogs = logs.filter((l) => l.timestamp >= thirtyDaysAgo);

  // Check if we have enough unique days
  const uniqueDays = new Set(recentLogs.map((l) => new Date(l.timestamp).toDateString()));
  if (uniqueDays.size < MIN_DAYS_FOR_CLASS) return "Unclassed";

  // Accumulate weighted scores per class
  const scores: Record<string, number> = {};

  for (const log of recentLogs) {
    const weights = ARCHETYPE_WEIGHTS[log.type];
    const durationWeight = Math.min(log.durationMin, 180) / 60; // hours capped at 3

    for (const [cls, weight] of Object.entries(weights)) {
      if (weight) {
        scores[cls] = (scores[cls] ?? 0) + weight * durationWeight;
      }
    }
  }

  // Find highest scoring class
  let bestClass: PlayerClass = "Unclassed";
  let bestScore = 0;

  for (const [cls, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestClass = cls as PlayerClass;
    }
  }

  return bestClass;
}

/**
 * Get the top 3 class affinities with their scores (for UI display).
 */
export function getClassAffinities(
  logs: ActivityLog[],
): Array<{ class: PlayerClass; score: number }> {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recentLogs = logs.filter((l) => l.timestamp >= thirtyDaysAgo);

  const scores: Partial<Record<PlayerClass, number>> = {};

  for (const log of recentLogs) {
    const weights = ARCHETYPE_WEIGHTS[log.type];
    const durationWeight = Math.min(log.durationMin, 180) / 60;

    for (const [cls, weight] of Object.entries(weights)) {
      if (weight) {
        scores[cls as PlayerClass] = (scores[cls as PlayerClass] ?? 0) + weight * durationWeight;
      }
    }
  }

  return Object.entries(scores)
    .map(([cls, score]) => ({ class: cls as PlayerClass, score: score ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
