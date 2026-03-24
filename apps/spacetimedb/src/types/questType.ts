import { t } from "spacetimedb/server";

export const QuestType = t.enum("QuestType", {
  Daily: t.unit(),
  Weekly: t.unit(),
  Custom: t.unit(),
});
