import { t } from "spacetimedb/server";

export const SpellElement = t.enum("SpellElement", {
  Fire: t.unit(),
  Ice: t.unit(),
  Lightning: t.unit(),
  Physical: t.unit(),
  Arcane: t.unit(),
  Heal: t.unit(),
});
