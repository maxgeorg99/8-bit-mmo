import { describe, expect, it } from "vite-plus/test";
import {
  calculateStatDeltas,
  calculateXpGain,
  intensityMultiplier,
  streakMultiplier,
  toEffectiveMinutes,
  xpToNextLevel,
  maxHp,
} from "../statEngine";

describe("intensityMultiplier", () => {
  it("returns 0.55 at intensity 1", () => {
    expect(intensityMultiplier(1)).toBeCloseTo(0.55);
  });

  it("returns 1.0 at intensity 10", () => {
    expect(intensityMultiplier(10)).toBeCloseTo(1.0);
  });

  it("clamps below 1", () => {
    expect(intensityMultiplier(0)).toBeCloseTo(0.55);
  });

  it("clamps above 10", () => {
    expect(intensityMultiplier(15)).toBeCloseTo(1.0);
  });
});

describe("streakMultiplier", () => {
  it("returns 1.0 at streak 0", () => {
    expect(streakMultiplier(0)).toBeCloseTo(1.0);
  });

  it("caps at 1.5", () => {
    expect(streakMultiplier(100)).toBeCloseTo(1.5);
  });

  it("grows linearly", () => {
    expect(streakMultiplier(30)).toBeCloseTo(1.5, 1);
  });
});

describe("toEffectiveMinutes", () => {
  it("passes through duration activities", () => {
    expect(toEffectiveMinutes("StrengthTraining", 45)).toBe(45);
    expect(toEffectiveMinutes("Cardio", 30)).toBe(30);
  });

  it("converts meals to effective minutes", () => {
    expect(toEffectiveMinutes("Nutrition", 1)).toBe(10); // snack
    expect(toEffectiveMinutes("Nutrition", 3)).toBe(30); // full meal
  });

  it("converts glasses of water", () => {
    expect(toEffectiveMinutes("Hydration", 4)).toBe(20); // 4 glasses × 5
  });

  it("converts sleep hours to minutes", () => {
    expect(toEffectiveMinutes("Sleep", 8)).toBe(480); // 8h × 60
  });

  it("caps sleep at 10 hours", () => {
    expect(toEffectiveMinutes("Sleep", 12)).toBe(600); // 10h × 60
  });
});

describe("calculateStatDeltas", () => {
  it("returns correct stats for strength training", () => {
    const deltas = calculateStatDeltas("StrengthTraining", 60, 10, 0, 0);
    expect(deltas.STR).toBeGreaterThan(0);
    expect(deltas.CON).toBeGreaterThan(0);
    expect(deltas.AGI).toBeUndefined();
  });

  it("applies diminishing returns after 3 same-type activities", () => {
    const normal = calculateStatDeltas("Cardio", 30, 5, 0, 2);
    const diminished = calculateStatDeltas("Cardio", 30, 5, 0, 3);
    expect(diminished.AGI!).toBeLessThan(normal.AGI!);
  });

  it("uses flat multiplier for no-intensity activities", () => {
    const deltas = calculateStatDeltas("Sleep", 8, 5, 0, 0);
    expect(deltas.CON).toBeGreaterThan(0);
    expect(deltas.WIS).toBeGreaterThan(0);
  });

  it("gives Social activity CHA stats", () => {
    const deltas = calculateStatDeltas("Social", 60, 5, 0, 0);
    expect(deltas.CHA).toBeGreaterThan(0);
  });
});

describe("calculateXpGain", () => {
  it("returns positive XP for any activity", () => {
    expect(calculateXpGain("StrengthTraining", 30, 5, 0)).toBeGreaterThan(0);
  });

  it("scales with duration", () => {
    const short = calculateXpGain("Cardio", 15, 5, 0);
    const long = calculateXpGain("Cardio", 60, 5, 0);
    expect(long).toBeGreaterThan(short);
  });

  it("gives XP for non-duration activities", () => {
    expect(calculateXpGain("Hydration", 3, 5, 0)).toBeGreaterThan(0);
    expect(calculateXpGain("Sleep", 8, 5, 0)).toBeGreaterThan(0);
    expect(calculateXpGain("Nutrition", 3, 5, 0)).toBeGreaterThan(0);
  });
});

describe("xpToNextLevel", () => {
  it("returns 25 at level 1", () => {
    expect(xpToNextLevel(1)).toBe(25);
  });

  it("scales quadratically at higher levels", () => {
    const l10 = xpToNextLevel(10);
    const l20 = xpToNextLevel(20);
    expect(l20).toBeGreaterThan(l10 * 1.5); // more than linear
  });
});

describe("maxHp", () => {
  it("starts at 50 + level bonuses", () => {
    expect(maxHp(1, 0)).toBe(52);
  });

  it("scales with CON", () => {
    expect(maxHp(1, 10)).toBeGreaterThan(maxHp(1, 0));
  });
});
