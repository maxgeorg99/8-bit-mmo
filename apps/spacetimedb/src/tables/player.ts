import { table, t } from "spacetimedb/server";
import { CharacterClass } from "../types/characterClass";

export const player = table(
  { name: "player", public: true },
  {
    identity: t.identity().primaryKey(),
    name: t.string(),
    online: t.bool(),
    characterClass: t.option(CharacterClass),
    wins: t.u32(),
    losses: t.u32(),
  },
);
