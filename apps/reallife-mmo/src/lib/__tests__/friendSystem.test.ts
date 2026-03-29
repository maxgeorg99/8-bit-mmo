/**
 * Tests for the friend system logic (Phase 4.3).
 *
 * The friend system includes server-side reducers and a client-side hook.
 * We replicate the core transformation and validation logic here for testing
 * since the actual code depends on SpacetimeDB runtime.
 */
import { describe, expect, it } from "vite-plus/test";
import type { PlayerClass, Stats } from "../types";

// ── Replicated types ───────────────────────────────────────────

interface FriendshipRow {
  id: bigint;
  senderId: string; // hex identity
  receiverId: string;
  status: { tag: "Pending" | "Accepted" };
}

interface PlayerRow {
  identity: string; // hex
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
  currentBiome: string;
}

interface FriendDisplay {
  friendshipId: bigint;
  identity: string;
  name: string;
  level: number;
  playerClass: PlayerClass;
  online: boolean;
  stats: Stats;
  currentBiome: string;
  isSender: boolean;
  status: "Pending" | "Accepted";
}

// ── Replicated transformation logic from useFriends.ts ─────────

function processFriendRows(
  friendRows: FriendshipRow[],
  allPlayers: PlayerRow[],
  myHex: string,
): {
  friends: FriendDisplay[];
  incomingRequests: FriendDisplay[];
  outgoingRequests: FriendDisplay[];
} {
  const playerMap = new Map<string, PlayerRow>();
  for (const p of allPlayers) {
    playerMap.set(p.identity, p);
  }

  const friends: FriendDisplay[] = [];
  const incomingRequests: FriendDisplay[] = [];
  const outgoingRequests: FriendDisplay[] = [];

  for (const f of friendRows) {
    const isSender = f.senderId === myHex;
    const otherHex = isSender ? f.receiverId : f.senderId;
    const otherPlayer = playerMap.get(otherHex);

    const display: FriendDisplay = {
      friendshipId: f.id,
      identity: otherHex,
      name: otherPlayer?.name || "Unknown",
      level: otherPlayer?.level ?? 1,
      playerClass: (otherPlayer?.characterClass.tag as PlayerClass) ?? "Unclassed",
      online: otherPlayer?.online ?? false,
      stats: {
        STR: Math.round(otherPlayer?.strength ?? 0),
        AGI: Math.round(otherPlayer?.agility ?? 0),
        INT: Math.round(otherPlayer?.intelligence ?? 0),
        CON: Math.round(otherPlayer?.constitution ?? 0),
        WIS: Math.round(otherPlayer?.wisdom ?? 0),
        CHA: Math.round(otherPlayer?.charisma ?? 0),
        MP: Math.round(otherPlayer?.mana ?? 0),
      },
      currentBiome: otherPlayer?.currentBiome ?? "plains",
      isSender,
      status: f.status.tag,
    };

    if (f.status.tag === "Accepted") {
      friends.push(display);
    } else if (isSender) {
      outgoingRequests.push(display);
    } else {
      incomingRequests.push(display);
    }
  }

  return { friends, incomingRequests, outgoingRequests };
}

// ── Replicated server validation logic from friendship.ts ──────

function validateSendFriendRequest(
  senderIdentity: string,
  targetName: string,
  allPlayers: PlayerRow[],
  existingFriendships: FriendshipRow[],
): { error?: string; targetIdentity?: string } {
  // Find sender
  const sender = allPlayers.find((p) => p.identity === senderIdentity);
  if (!sender) return { error: "Player not found" };

  // Find target by name (exclude self)
  const target = allPlayers.find((p) => p.name === targetName && p.identity !== senderIdentity);
  if (!target) return { error: "Player not found" };

  // Check for existing friendship in either direction
  for (const f of existingFriendships) {
    if (f.senderId === senderIdentity && f.receiverId === target.identity) {
      return { error: "Friend request already sent" };
    }
    if (f.receiverId === senderIdentity && f.senderId === target.identity) {
      return { error: "Already friends or request pending" };
    }
  }

  return { targetIdentity: target.identity };
}

function validateAcceptFriendRequest(
  receiverIdentity: string,
  friendshipId: bigint,
  friendships: FriendshipRow[],
): { error?: string } {
  const f = friendships.find((x) => x.id === friendshipId);
  if (!f) return { error: "Friendship not found" };
  if (f.receiverId !== receiverIdentity) return { error: "Only the receiver can accept" };
  if (f.status.tag !== "Pending") return { error: "Already accepted" };
  return {};
}

