import { Identity, Timestamp } from "spacetimedb";

// Activity types matching the ActivityType enum
const ACTIVITY_TYPES = [
  "StrengthTraining",
  "Cardio",
  "Hiit",
  "MindLearning",
  "Nutrition",
  "Hydration",
  "Sleep",
  "Mindfulness",
  "Creativity",
  "Social",
] as const;

const ACTIVITY_LABELS: Record<string, string> = {
  StrengthTraining: "Strength Training",
  Cardio: "Cardio",
  Hiit: "HIIT",
  MindLearning: "Learning",
  Nutrition: "Nutrition",
  Hydration: "Hydration",
  Sleep: "Sleep",
  Mindfulness: "Mindfulness",
  Creativity: "Creativity",
  Social: "Social",
};

interface DailyTemplate {
  titleFn: (activity: string) => string;
  descFn: (min: number) => string;
  targetMin: number;
  xpReward: number;
}

const DAILY_TEMPLATES: DailyTemplate[] = [
  {
    titleFn: (a) => `${a} Session`,
    descFn: (min) => `Complete ${min} minutes of activity`,
    targetMin: 30,
    xpReward: 25,
  },
  {
    titleFn: (a) => `Extended ${a}`,
    descFn: (min) => `Push yourself with a ${min}-minute session`,
    targetMin: 60,
    xpReward: 50,
  },
  {
    titleFn: () => "Morning Ritual",
    descFn: () => "Log any activity before noon",
    targetMin: 15,
    xpReward: 15,
  },
  {
    titleFn: (a) => `Quick ${a}`,
    descFn: (min) => `A short ${min}-minute burst to stay on track`,
    targetMin: 15,
    xpReward: 10,
  },
];

// Simple seeded random for variety
function pseudoRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * Generate daily quest data for insertion into the quest table.
 * All players get the same quests for a given day (seeded by date).
 */
export function generateDailyQuestRows(playerId: Identity, now: Timestamp, count = 3) {
  const nowDate = now.toDate();

  // Seed by day (YYYY-MM-DD) so all players get the same quests on the same day
  const dayStr = nowDate.toISOString().slice(0, 10);
  const daySeed = Array.from(dayStr).reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0);
  const rand = pseudoRandom(daySeed);

  // End of day UTC
  const endOfDay = new Date(nowDate);
  endOfDay.setUTCHours(23, 59, 59, 999);
  const endOfDayTs = Timestamp.fromDate(endOfDay);

  const usedTypes = new Set<string>();
  const quests = [];

  for (let i = 0; i < count; i++) {
    // Pick a random activity type (avoid duplicates)
    let actType: string;
    do {
      actType = ACTIVITY_TYPES[Math.floor(rand() * ACTIVITY_TYPES.length)]!;
    } while (usedTypes.has(actType) && usedTypes.size < ACTIVITY_TYPES.length);
    usedTypes.add(actType);

    // Pick a random template
    const template = DAILY_TEMPLATES[Math.floor(rand() * DAILY_TEMPLATES.length)]!;
    const label = ACTIVITY_LABELS[actType] ?? actType;

    quests.push({
      id: 0n,
      playerId,
      title: template.titleFn(label),
      description: template.descFn(template.targetMin),
      questType: { tag: "Daily" as const },
      activityType: { tag: actType },
      targetMin: template.targetMin,
      progressMin: 0,
      xpReward: template.xpReward,
      completed: false,
      claimed: false,
      expiresAt: endOfDayTs,
      manualComplete: false,
    });
  }

  return quests;
}
