import type { TFunction } from "i18next";
import type { BossAbility, RaidBoss } from "./bossDefinitions";
import { RAID_BOSSES } from "./bossDefinitions";

/**
 * Resolve a translated boss name using the boss's ID.
 * Falls back to the raw `name` field if no translation key exists.
 */
export function getBossName(t: TFunction, boss: RaidBoss): string {
  const key = `bosses.${boss.id}.name`;
  const translated = t(key, { defaultValue: "" });
  return translated || boss.name;
}

/**
 * Resolve a translated boss intro text.
 */
export function getBossIntro(t: TFunction, boss: RaidBoss): string {
  const key = `bosses.${boss.id}.intro`;
  const translated = t(key, { defaultValue: "" });
  return translated || boss.intro;
}

/**
 * Resolve a translated boss mechanic description.
 */
export function getBossMechanic(t: TFunction, boss: RaidBoss): string {
  const key = `bosses.${boss.id}.mechanic`;
  const translated = t(key, { defaultValue: "" });
  return translated || boss.mechanic;
}

/**
 * Resolve a translated ability name.
 */
export function getAbilityName(t: TFunction, ability: BossAbility): string {
  const key = `bossAbilities.${ability.id}.name`;
  const translated = t(key, { defaultValue: "" });
  return translated || ability.name;
}

/**
 * Resolve a translated ability effect description.
 * Returns undefined if the ability has no effect.
 */
export function getAbilityEffect(t: TFunction, ability: BossAbility): string | undefined {
  if (!ability.effect) return undefined;
  const key = `bossAbilities.${ability.id}.effect`;
  const translated = t(key, { defaultValue: "" });
  return translated || ability.effect;
}

// ── Combat log lookup maps ─────────────────────────────────────
// The server stores English names. These maps let the client translate them.

const SPELL_KEY_MAP: Record<string, string> = {};
const BOSS_NAME_KEY_MAP: Record<string, string> = {};

for (const boss of Object.values(RAID_BOSSES)) {
  BOSS_NAME_KEY_MAP[boss.name] = `bosses.${boss.id}.name`;
  for (const ability of boss.abilities) {
    SPELL_KEY_MAP[ability.name] = `bossAbilities.${ability.id}.name`;
  }
}
// Player raid spells
SPELL_KEY_MAP["Slash"] = "raid.spells.slash";
SPELL_KEY_MAP["Fireball"] = "raid.spells.fireball";
SPELL_KEY_MAP["Heal"] = "raid.spells.heal";
SPELL_KEY_MAP["Arcane Bolt"] = "raid.spells.arcaneBolt";

/**
 * Translate a raw spell name from the server combat log.
 */
export function getLogSpellName(t: TFunction, rawName: string): string {
  const key = SPELL_KEY_MAP[rawName];
  if (!key) return rawName;
  const translated = t(key, { defaultValue: "" });
  return translated || rawName;
}

/**
 * Translate a raw combatant name from the server combat log.
 * Player names pass through unchanged; boss names get translated.
 */
export function getLogCombatantName(t: TFunction, rawName: string): string {
  const key = BOSS_NAME_KEY_MAP[rawName];
  if (!key) return rawName;
  const translated = t(key, { defaultValue: "" });
  return translated || rawName;
}
