import type { ActivityType, Quest, QuestType } from "./types";
import { ACTIVITY_TYPES } from "./types";

let questCounter = 0;

/**
 * Quest title/description templates.
 * These use i18n keys that are resolved at render time via t().
 * The titleKey and descKey reference keys under "questTemplates.*" in locale files.
 */
const DAILY_TEMPLATES: Array<{
  titleKey: string;
  descKey: string;
  targetMin: number;
  xpReward: number;
  /** Whether the title template needs the activity name interpolated */
  needsActivity: boolean;
}> = [
  {
    titleKey: "questTemplates.session",
    descKey: "questTemplates.sessionDesc",
    targetMin: 30,
    xpReward: 25,
    needsActivity: true,
  },
  {
    titleKey: "questTemplates.extended",
    descKey: "questTemplates.extendedDesc",
    targetMin: 60,
    xpReward: 50,
    needsActivity: true,
  },
  {
    titleKey: "questTemplates.morningRitual",
    descKey: "questTemplates.morningRitualDesc",
    targetMin: 15,
    xpReward: 15,
    needsActivity: false,
  },
  {
    titleKey: "questTemplates.quick",
    descKey: "questTemplates.quickDesc",
    targetMin: 15,
    xpReward: 10,
    needsActivity: true,
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

    // Store the translation key and interpolation params as the title/description.
    // Format: "i18n:key:param1=val1:param2=val2" — resolved by QuestCard at render time.
    const titleParams = template.needsActivity
      ? `i18n:${template.titleKey}:activityType=${actType}`
      : `i18n:${template.titleKey}`;
    const descParams = `i18n:${template.descKey}:min=${template.targetMin}`;

    quests.push({
      id: `quest-${++questCounter}`,
      title: titleParams,
      description: descParams,
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
