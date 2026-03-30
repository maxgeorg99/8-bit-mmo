import type { ActivityType } from "./types";
import { ACTIVITY_TYPES } from "./types";

/**
 * Map from English activity labels (as used by the server) to ActivityType enum values.
 * This lets us match server-generated quest titles back to translatable keys.
 */
const ENGLISH_ACTIVITY_NAMES: Record<string, ActivityType> = {
  "strength training": "StrengthTraining",
  cardio: "Cardio",
  hiit: "Hiit",
  "study / learning": "MindLearning",
  "healthy eating": "Nutrition",
  hydration: "Hydration",
  sleep: "Sleep",
  mindfulness: "Mindfulness",
  creativity: "Creativity",
  "social / going out": "Social",
  // Also handle short forms the server may use
  social: "Social",
};

/**
 * Patterns that match server-generated quest titles to i18n template keys.
 * Order matters: more specific patterns first.
 */
const TITLE_PATTERNS: Array<{
  regex: RegExp;
  templateKey: string;
}> = [
  { regex: /^Extended\s+(.+)$/i, templateKey: "questTemplates.extended" },
  { regex: /^Quick\s+(.+)$/i, templateKey: "questTemplates.quick" },
  { regex: /^(.+)\s+Session$/i, templateKey: "questTemplates.session" },
  { regex: /^Morning Ritual$/i, templateKey: "questTemplates.morningRitual" },
];

/**
 * Patterns that match server-generated quest descriptions to i18n template keys.
 */
const DESC_PATTERNS: Array<{
  regex: RegExp;
  templateKey: string;
  extractMin: (m: RegExpMatchArray) => string;
}> = [
  {
    regex: /^Push yourself with a (\d+)-minute session$/i,
    templateKey: "questTemplates.extendedDesc",
    extractMin: (m) => m[1],
  },
  {
    regex: /^Complete (\d+) minutes of activity$/i,
    templateKey: "questTemplates.sessionDesc",
    extractMin: (m) => m[1],
  },
  {
    regex: /^Log any activity before noon$/i,
    templateKey: "questTemplates.morningRitualDesc",
    extractMin: () => "15",
  },
  {
    regex: /^A short (\d+)-minute burst to stay on track$/i,
    templateKey: "questTemplates.quickDesc",
    extractMin: (m) => m[1],
  },
];

/**
 * Try to find an ActivityType from an English activity name (case-insensitive).
 */
function findActivityType(name: string): ActivityType | null {
  const lower = name.toLowerCase().trim();
  if (lower in ENGLISH_ACTIVITY_NAMES) return ENGLISH_ACTIVITY_NAMES[lower];
  // Also try matching against the enum values directly (e.g. "Mindfulness")
  for (const at of ACTIVITY_TYPES) {
    if (at.toLowerCase() === lower) return at;
  }
  return null;
}

/**
 * Resolve a quest string that may contain:
 * 1. An i18n key prefixed with "i18n:" (from client-side quest generator)
 * 2. A plain English string from SpacetimeDB that matches known patterns
 * 3. A custom/user-entered string (returned as-is)
 *
 * Format for i18n: "i18n:key:param1=val1:param2=val2"
 */
export function resolveQuestString(
  str: string,
  t: (key: string, params?: Record<string, string>) => string,
): string {
  // Case 1: i18n-prefixed string from client-side quest generator
  if (str.startsWith("i18n:")) {
    const keyAndParams = str.slice(5);
    const segments = keyAndParams.split(":");
    const key = segments[0];
    const params: Record<string, string> = {};
    for (let i = 1; i < segments.length; i++) {
      const eqIdx = segments[i].indexOf("=");
      if (eqIdx > 0) {
        const paramKey = segments[i].slice(0, eqIdx);
        const paramVal = segments[i].slice(eqIdx + 1);
        if (paramKey === "activityType") {
          params["activity"] = t(`activityTypes.${paramVal}`);
        } else {
          params[paramKey] = paramVal;
        }
      }
    }
    return t(key, params);
  }

  // Case 2: Try to match plain English server strings against title patterns
  for (const pattern of TITLE_PATTERNS) {
    const match = str.match(pattern.regex);
    if (match) {
      if (pattern.templateKey === "questTemplates.morningRitual") {
        return t(pattern.templateKey);
      }
      const activityName = match[1];
      const actType = findActivityType(activityName);
      if (actType) {
        return t(pattern.templateKey, { activity: t(`activityTypes.${actType}`) });
      }
    }
  }

  // Case 3: Try to match plain English server strings against description patterns
  for (const pattern of DESC_PATTERNS) {
    const match = str.match(pattern.regex);
    if (match) {
      return t(pattern.templateKey, { min: pattern.extractMin(match) });
    }
  }

  // Case 4: Custom quest or unrecognized string — return as-is
  return str;
}
