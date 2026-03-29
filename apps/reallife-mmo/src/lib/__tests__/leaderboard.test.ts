/**
 * Tests for leaderboard data transformations (Phase 4.3).
 *
 * The leaderboard page transforms SpacetimeDB player rows + guild data
 * into ranked entries. We replicate the transformation logic here.
 */
import { describe, expect, it } from "vite-plus/test";

// ── Replicated types ───────────────────────────────────────────

interface LeaderboardEntry {
  name: string;
  level: number;
  playerClass: string;
  value: number;
  isPlayer: boolean;
  guildName?: string;
  online?: boolean;
}

interface LeaderboardRow {
  identity: string;
  name: string;
  level: number;
  characterClass: { tag: string };
  online: boolean;
  strength: number;
  agility: number;
  intelligence: number;
  constitution: number;
  wisdom: number;
  charisma: number;
  mana: number;
}

interface GuildRow {
  id: bigint;
  name: string;
}

interface GuildMemberRow {
  guildId: bigint;
  playerId: string; // hex
}

interface NpcEntry {
  name: string;
  level: number;
  playerClass: string;
  stats: Record<string, number>;
  guildName?: string;
}

type StatName = "STR" | "AGI" | "INT" | "CON" | "WIS" | "CHA";

const STAT_KEYS: Record<StatName, keyof LeaderboardRow> = {
  STR: "strength",
  AGI: "agility",
  INT: "intelligence",
  CON: "constitution",
  WIS: "wisdom",
  CHA: "charisma",
};

// ── Replicated transformation logic from leaderboard.tsx ───────

function buildGuildNameByPlayer(
  guilds: GuildRow[],
  guildMembers: GuildMemberRow[],
): Map<string, string> {
  const guildMap = new Map<bigint, string>();
  for (const g of guilds) {
    guildMap.set(g.id, g.name);
  }
  const playerGuild = new Map<string, string>();
  for (const m of guildMembers) {
    const gName = guildMap.get(m.guildId);
    if (gName) {
      playerGuild.set(m.playerId, gName);
    }
  }
  return playerGuild;
}

function buildLevelBoard(
  rows: LeaderboardRow[],
  npcs: NpcEntry[],
  myHex: string,
  guildNameByPlayer: Map<string, string>,
): LeaderboardEntry[] {
  const realPlayers: LeaderboardEntry[] = rows.map((row) => ({
    name: row.name || "Anonymous",
    level: row.level,
    playerClass: row.characterClass.tag ?? "Unclassed",
    value: row.level,
    isPlayer: row.identity === myHex,
    guildName: guildNameByPlayer.get(row.identity),
    online: row.online,
  }));

  // Only add NPCs if we have fewer than 10 real players
  const npcEntries: LeaderboardEntry[] =
    realPlayers.length < 10
      ? npcs.map((npc) => ({
          name: npc.name,
          level: npc.level,
          playerClass: npc.playerClass,
          value: npc.level,
          isPlayer: false,
          guildName: npc.guildName,
        }))
      : [];

  return [...realPlayers, ...npcEntries].sort((a, b) => b.value - a.value);
}

function buildStatBoard(
  rows: LeaderboardRow[],
  npcs: NpcEntry[],
  statTab: StatName,
  myHex: string,
  guildNameByPlayer: Map<string, string>,
): LeaderboardEntry[] {
  const statKey = STAT_KEYS[statTab];

  const realPlayers: LeaderboardEntry[] = rows.map((row) => ({
    name: row.name || "Anonymous",
    level: row.level,
    playerClass: row.characterClass.tag ?? "Unclassed",
    value: Math.round(((row[statKey] as number) ?? 0) * 10) / 10,
    isPlayer: row.identity === myHex,
    guildName: guildNameByPlayer.get(row.identity),
    online: row.online,
  }));

  const npcEntries: LeaderboardEntry[] =
    realPlayers.length < 10
      ? npcs.map((npc) => ({
          name: npc.name,
          level: npc.level,
          playerClass: npc.playerClass,
          value: Math.round((npc.stats[statTab] ?? 0) * 10) / 10,
          isPlayer: false,
          guildName: npc.guildName,
        }))
      : [];

  return [...realPlayers, ...npcEntries].sort((a, b) => b.value - a.value);
}

