import { describe, expect, it, vi, beforeEach } from "vite-plus/test";
import {
  PLAYER_SPELLS,
  getPlayerSpells,
  getMobSpells,
  calculateDamage,
  calculateHeal,
  aiSelectSpell,
  spellEmoji,
  pveMaxHp,
  pveMaxMana,
} from "../combatEngine";
import type { PveSpell } from "../combatEngine";
import type { Stats } from "../types";

// ── spellEmoji ──────────────────────────────────────────────────

describe("spellEmoji", () => {
  it("returns correct emoji for known elements", () => {
    expect(spellEmoji("Fire")).toBe("\uD83D\uDD25");
    expect(spellEmoji("Ice")).toBe("\u2744\uFE0F");
    expect(spellEmoji("Lightning")).toBe("\u26A1");
    expect(spellEmoji("Physical")).toBe("\u2694\uFE0F");
    expect(spellEmoji("Arcane")).toBe("\u2728");
    expect(spellEmoji("Heal")).toBe("\uD83D\uDC9A");
  });

  it("returns default emoji for unknown element", () => {
    expect(spellEmoji("Unknown")).toBe("\u2728");
    expect(spellEmoji("")).toBe("\u2728");
  });
});

// ── getPlayerSpells ─────────────────────────────────────────────

describe("getPlayerSpells", () => {
  const zeroStats: Stats = { STR: 0, AGI: 0, INT: 0, CON: 0, WIS: 0, CHA: 0, MP: 0 };

  it("gives fallback spells (Slash + Fireball + Heal) when stats are zero", () => {
    const spells = getPlayerSpells(zeroStats);
    expect(spells).toHaveLength(3);
    expect(spells[0].name).toBe("Slash");
    expect(spells[1].name).toBe("Fireball");
    expect(spells[2].name).toBe("Heal");
  });

  it("always includes Slash", () => {
    const spells = getPlayerSpells({ ...zeroStats, INT: 10, MP: 10, WIS: 5, CON: 5 });
    expect(spells[0].name).toBe("Slash");
  });

  it("unlocks Fireball at INT >= 2", () => {
    const spells = getPlayerSpells({ ...zeroStats, INT: 2 });
    expect(spells.some((s) => s.name === "Fireball")).toBe(true);
  });

  it("unlocks Fireball at MP >= 2", () => {
    const spells = getPlayerSpells({ ...zeroStats, MP: 2 });
    expect(spells.some((s) => s.name === "Fireball")).toBe(true);
  });

  it("unlocks Ice Shard at INT >= 3", () => {
    const spells = getPlayerSpells({ ...zeroStats, INT: 3, MP: 2 });
    expect(spells.some((s) => s.name === "Ice Shard")).toBe(true);
  });

  it("unlocks Ice Shard at WIS >= 3", () => {
    const spells = getPlayerSpells({ ...zeroStats, WIS: 3, MP: 2 });
    expect(spells.some((s) => s.name === "Ice Shard")).toBe(true);
  });

  it("unlocks Thunder at INT >= 6", () => {
    const spells = getPlayerSpells({ ...zeroStats, INT: 6, MP: 2 });
    expect(spells.some((s) => s.name === "Thunder")).toBe(true);
  });

  it("unlocks Arcane Bolt at INT >= 10 and MP >= 5", () => {
    const spells = getPlayerSpells({ ...zeroStats, INT: 10, MP: 5 });
    expect(spells.some((s) => s.name === "Arcane Bolt")).toBe(true);
  });

  it("does NOT unlock Arcane Bolt if only INT >= 10 (no MP)", () => {
    const spells = getPlayerSpells({ ...zeroStats, INT: 10, MP: 2 });
    expect(spells.some((s) => s.name === "Arcane Bolt")).toBe(false);
  });

  it("unlocks Heal at WIS >= 4", () => {
    const spells = getPlayerSpells({ ...zeroStats, WIS: 4, MP: 2 });
    expect(spells.some((s) => s.name === "Heal")).toBe(true);
  });

  it("unlocks Heal at CON >= 5", () => {
    const spells = getPlayerSpells({ ...zeroStats, CON: 5, MP: 2 });
    expect(spells.some((s) => s.name === "Heal")).toBe(true);
  });

  it("unlocks all spells with high stats", () => {
    const spells = getPlayerSpells({
      STR: 20,
      AGI: 20,
      INT: 20,
      CON: 20,
      WIS: 20,
      CHA: 20,
      MP: 20,
    });
    expect(spells).toHaveLength(6);
  });
});

// ── getMobSpells ────────────────────────────────────────────────

describe("getMobSpells", () => {
  it("returns 2 spells for low-mana mobs", () => {
    const spells = getMobSpells([5, 10], 20);
    expect(spells).toHaveLength(2);
    expect(spells[0].name).toBe("Attack");
    expect(spells[0].manaCost).toBe(0);
    expect(spells[1].name).toBe("Power Strike");
  });

  it("returns 3 spells for high-mana mobs (mana >= 40)", () => {
    const spells = getMobSpells([8, 14], 50);
    expect(spells).toHaveLength(3);
    expect(spells[2].name).toBe("Special Attack");
    expect(spells[2].element).toBe("Arcane");
  });

  it("Attack spell uses minimum damage", () => {
    const spells = getMobSpells([7, 15], 20);
    expect(spells[0].damage).toBe(7);
  });

  it("Power Strike uses maximum damage", () => {
    const spells = getMobSpells([7, 15], 20);
    expect(spells[1].damage).toBe(15);
  });

  it("Special Attack damage is avg * 1.3", () => {
    const spells = getMobSpells([10, 20], 50);
    const avg = Math.round((10 + 20) / 2);
    expect(spells[2].damage).toBe(Math.round(avg * 1.3));
  });

  it("Power Strike mana cost is 30% of mob mana", () => {
    const spells = getMobSpells([5, 10], 30);
    expect(spells[1].manaCost).toBe(Math.round(30 * 0.3));
  });
});

