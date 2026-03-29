import { table, t } from "spacetimedb/server";

export const mob = table(
  { name: "mob", public: true },
  {
    id: t.string().primaryKey(),
    biomeId: t.string().index("btree"),
    name: t.string(),
    sprite: t.string(),
    hp: t.u32(),
    mana: t.u32(),
    damageMin: t.u32(),
    damageMax: t.u32(),
    xpReward: t.u32(),
    tier: t.u32(),
  },
);