// ── Test Data ──────────────────────────────────────────────────

const ROWS: LeaderboardRow[] = [
  {
    identity: "player1-hex",
    name: "Alice",
    level: 15,
    characterClass: { tag: "Mage" },
    online: true,
    strength: 5.2,
    agility: 8.7,
    intelligence: 25.1,
    constitution: 10.0,
    wisdom: 18.4,
    charisma: 12.0,
    mana: 30.0,
  },
  {
    identity: "player2-hex",
    name: "Bob",
    level: 20,
    characterClass: { tag: "Warrior" },
    online: false,
    strength: 28.9,
    agility: 10.3,
    intelligence: 4.0,
    constitution: 22.5,
    wisdom: 3.0,
    charisma: 6.0,
    mana: 8.0,
  },
  {
    identity: "player3-hex",
    name: "",
    level: 5,
    characterClass: { tag: "Unclassed" },
    online: true,
    strength: 2.0,
    agility: 2.0,
    intelligence: 2.0,
    constitution: 2.0,
    wisdom: 2.0,
    charisma: 2.0,
    mana: 2.0,
  },
];

const NPCS: NpcEntry[] = [
  {
    name: "Grimjaw",
    level: 18,
    playerClass: "Warrior",
    stats: { STR: 28, AGI: 8, INT: 4, CON: 22, WIS: 5, CHA: 3 },
    guildName: "Iron Legion",
  },
  {
    name: "Elara",
    level: 22,
    playerClass: "Mage",
    stats: { STR: 5, AGI: 10, INT: 30, CON: 8, WIS: 25, CHA: 15 },
  },
];

const GUILDS: GuildRow[] = [
  { id: 1n, name: "Iron Legion" },
  { id: 2n, name: "Shadow Blades" },
];

const GUILD_MEMBERS: GuildMemberRow[] = [
  { guildId: 1n, playerId: "player2-hex" },
  { guildId: 2n, playerId: "player1-hex" },
];

// ── Tests ──────────────────────────────────────────────────────

describe("buildGuildNameByPlayer", () => {
  it("maps player identity to guild name", () => {
    const result = buildGuildNameByPlayer(GUILDS, GUILD_MEMBERS);

    expect(result.get("player2-hex")).toBe("Iron Legion");
    expect(result.get("player1-hex")).toBe("Shadow Blades");
  });

  it("returns empty map when no guilds", () => {
    const result = buildGuildNameByPlayer([], []);
    expect(result.size).toBe(0);
  });

  it("ignores guild members with non-existent guild", () => {
    const members: GuildMemberRow[] = [{ guildId: 999n, playerId: "player1-hex" }];
    const result = buildGuildNameByPlayer(GUILDS, members);
    expect(result.has("player1-hex")).toBe(false);
  });
});

