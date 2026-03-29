import { table, t } from "spacetimedb/server";

export const pveCombat = table(
  { name: "pve_combat", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    playerId: t.identity().index("btree"),
    mobId: t.string(),
    mobName: t.string(),
    biomeId: t.string(),

    // Player combat stats
    playerHp: t.u32(),
    playerMaxHp: t.u32(),
    playerMana: t.u32(),
    playerMaxMana: t.u32(),

    // Mob combat stats
    mobHp: t.u32(),
    mobMaxHp: t.u32(),
    mobMana: t.u32(),
    mobDamageMin: t.u32(),
    mobDamageMax: t.u32(),

    // Turn tracking
    isPlayerTurn: t.bool(),
    finished: t.bool(),
    playerWon: t.bool(),

    // Timestamps
    startedAt: t.timestamp(),
  },
);
