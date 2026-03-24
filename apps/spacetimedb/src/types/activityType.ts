import { t } from "spacetimedb/server";

export const ActivityType = t.enum("ActivityType", {
  StrengthTraining: t.unit(),
  Cardio: t.unit(),
  Hiit: t.unit(),
  MindLearning: t.unit(),
  Nutrition: t.unit(),
  Hydration: t.unit(),
  Sleep: t.unit(),
  Mindfulness: t.unit(),
  Creativity: t.unit(),
  Social: t.unit(),
});