describe("buildLevelBoard", () => {
  const guildMap = buildGuildNameByPlayer(GUILDS, GUILD_MEMBERS);

  it("sorts by level descending", () => {
    const board = buildLevelBoard(ROWS, NPCS, "player1-hex", guildMap);

    // Elara (22), Bob (20), Grimjaw (18), Alice (15), Anonymous (5)
    expect(board[0]!.name).toBe("Elara");
    expect(board[1]!.name).toBe("Bob");
    expect(board[2]!.name).toBe("Grimjaw");
    expect(board[3]!.name).toBe("Alice");
    expect(board[4]!.name).toBe("Anonymous");
  });

  it("marks current player correctly", () => {
    const board = buildLevelBoard(ROWS, NPCS, "player1-hex", guildMap);
    const alice = board.find((e) => e.name === "Alice");
    const bob = board.find((e) => e.name === "Bob");

    expect(alice!.isPlayer).toBe(true);
    expect(bob!.isPlayer).toBe(false);
  });

  it("resolves guild names for real players", () => {
    const board = buildLevelBoard(ROWS, NPCS, "player1-hex", guildMap);
    const bob = board.find((e) => e.name === "Bob");
    const alice = board.find((e) => e.name === "Alice");

    expect(bob!.guildName).toBe("Iron Legion");
    expect(alice!.guildName).toBe("Shadow Blades");
  });

  it("includes online status for real players", () => {
    const board = buildLevelBoard(ROWS, NPCS, "player1-hex", guildMap);
    const alice = board.find((e) => e.name === "Alice");
    const bob = board.find((e) => e.name === "Bob");

    expect(alice!.online).toBe(true);
    expect(bob!.online).toBe(false);
  });

  it("displays 'Anonymous' for players with empty name", () => {
    const board = buildLevelBoard(ROWS, NPCS, "player1-hex", guildMap);
    const anon = board.find((e) => e.name === "Anonymous");
    expect(anon).toBeDefined();
    expect(anon!.level).toBe(5);
  });

  it("excludes NPCs when 10+ real players exist", () => {
    // Create 10 real players
    const manyPlayers: LeaderboardRow[] = Array.from({ length: 10 }, (_, i) => ({
      identity: `player${i}-hex`,
      name: `Player${i}`,
      level: 10 + i,
      characterClass: { tag: "Warrior" },
      online: true,
      strength: 10,
      agility: 10,
      intelligence: 10,
      constitution: 10,
      wisdom: 10,
      charisma: 10,
      mana: 10,
    }));

    const board = buildLevelBoard(manyPlayers, NPCS, "player0-hex", guildMap);

    // Should have exactly 10 entries (no NPCs)
    expect(board).toHaveLength(10);
    expect(board.every((e) => !e.name.startsWith("Grim") && !e.name.startsWith("Ela"))).toBe(true);
  });

  it("includes NPCs when fewer than 10 real players", () => {
    const board = buildLevelBoard(ROWS, NPCS, "player1-hex", guildMap);

    // 3 real + 2 NPC = 5
    expect(board).toHaveLength(5);
    expect(board.some((e) => e.name === "Grimjaw")).toBe(true);
  });
});

describe("buildStatBoard", () => {
  const guildMap = buildGuildNameByPlayer(GUILDS, GUILD_MEMBERS);

  it("sorts by STR descending", () => {
    const board = buildStatBoard(ROWS, NPCS, "STR", "player1-hex", guildMap);

    expect(board[0]!.name).toBe("Bob");
    expect(board[0]!.value).toBeCloseTo(28.9);
    expect(board[1]!.name).toBe("Grimjaw");
    expect(board[1]!.value).toBe(28);
  });

  it("sorts by INT descending", () => {
    const board = buildStatBoard(ROWS, NPCS, "INT", "player1-hex", guildMap);

    expect(board[0]!.name).toBe("Elara");
    expect(board[0]!.value).toBe(30);
    expect(board[1]!.name).toBe("Alice");
    expect(board[1]!.value).toBeCloseTo(25.1);
  });

  it("rounds stat values to one decimal place", () => {
    const board = buildStatBoard(ROWS, NPCS, "AGI", "player1-hex", guildMap);
    const bob = board.find((e) => e.name === "Bob");
    expect(bob!.value).toBe(10.3);
  });

  it("handles zero stats", () => {
    const emptyRows: LeaderboardRow[] = [
      {
        identity: "empty-hex",
        name: "Newbie",
        level: 1,
        characterClass: { tag: "Unclassed" },
        online: false,
        strength: 0,
        agility: 0,
        intelligence: 0,
        constitution: 0,
        wisdom: 0,
        charisma: 0,
        mana: 0,
      },
    ];

    const board = buildStatBoard(emptyRows, [], "STR", "empty-hex", new Map());
    expect(board[0]!.value).toBe(0);
  });
});
