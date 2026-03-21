import { t } from "spacetimedb/server";

export const CombatStatus = t.enum("CombatStatus", {
  WaitingForPlayers: t.unit(),
  InProgress: t.unit(),
  Finished: t.unit(),
});
