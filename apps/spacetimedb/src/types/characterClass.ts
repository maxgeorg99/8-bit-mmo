import { t } from "spacetimedb/server";

export const CharacterClass = t.enum("CharacterClass", {
  Warrior: t.unit(),
  Mage: t.unit(),
  Rogue: t.unit(),
  Paladin: t.unit(),
  Druid: t.unit(),
  Ranger: t.unit(),
  Bard: t.unit(),
  Scholar: t.unit(),
  Unclassed: t.unit(),
});
