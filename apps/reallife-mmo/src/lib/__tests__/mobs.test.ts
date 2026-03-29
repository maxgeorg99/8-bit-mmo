import { describe, expect, it, vi, beforeEach, afterEach } from "vite-plus/test";
import { BIOME_MOBS, BIOME_TIER, getRandomMob, rollLoot } from "../mobs";
import type { BiomeId } from "../biomeThemes";

// ── BIOME_MOBS structure ────────────────────────────────────────

describe("BIOME_MOBS", () => {
  const allBiomes: BiomeId[] = [
    "plains",
    "forest",
    "tundra",
    "desert",
    "dungeon",
    "volcano",
    "spire",
    "ruins",
    "celestial",
  ];

  it("has mobs defined for all 9 biomes", () => {
    for (const biome of allBiomes) {
      expect(BIOME_MOBS[biome]).toBeDefined();
      expect(BIOME_MOBS[biome].length).toBeGreaterThan(0);
    }
  });

  it("each biome has exactly 3 mobs", () => {
    for (const biome of allBiomes) {
      expect(BIOME_MOBS[biome]).toHaveLength(3);
    }
  });

  it("all mobs have required properties", () => {
    for (const biome of allBiomes) {
      for (const mob of BIOME_MOBS[biome]) {
        expect(mob.id).toBeTruthy();
        expect(mob.name).toBeTruthy();
        expect(mob.sprite).toBeTruthy();
        expect(mob.hp).toBeGreaterThan(0);
        expect(mob.mana).toBeGreaterThanOrEqual(0);
        expect(mob.damage[0]).toBeGreaterThan(0);
        expect(mob.damage[1]).toBeGreaterThanOrEqual(mob.damage[0]);
        expect(mob.xpReward).toBeGreaterThan(0);
        expect(mob.lootTable).toBeDefined();
        expect(mob.lootTable.length).toBeGreaterThan(0);
      }
    }
  });

  it("mob IDs are unique across all biomes", () => {
    const ids = new Set<string>();
    for (const biome of allBiomes) {
      for (const mob of BIOME_MOBS[biome]) {
        expect(ids.has(mob.id)).toBe(false);
        ids.add(mob.id);
      }
    }
  });

  it("difficulty scales with biome tier", () => {
    const plainsMobs = BIOME_MOBS.plains;
    const celestialMobs = BIOME_MOBS.celestial;

    const plainsAvgHp = plainsMobs.reduce((s, m) => s + m.hp, 0) / plainsMobs.length;
    const celestialAvgHp = celestialMobs.reduce((s, m) => s + m.hp, 0) / celestialMobs.length;
    expect(celestialAvgHp).toBeGreaterThan(plainsAvgHp);

    const plainsAvgXp = plainsMobs.reduce((s, m) => s + m.xpReward, 0) / plainsMobs.length;
    const celestialAvgXp = celestialMobs.reduce((s, m) => s + m.xpReward, 0) / celestialMobs.length;
    expect(celestialAvgXp).toBeGreaterThan(plainsAvgXp);
  });

  it("loot items have valid drop chances between 0 and 1", () => {
    for (const biome of allBiomes) {
      for (const mob of BIOME_MOBS[biome]) {
        for (const loot of mob.lootTable) {
          expect(loot.chance).toBeGreaterThan(0);
          expect(loot.chance).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("loot rarity scales with biome tier", () => {
    const rarityOrder = ["common", "uncommon", "rare", "epic", "legendary"];
    const plainsRarity = BIOME_MOBS.plains[0].lootTable[0].item.rarity;
    const celestialRarity = BIOME_MOBS.celestial[0].lootTable[0].item.rarity;
    expect(rarityOrder.indexOf(celestialRarity)).toBeGreaterThan(rarityOrder.indexOf(plainsRarity));
  });
});

// ── BIOME_TIER ──────────────────────────────────────────────────

describe("BIOME_TIER", () => {
  it("plains is tier 1 (easiest)", () => {
    expect(BIOME_TIER.plains).toBe(1);
  });

  it("celestial is tier 6 (hardest)", () => {
    expect(BIOME_TIER.celestial).toBe(6);
  });

  it("has 9 biomes", () => {
    expect(Object.keys(BIOME_TIER)).toHaveLength(9);
  });
});

// ── getRandomMob ────────────────────────────────────────────────

describe("getRandomMob", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random");
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a mob from the specified biome", () => {
    vi.mocked(Math.random).mockReturnValue(0);
    const mob = getRandomMob("plains");
    expect(BIOME_MOBS.plains.some((m) => m.id === mob.id)).toBe(true);
  });

  it("returns first mob when random is 0", () => {
    vi.mocked(Math.random).mockReturnValue(0);
    const mob = getRandomMob("plains");
    expect(mob.id).toBe(BIOME_MOBS.plains[0].id);
  });

  it("returns different mobs for different biomes", () => {
    vi.mocked(Math.random).mockReturnValue(0);
    const plainsMob = getRandomMob("plains");
    const celestialMob = getRandomMob("celestial");
    expect(plainsMob.id).not.toBe(celestialMob.id);
  });
});

// ── rollLoot ────────────────────────────────────────────────────

describe("rollLoot", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random");
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("drops loot when random roll is below chance", () => {
    vi.mocked(Math.random).mockReturnValueOnce(0.01); // below any drop chance
    const mob = BIOME_MOBS.plains[0]; // slime, 20% chance
    const drops = rollLoot(mob);
    expect(drops).toHaveLength(1);
    expect(drops[0].name).toBe(mob.lootTable[0].item.name);
  });

  it("does not drop loot when random roll is above chance", () => {
    vi.mocked(Math.random).mockReturnValueOnce(0.99); // above any drop chance
    const mob = BIOME_MOBS.plains[0];
    const drops = rollLoot(mob);
    expect(drops).toHaveLength(0);
  });

  it("generates unique IDs for dropped items", () => {
    vi.mocked(Math.random)
      .mockReturnValueOnce(0.01) // first roll succeeds
      .mockReturnValue(0.5); // for ID generation
    const mob = BIOME_MOBS.plains[0];
    const drops = rollLoot(mob);
    expect(drops[0].id).not.toBe(mob.lootTable[0].item.id);
    expect(drops[0].id).toContain(mob.lootTable[0].item.id);
  });

  it("returns empty array for mob with no successful rolls", () => {
    vi.mocked(Math.random).mockReturnValue(0.99);
    const mob = BIOME_MOBS.celestial[0]; // 5% chance
    const drops = rollLoot(mob);
    expect(drops).toHaveLength(0);
  });
});
