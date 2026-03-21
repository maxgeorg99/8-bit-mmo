import { table, t } from "spacetimedb/server";
import { CombatStatus } from "../types/combatStatus";

export const combat = table(
  { name: "combat", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    player1: t.identity(),
    player2: t.option(t.identity()),
    player1Hp: t.u32(),
    player2Hp: t.u32(),
    player1Mana: t.u32(),
    player2Mana: t.u32(),
    currentTurn: t.identity(),
    status: CombatStatus,
    winnerId: t.option(t.identity()),
  },
);