// ── calculateDamage ─────────────────────────────────────────────

describe("calculateDamage", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random");
  });

  it("returns at least 1 damage", () => {
    vi.mocked(Math.random).mockReturnValue(0);
    expect(calculateDamage(0)).toBe(1);
    expect(calculateDamage(1)).toBeGreaterThanOrEqual(1);
  });

  it("applies 80%-120% variance based on Math.random", () => {
    // Math.random() = 0 => variance = 0.8
    vi.mocked(Math.random).mockReturnValue(0);
    expect(calculateDamage(10)).toBe(8);

    // Math.random() = 0.5 => variance = 1.0
    vi.mocked(Math.random).mockReturnValue(0.5);
    expect(calculateDamage(10)).toBe(10);

    // Math.random() = 1 => variance = 1.2
    vi.mocked(Math.random).mockReturnValue(0.99999);
    expect(calculateDamage(10)).toBe(12);
  });

  it("rounds to integer", () => {
    vi.mocked(Math.random).mockReturnValue(0.25);
    const result = calculateDamage(10);
    expect(Number.isInteger(result)).toBe(true);
  });
});

// ── calculateHeal ───────────────────────────────────────────────

describe("calculateHeal", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random");
  });

  it("returns at least 1", () => {
    vi.mocked(Math.random).mockReturnValue(0);
    expect(calculateHeal(0)).toBe(1);
    expect(calculateHeal(1)).toBeGreaterThanOrEqual(1);
  });

  it("applies 90%-110% variance", () => {
    // Math.random() = 0 => variance = 0.9
    vi.mocked(Math.random).mockReturnValue(0);
    expect(calculateHeal(10)).toBe(9);

    // Math.random() = 0.5 => variance = 1.0
    vi.mocked(Math.random).mockReturnValue(0.5);
    expect(calculateHeal(10)).toBe(10);
  });
});

// ── aiSelectSpell ───────────────────────────────────────────────

describe("aiSelectSpell", () => {
  const mockSpells: PveSpell[] = [
    { id: "1", name: "Attack", element: "Physical", damage: 5, manaCost: 0 },
    { id: "2", name: "Power", element: "Fire", damage: 15, manaCost: 10 },
    { id: "3", name: "Ultimate", element: "Arcane", damage: 25, manaCost: 20 },
  ];

  it("picks the highest damage affordable spell", () => {
    const spell = aiSelectSpell(mockSpells, 25);
    expect(spell.name).toBe("Ultimate");
  });

  it("falls back to cheaper spell when mana is limited", () => {
    const spell = aiSelectSpell(mockSpells, 12);
    expect(spell.name).toBe("Power");
  });

  it("falls back to free attack when no mana", () => {
    const spell = aiSelectSpell(mockSpells, 0);
    expect(spell.name).toBe("Attack");
  });

  it("returns first spell if nothing is affordable (edge case)", () => {
    const expensiveSpells: PveSpell[] = [
      { id: "1", name: "Expensive", element: "Fire", damage: 100, manaCost: 99 },
    ];
    const spell = aiSelectSpell(expensiveSpells, 0);
    expect(spell.name).toBe("Expensive");
  });
});

// ── pveMaxHp ────────────────────────────────────────────────────

describe("pveMaxHp", () => {
  it("returns 50 base + level*5 + con*3 at level 1, con 0", () => {
    expect(pveMaxHp(1, 0)).toBe(55);
  });

  it("scales with level", () => {
    expect(pveMaxHp(10, 0)).toBe(100);
  });

  it("scales with CON", () => {
    expect(pveMaxHp(1, 10)).toBe(85); // 50 + 5 + 30
  });

  it("higher level and CON gives more HP", () => {
    expect(pveMaxHp(20, 20)).toBeGreaterThan(pveMaxHp(10, 10));
  });
});

// ── pveMaxMana ──────────────────────────────────────────────────

describe("pveMaxMana", () => {
  it("returns 30 base + level*3 + mp*2 + int at level 1", () => {
    expect(pveMaxMana(1, 0, 0)).toBe(33);
  });

  it("scales with level", () => {
    expect(pveMaxMana(10, 0, 0)).toBe(60); // 30 + 30
  });

  it("scales with MP", () => {
    expect(pveMaxMana(1, 10, 0)).toBe(53); // 30 + 3 + 20
  });

  it("scales with INT", () => {
    expect(pveMaxMana(1, 0, 10)).toBe(43); // 30 + 3 + 10
  });
});

// ── PLAYER_SPELLS consistency ───────────────────────────────────

describe("PLAYER_SPELLS", () => {
  it("has 6 spells defined", () => {
    expect(PLAYER_SPELLS).toHaveLength(6);
  });

  it("first spell (Slash) has 0 mana cost", () => {
    expect(PLAYER_SPELLS[0].manaCost).toBe(0);
  });

  it("Heal spell has isHeal flag", () => {
    const heal = PLAYER_SPELLS.find((s) => s.name === "Heal");
    expect(heal).toBeDefined();
    expect(heal!.isHeal).toBe(true);
  });

  it("all non-heal spells have no isHeal flag", () => {
    const nonHeals = PLAYER_SPELLS.filter((s) => s.name !== "Heal");
    for (const spell of nonHeals) {
      expect(spell.isHeal).toBeFalsy();
    }
  });
});
