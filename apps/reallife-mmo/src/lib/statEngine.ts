import type { ActivityType, Stats } from "./types";
import { ACTIVITY_INPUT } from "./types";

/**
 * Base stat rates per hour of effective activity.
 * For non-duration activities, the raw input is converted to
 * "effective minutes" before applying rates (see toEffectiveMinutes).
 */
const BASE_RATES: Record<ActivityType, Partial<Stats>> = {
  StrengthTraining: { STR: 3.0, CON: 1.5 },
  Cardio: { AGI: 3.0, CON: 1.0 },
  Hiit: { STR: 1.5, AGI: 1.5, CON: 1.0 },
  MindLearning: { INT: 3.0, MP: 1.5 },
  Nutrition: { CON: 2.0, WIS: 1.5 },
  Hydration: { CON: 1.0 },
  Sleep: { CON: 2.0, WIS: 1.0 },
  Mindfulness: { WIS: 3.0, MP: 1.0 },
  Creativity: { CHA: 3.0, WIS: 1.0 },
  Social: { CHA: 2.5, WIS: 0.5, CON: 0.5 },
};

/** Max session duration in minutes (capped). */
const SESSION_CAP_MIN = 180;

/** After the 3rd same-type activity in a day, yield 25% of normal. */
const DIMINISHED_RATE = 0.25;

/**
 * Convert a raw activity input value into effective minutes
 * so the stat formula works uniformly across all activity types.
 *
 * - duration (min): pass-through
 * - meal:  1 snack = 10 min, 2 light = 20 min, 3 full = 30 min
 * - glasses: each glass of water ≈ 5 min effective
 * - sleep (hours): hours * 60, but capped at 10h
 */
export function toEffectiveMinutes(activityType: ActivityType, rawValue: number): number {
  const config = ACTIVITY_INPUT[activityType];
  switch (config.mode) {
    case "duration":
      return rawValue;
    case "meal":
      return rawValue * 10; // 1 = snack (10), 2 = light (20), 3 = full (30)
    case "glasses":
      return rawValue * 5; // each glass ≈ 5 effective min
    case "sleep":
      return Math.min(rawValue, 10) * 60; // hours → minutes, capped at 10h
    default:
      return rawValue;
  }
}

/**
 * Compute intensity multiplier: intensity is 1-10.
 * Maps to 0.55 (intensity=1) to 1.0 (intensity=10).
 */
export function intensityMultiplier(intensity: number): number {
  const clamped = Math.max(1, Math.min(10, intensity));
  return 0.5 + clamped / 20;
}

/**
 * Compute streak multiplier: grows linearly to 1.5x at 30 days.
 */
export function streakMultiplier(streakDays: number): number {
  return Math.min(1.0 + streakDays * 0.0167, 1.5);
}

/**
 * Calculate stat deltas for a single activity session.
 * `rawValue` is the user-facing input (minutes, meals, glasses, hours)
 * and gets converted to effective minutes internally.
 */
export function calculateStatDeltas(
  activityType: ActivityType,
  rawValue: number,
  intensity: number,
  streakDays: number,
  sameTypeTodayCount: number,
): Partial<Stats> {
  const effectiveMin = toEffectiveMinutes(activityType, rawValue);
  const capped = Math.min(effectiveMin, SESSION_CAP_MIN);
  const hours = capped / 60;

  const config = ACTIVITY_INPUT[activityType];
  const intMul = config.hasIntensity ? intensityMultiplier(intensity) : 0.8; // flat 0.8 for no-intensity activities
  const strMul = streakMultiplier(streakDays);
  const diminish = sameTypeTodayCount >= 3 ? DIMINISHED_RATE : 1;

  const rates = BASE_RATES[activityType];
  const deltas: Partial<Stats> = {};

  for (const [stat, rate] of Object.entries(rates)) {
    if (rate) {
      deltas[stat as keyof Stats] =
        Math.round(rate * hours * intMul * strMul * diminish * 100) / 100;
    }
  }

  return deltas;
}

/**
 * XP gained from an activity session.
 * Base: 10 XP per 30 effective min, scaled by intensity and streak.
 */
export function calculateXpGain(
  activityType: ActivityType,
  rawValue: number,
  intensity: number,
  streakDays: number,
): number {
  const effectiveMin = toEffectiveMinutes(activityType, rawValue);
  const capped = Math.min(effectiveMin, SESSION_CAP_MIN);
  const config = ACTIVITY_INPUT[activityType];
  const base = (capped / 30) * 10;
  const intMul = config.hasIntensity ? intensityMultiplier(intensity) : 0.8;
  return Math.round(base * intMul * streakMultiplier(streakDays));
}

/**
 * XP required to reach the next level.
 * Levels 1-4: 25*level (fast early game)
 * Level 5+: quadratic scaling
 */
export function xpToNextLevel(level: number): number {
  if (level <= 4) return 25 * level;
  return Math.round((level * level * 0.25 + 10 * level + 140) / 10) * 10;
}

/**
 * Max HP scales with level and CON.
 */
export function maxHp(level: number, con: number): number {
  return 50 + level * 2 + Math.floor(con / 2);
}
