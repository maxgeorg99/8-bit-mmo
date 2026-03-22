import type { ActivityType, Quest, QuestType } from "./types";
import { ACTIVITY_LABELS, ACTIVITY_TYPES } from "./types";

let questCounter = 0;

const DAILY_TEMPLATES: Array<{
  titleFn: (activity: string) => string;
  descFn: (min: number) => string;
  targetMin: number;
  xpReward: number;
}> = [
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

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateDailyQuests(count = 3): Quest[] {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const usedTypes = new Set<ActivityType>();
  const quests: Quest[] = [];

  for (let i = 0; i < count; i++) {
    let actType: ActivityType;
    do {
      actType = randomItem(ACTIVITY_TYPES);
    } while (usedTypes.has(actType) && usedTypes.size < ACTIVITY_TYPES.length);
    usedTypes.add(actType);

    const template = randomItem(DAILY_TEMPLATES);
    const label = ACTIVITY_LABELS[actType];

    quests.push({
      id: `quest-${++questCounter}`,
      title: template.titleFn(label),
      description: template.descFn(template.targetMin),
      type: "daily" as QuestType,
      activityType: actType,
      targetMin: template.targetMin,
      progressMin: 0,
      xpReward: template.xpReward,
      completed: false,
      expiresAt: endOfDay.getTime(),
    });
  }

  return quests;
}
