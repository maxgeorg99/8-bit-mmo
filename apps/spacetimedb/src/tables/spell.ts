import { table, t } from "spacetimedb/server";
import { SpellElement } from "../types/spellElement";

export const spell = table(
  { name: "spell", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    name: t.string(),
    element: SpellElement,
    damage: t.u32(),
    manaCost: t.u32(),
  },
);
