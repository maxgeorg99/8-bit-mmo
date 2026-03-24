import { t } from "spacetimedb/server";

export const RaidPhase = t.enum("RaidPhase", {
  Lobby: t.unit(),
  Fighting: t.unit(),
  Victory: t.unit(),
  Defeat: t.unit(),
});