function validateRejectFriendRequest(
  receiverIdentity: string,
  friendshipId: bigint,
  friendships: FriendshipRow[],
): { error?: string } {
  const f = friendships.find((x) => x.id === friendshipId);
  if (!f) return { error: "Friendship not found" };
  if (f.receiverId !== receiverIdentity) return { error: "Only the receiver can reject" };
  if (f.status.tag !== "Pending") return { error: "Not a pending request" };
  return {};
}

function validateRemoveFriend(
  callerIdentity: string,
  friendshipId: bigint,
  friendships: FriendshipRow[],
): { error?: string } {
  const f = friendships.find((x) => x.id === friendshipId);
  if (!f) return { error: "Friendship not found" };
  if (f.senderId !== callerIdentity && f.receiverId !== callerIdentity) {
    return { error: "Not your friendship" };
  }
  return {};
}

// ── Test Data ──────────────────────────────────────────────────

const PLAYER_ALICE: PlayerRow = {
  identity: "alice-hex",
  name: "Alice",
  level: 15,
  characterClass: { tag: "Mage" },
  online: true,
  strength: 5,
  agility: 8,
  intelligence: 25,
  constitution: 10,
  wisdom: 18,
  charisma: 12,
  mana: 30,
  currentBiome: "spire",
};

const PLAYER_BOB: PlayerRow = {
  identity: "bob-hex",
  name: "Bob",
  level: 10,
  characterClass: { tag: "Warrior" },
  online: false,
  strength: 22,
  agility: 10,
  intelligence: 5,
  constitution: 18,
  wisdom: 3,
  charisma: 6,
  mana: 8,
  currentBiome: "plains",
};

const PLAYER_CHARLIE: PlayerRow = {
  identity: "charlie-hex",
  name: "Charlie",
  level: 20,
  characterClass: { tag: "Rogue" },
  online: true,
  strength: 12,
  agility: 28,
  intelligence: 8,
  constitution: 14,
  wisdom: 7,
  charisma: 9,
  mana: 10,
  currentBiome: "forest",
};

const ALL_PLAYERS = [PLAYER_ALICE, PLAYER_BOB, PLAYER_CHARLIE];

// ── Tests: processFriendRows (client-side transformation) ──────

