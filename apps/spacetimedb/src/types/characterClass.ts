import { t } from "spacetimedb/server";

export const CharacterClass = t.enum("CharacterClass", {
  Mage: t.unit(),
  OrcWarrior: t.unit(),
});
