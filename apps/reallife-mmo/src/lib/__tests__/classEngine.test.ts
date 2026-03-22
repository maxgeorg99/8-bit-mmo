import { describe, expect, it } from "vite-plus/test";
import { deriveClass, getClassAffinities } from "../classEngine";
import type { ActivityLog } from "../types";

function makeLog(type: string, daysAgo: number, durationMin = 60): ActivityLog {
  return {
    id: `test-${Math.random()}`,
    type: type as ActivityLog["type"],
    rawValue: durationMin,
    durationMin,
    intensity: 5,
    timestamp: Date.now() - daysAgo * 24 * 60 * 60 * 1000,
    statDeltas: {},
  };
}

function makeLogs(type: string, count: number, startDay = 0): ActivityLog[] {
  return Array.from({ length: count }, (_, i) => makeLog(type, startDay + i));
}

describe("deriveClass", () => {
  it("returns Unclassed with insufficient data", () => {
    const logs = makeLogs("StrengthTraining", 3); // only 3 unique days
    expect(deriveClass(logs)).toBe("Unclassed");
  });

  it("returns Warrior for heavy strength training", () => {
    const logs = makeLogs("StrengthTraining", 10);
    expect(deriveClass(logs)).toBe("Warrior");
  });

  it("returns Mage for heavy studying", () => {
    const logs = makeLogs("MindLearning", 10);
    expect(deriveClass(logs)).toBe("Mage");
  });

  it("returns Rogue for heavy cardio", () => {
    const logs = makeLogs("Cardio", 10);
    expect(deriveClass(logs)).toBe("Rogue");
  });

  it("returns Bard for social + creativity", () => {
    const social = makeLogs("Social", 5);
    const creative = makeLogs("Creativity", 5, 5);
    expect(deriveClass([...social, ...creative])).toBe("Bard");
  });

  it("returns Druid for mindfulness + sleep + nutrition", () => {
    const mind = makeLogs("Mindfulness", 4);
    const sleep = makeLogs("Sleep", 4, 4);
    const nutrition = makeLogs("Nutrition", 4, 8);
    expect(deriveClass([...mind, ...sleep, ...nutrition])).toBe("Druid");
  });

  it("ignores logs older than 30 days", () => {
    const oldLogs = makeLogs("StrengthTraining", 10, 35); // 35+ days ago
    const recentLogs = makeLogs("MindLearning", 10);
    expect(deriveClass([...oldLogs, ...recentLogs])).toBe("Mage");
  });
});

describe("getClassAffinities", () => {
  it("returns empty for no logs", () => {
    expect(getClassAffinities([])).toEqual([]);
  });

  it("returns sorted affinities", () => {
    const logs = makeLogs("StrengthTraining", 10);
    const affinities = getClassAffinities(logs);
    expect(affinities.length).toBeGreaterThan(0);
    expect(affinities[0].class).toBe("Warrior");
    // Sorted by score descending
    for (let i = 1; i < affinities.length; i++) {
      expect(affinities[i].score).toBeLessThanOrEqual(affinities[i - 1].score);
    }
  });

  it("returns max 3 affinities", () => {
    const logs = [
      ...makeLogs("StrengthTraining", 3),
      ...makeLogs("Cardio", 3, 3),
      ...makeLogs("MindLearning", 3, 6),
      ...makeLogs("Creativity", 3, 9),
    ];
    expect(getClassAffinities(logs).length).toBeLessThanOrEqual(3);
  });
});