describe("processFriendRows", () => {
  it("returns empty arrays when there are no friend rows", () => {
    const result = processFriendRows([], ALL_PLAYERS, "alice-hex");
    expect(result.friends).toEqual([]);
    expect(result.incomingRequests).toEqual([]);
    expect(result.outgoingRequests).toEqual([]);
  });

  it("classifies accepted friendships into friends list", () => {
    const rows: FriendshipRow[] = [
      { id: 1n, senderId: "alice-hex", receiverId: "bob-hex", status: { tag: "Accepted" } },
    ];

    const result = processFriendRows(rows, ALL_PLAYERS, "alice-hex");

    expect(result.friends).toHaveLength(1);
    expect(result.friends[0]!.name).toBe("Bob");
    expect(result.friends[0]!.isSender).toBe(true);
    expect(result.incomingRequests).toHaveLength(0);
    expect(result.outgoingRequests).toHaveLength(0);
  });

  it("classifies pending requests sent by me as outgoing", () => {
    const rows: FriendshipRow[] = [
      { id: 2n, senderId: "alice-hex", receiverId: "bob-hex", status: { tag: "Pending" } },
    ];

    const result = processFriendRows(rows, ALL_PLAYERS, "alice-hex");

    expect(result.friends).toHaveLength(0);
    expect(result.outgoingRequests).toHaveLength(1);
    expect(result.outgoingRequests[0]!.name).toBe("Bob");
    expect(result.incomingRequests).toHaveLength(0);
  });

  it("classifies pending requests sent to me as incoming", () => {
    const rows: FriendshipRow[] = [
      { id: 3n, senderId: "bob-hex", receiverId: "alice-hex", status: { tag: "Pending" } },
    ];

    const result = processFriendRows(rows, ALL_PLAYERS, "alice-hex");

    expect(result.friends).toHaveLength(0);
    expect(result.incomingRequests).toHaveLength(1);
    expect(result.incomingRequests[0]!.name).toBe("Bob");
    expect(result.outgoingRequests).toHaveLength(0);
  });

  it("handles mix of accepted and pending in both directions", () => {
    const rows: FriendshipRow[] = [
      { id: 1n, senderId: "alice-hex", receiverId: "bob-hex", status: { tag: "Accepted" } },
      {
        id: 2n,
        senderId: "alice-hex",
        receiverId: "charlie-hex",
        status: { tag: "Pending" },
      },
      {
        id: 3n,
        senderId: "charlie-hex",
        receiverId: "alice-hex",
        status: { tag: "Pending" },
      },
    ];

    // Note: row 2 and 3 are separate — Alice sent to Charlie AND Charlie sent to Alice
    // In practice, the server prevents duplicates, but the logic should still categorize correctly.
    const result = processFriendRows(rows, ALL_PLAYERS, "alice-hex");

    expect(result.friends).toHaveLength(1);
    expect(result.friends[0]!.name).toBe("Bob");
    // Row 2: Alice sent to Charlie -> outgoing
    expect(result.outgoingRequests).toHaveLength(1);
    // Row 3: Charlie sent to Alice -> incoming
    expect(result.incomingRequests).toHaveLength(1);
  });

  it("correctly maps player stats to FriendDisplay", () => {
    const rows: FriendshipRow[] = [
      { id: 1n, senderId: "alice-hex", receiverId: "bob-hex", status: { tag: "Accepted" } },
    ];

    const result = processFriendRows(rows, ALL_PLAYERS, "alice-hex");
    const bob = result.friends[0]!;

    expect(bob.level).toBe(10);
    expect(bob.playerClass).toBe("Warrior");
    expect(bob.online).toBe(false);
    expect(bob.currentBiome).toBe("plains");
    expect(bob.stats).toEqual({
      STR: 22,
      AGI: 10,
      INT: 5,
      CON: 18,
      WIS: 3,
      CHA: 6,
      MP: 8,
    });
  });

  it("handles unknown player gracefully", () => {
    const rows: FriendshipRow[] = [
      {
        id: 1n,
        senderId: "alice-hex",
        receiverId: "unknown-hex",
        status: { tag: "Accepted" },
      },
    ];

    const result = processFriendRows(rows, ALL_PLAYERS, "alice-hex");
    const unknown = result.friends[0]!;

    expect(unknown.name).toBe("Unknown");
    expect(unknown.level).toBe(1);
    expect(unknown.playerClass).toBe("Unclassed");
    expect(unknown.online).toBe(false);
    expect(unknown.currentBiome).toBe("plains");
  });

  it("rounds stat values", () => {
    const players: PlayerRow[] = [
      {
        ...PLAYER_BOB,
        strength: 22.7,
        agility: 10.3,
      },
    ];

    const rows: FriendshipRow[] = [
      { id: 1n, senderId: "alice-hex", receiverId: "bob-hex", status: { tag: "Accepted" } },
    ];

    const result = processFriendRows(rows, players, "alice-hex");
    expect(result.friends[0]!.stats.STR).toBe(23);
    expect(result.friends[0]!.stats.AGI).toBe(10);
  });

  it("identifies correct other player based on sender/receiver", () => {
    const rows: FriendshipRow[] = [
      // Bob sent to Alice
      { id: 1n, senderId: "bob-hex", receiverId: "alice-hex", status: { tag: "Accepted" } },
    ];

    const result = processFriendRows(rows, ALL_PLAYERS, "alice-hex");
    // Alice is receiver, so the "other" should be Bob
    expect(result.friends[0]!.name).toBe("Bob");
    expect(result.friends[0]!.isSender).toBe(false);
  });
});

// ── Tests: Server validation logic ─────────────────────────────

