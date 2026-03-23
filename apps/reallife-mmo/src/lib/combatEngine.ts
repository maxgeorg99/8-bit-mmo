import type { Stats } from "./types";

// ── Spell Definitions ───────────────────────────────────────────

export interface PveSpell {
  id: string;
  name: string;
  element: "Fire" | "Ice" | "Lightning" | "Physical" | "Arcane" | "Heal";
  damage: number;
  manaCost: number;
  /** If element is "Heal", this heals instead of dealing damage */
  isHeal?: boolean;
}

const ELEMENT_EMOJI: Record<string, string> = {
  Fire: "🔥",
  Ice: "❄️",
  Lightning: "⚡",
  Physical: "⚔️",
  Arcane: "✨",
  Heal: "💚",
};

export function spellEmoji(element: string): string {
  return ELEMENT_EMOJI[element] ?? "✨";
}

/**
 * Player spells — available based on player stats.
 * More spells unlock as stats grow.
 */
export const PLAYER_SPELLS: PveSpell[] = [
  { id: "slash", name: "Slash", element: "Physical", damage: 8, manaCost: 0 },
  { id: "fireball", name: "Fireball", element: "Fire", damage: 15, manaCost: 12 },
  { id: "ice-shard", name: "Ice Shard", element: "Ice", damage: 13, manaCost: 10 },
  { id: "thunder", name: "Thunder", element: "Lightning", damage: 18, manaCost: 16 },
  { id: "arcane-bolt", name: "Arcane Bolt", element: "Arcane", damage: 20, manaCost: 20 },
  { id: "heal", name: "Heal", element: "Heal", damage: 15, manaCost: 14, isHeal: true },
];

/**
 * Get available spells for the player based on their stats.
 * Higher INT/MP unlock more spells.
 */
export function getPlayerSpells(stats: Stats): PveSpell[] {
  const spells: PveSpell[] = [PLAYER_SPELLS[0]]; // Slash always available
  if (stats.INT >= 2 || stats.MP >= 2) spells.push(PLAYER_SPELLS[1]); // Fireball
  if (stats.INT >= 3 || stats.WIS >= 3) spells.push(PLAYER_SPELLS[2]); // Ice Shard
  if (stats.INT >= 6) spells.push(PLAYER_SPELLS[3]); // Thunder
  if (stats.INT >= 10 && stats.MP >= 5) spells.push(PLAYER_SPELLS[4]); // Arcane Bolt
  if (stats.WIS >= 4 || stats.CON >= 5) spells.push(PLAYER_SPELLS[5]); // Heal

  // If player has no stats, give them all basic spells so combat is fun
  if (spells.length <= 1) {
    return [PLAYER_SPELLS[0], PLAYER_SPELLS[1], PLAYER_SPELLS[5]];
  }

  return spells;
}

// ── Mob Spells ──────────────────────────────────────────────────

/** Mob attack spells — generated from mob damage range */
export function getMobSpells(mobDamage: [number, number], mobMana: number): PveSpell[] {
  const [minDmg, maxDmg] = mobDamage;
  const avgDmg = Math.round((minDmg + maxDmg) / 2);

  const spells: PveSpell[] = [
    // Free basic attack
    { id: "mob-attack", name: "Attack", element: "Physical", damage: minDmg, manaCost: 0 },
    // Stronger ability that costs mana
    {
      id: "mob-ability",
      name: "Power Strike",
      element: "Fire",
      damage: maxDmg,
      manaCost: Math.round(mobMana * 0.3),
    },
  ];

  // Mobs with high mana get a third spell
  if (mobMana >= 40) {
    spells.push({
      id: "mob-special",
      name: "Special Attack",
      element: "Arcane",
      damage: Math.round(avgDmg * 1.3),
      manaCost: Math.round(mobMana * 0.5),
    });
  }

  return spells;
}

// ── Damage Calculation ──────────────────────────────────────────

/** Calculate actual damage with some variance */
export function calculateDamage(baseDamage: number): number {
  // ±20% variance
  const variance = 0.8 + Math.random() * 0.4;
  return Math.max(1, Math.round(baseDamage * variance));
}

/** Calculate heal amount with some variance */
export function calculateHeal(baseHeal: number): number {
  const variance = 0.9 + Math.random() * 0.2;
  return Math.max(1, Math.round(baseHeal * variance));
}

// ── AI Spell Selection ──────────────────────────────────────────

/**
 * Simple priority-based AI: pick the highest damage affordable spell.
 * Falls back to the free attack if no mana.
 */
export function aiSelectSpell(spells: PveSpell[], currentMana: number): PveSpell {
  const affordable = spells.filter((s) => s.manaCost <= currentMana);
  if (affordable.length === 0) return spells[0]; // should always have free attack

  // Sort by damage desc, pick the strongest
  affordable.sort((a, b) => b.damage - a.damage);
  return affordable[0];
}

// ── Combat Log Entry ────────────────────────────────────────────

export interface PveCombatLogEntry {
  id: number;
  caster: "player" | "mob";
  spellName: string;
  element: string;
  damage: number;
  isHeal: boolean;
}

// ── Player Max HP/Mana for PvE ──────────────────────────────────

export function pveMaxHp(level: number, con: number): number {
  return 50 + level * 5 + Math.round(con * 3);
}

export function pveMaxMana(level: number, mp: number, int: number): number {
  return 30 + level * 3 + Math.round(mp * 2) + Math.round(int);
}
