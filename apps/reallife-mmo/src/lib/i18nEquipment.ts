import type { TFunction } from "i18next";

/**
 * Resolve a translated equipment name using the item's ID.
 * Falls back to the raw `name` field if no translation key exists.
 */
export function getEquipmentName(t: TFunction, itemId: string, fallbackName: string): string {
  const key = `equipment.${itemId}.name`;
  const translated = t(key, { defaultValue: "" });
  return translated || fallbackName;
}

/**
 * Format stat bonuses using translated stat abbreviations.
 * e.g. { STR: 2, INT: 1 } → "+2 筋力  +1 知力" (in Japanese)
 */
export function formatStatBonuses(
  t: TFunction,
  statBonus: Record<string, number>,
  separator = "  ",
): string {
  return Object.entries(statBonus)
    .filter(([, v]) => v !== 0)
    .map(([stat, value]) => {
      const translatedStat = t(`stats.${stat}`, { defaultValue: stat });
      return t("stats.statBonus", { value, stat: translatedStat });
    })
    .join(separator);
}

/**
 * Get the translated merchant name for a biome.
 */
export function getMerchantName(t: TFunction, biomeId: string): string {
  return t(`merchants.${biomeId}.name`);
}

/**
 * Get the translated merchant greeting for a biome.
 */
export function getMerchantGreeting(t: TFunction, biomeId: string): string {
  return t(`merchants.${biomeId}.greeting`);
}