describe("validateSendFriendRequest", () => {
  it("succeeds for valid request", () => {
    const result = validateSendFriendRequest("alice-hex", "Bob", ALL_PLAYERS, []);
    expect(result.error).toBeUndefined();
    expect(result.targetIdentity).toBe("bob-hex");
  });

  it("rejects when sender not found", () => {
    const result = validateSendFriendRequest("unknown-hex", "Bob", ALL_PLAYERS, []);
    expect(result.error).toBe("Player not found");
  });

  it("rejects when target name not found", () => {
    const result = validateSendFriendRequest("alice-hex", "NonExistent", ALL_PLAYERS, []);
    expect(result.error).toBe("Player not found");
  });

  it("prevents self-friend (same name lookup excludes self)", () => {
    const result = validateSendFriendRequest("alice-hex", "Alice", ALL_PLAYERS, []);
    expect(result.error).toBe("Player not found");
  });

  it("prevents duplicate request (sender already sent)", () => {
    const existing: FriendshipRow[] = [
      { id: 1n, senderId: "alice-hex", receiverId: "bob-hex", status: { tag: "Pending" } },
    ];

    const result = validateSendFriendRequest("alice-hex", "Bob", ALL_PLAYERS, existing);
    expect(result.error).toBe("Friend request already sent");
  });

  it("prevents duplicate when request exists in reverse direction", () => {
    const existing: FriendshipRow[] = [
      { id: 1n, senderId: "bob-hex", receiverId: "alice-hex", status: { tag: "Pending" } },
    ];

    const result = validateSendFriendRequest("alice-hex", "Bob", ALL_PLAYERS, existing);
    expect(result.error).toBe("Already friends or request pending");
  });

  it("prevents sending to already-accepted friend", () => {
    const existing: FriendshipRow[] = [
      { id: 1n, senderId: "alice-hex", receiverId: "bob-hex", status: { tag: "Accepted" } },
    ];

    const result = validateSendFriendRequest("alice-hex", "Bob", ALL_PLAYERS, existing);
    expect(result.error).toBe("Friend request already sent");
  });
});

describe("validateAcceptFriendRequest", () => {
  const friendships: FriendshipRow[] = [
    { id: 1n, senderId: "bob-hex", receiverId: "alice-hex", status: { tag: "Pending" } },
    { id: 2n, senderId: "alice-hex", receiverId: "charlie-hex", status: { tag: "Accepted" } },
  ];

  it("succeeds for valid acceptance", () => {
    const result = validateAcceptFriendRequest("alice-hex", 1n, friendships);
    expect(result.error).toBeUndefined();
  });

  it("rejects non-existent friendship", () => {
    const result = validateAcceptFriendRequest("alice-hex", 999n, friendships);
    expect(result.error).toBe("Friendship not found");
  });

  it("rejects if caller is not the receiver", () => {
    const result = validateAcceptFriendRequest("bob-hex", 1n, friendships);
    expect(result.error).toBe("Only the receiver can accept");
  });

  it("rejects if already accepted", () => {
    const result = validateAcceptFriendRequest("charlie-hex", 2n, friendships);
    expect(result.error).toBe("Already accepted");
  });
});

describe("validateRejectFriendRequest", () => {
  const friendships: FriendshipRow[] = [
    { id: 1n, senderId: "bob-hex", receiverId: "alice-hex", status: { tag: "Pending" } },
    { id: 2n, senderId: "alice-hex", receiverId: "charlie-hex", status: { tag: "Accepted" } },
  ];

  it("succeeds for valid rejection", () => {
    const result = validateRejectFriendRequest("alice-hex", 1n, friendships);
    expect(result.error).toBeUndefined();
  });

  it("rejects non-existent friendship", () => {
    const result = validateRejectFriendRequest("alice-hex", 999n, friendships);
    expect(result.error).toBe("Friendship not found");
  });

  it("rejects if caller is not the receiver", () => {
    const result = validateRejectFriendRequest("bob-hex", 1n, friendships);
    expect(result.error).toBe("Only the receiver can reject");
  });

  it("rejects if friendship is not pending", () => {
    const result = validateRejectFriendRequest("charlie-hex", 2n, friendships);
    expect(result.error).toBe("Not a pending request");
  });
});

describe("validateRemoveFriend", () => {
  const friendships: FriendshipRow[] = [
    { id: 1n, senderId: "alice-hex", receiverId: "bob-hex", status: { tag: "Accepted" } },
  ];

  it("allows sender to remove", () => {
    const result = validateRemoveFriend("alice-hex", 1n, friendships);
    expect(result.error).toBeUndefined();
  });

  it("allows receiver to remove", () => {
    const result = validateRemoveFriend("bob-hex", 1n, friendships);
    expect(result.error).toBeUndefined();
  });

  it("rejects non-existent friendship", () => {
    const result = validateRemoveFriend("alice-hex", 999n, friendships);
    expect(result.error).toBe("Friendship not found");
  });

  it("rejects if caller is neither sender nor receiver", () => {
    const result = validateRemoveFriend("charlie-hex", 1n, friendships);
    expect(result.error).toBe("Not your friendship");
  });
});
