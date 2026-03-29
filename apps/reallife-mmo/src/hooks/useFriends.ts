import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";
import { tables, reducers } from "@/generated";
import type { PlayerClass, Stats } from "@/lib/types";

export interface FriendDisplay {
  friendshipId: bigint;
  identity: { toHexString(): string; isEqual(other: unknown): boolean };
  name: string;
  level: number;
  playerClass: PlayerClass;
  online: boolean;
  stats: Stats;
  currentBiome: string;
  /** Whether the caller sent the request (vs received it) */
  isSender: boolean;
  /** Pending or Accepted */
  status: "Pending" | "Accepted";
}

/**
 * Hook: friend list with player data joined in.
 * Returns accepted friends, incoming requests, and outgoing requests separately.
 */
export function useFriends() {
  const { identity } = useSpacetimeDB();
  const [friendRows] = useTable(tables.my_friends);
  const [allPlayers] = useTable(tables.player);

  const playerMap = new Map<string, (typeof allPlayers)[number]>();
  for (const p of allPlayers) {
    playerMap.set(p.identity.toHexString(), p);
  }

  const myHex = identity?.toHexString();

  const friends: FriendDisplay[] = [];
  const incomingRequests: FriendDisplay[] = [];
  const outgoingRequests: FriendDisplay[] = [];

  for (const f of friendRows) {
    const isSender = f.senderId.toHexString() === myHex;
    const otherHex = isSender ? f.receiverId.toHexString() : f.senderId.toHexString();
    const otherPlayer = playerMap.get(otherHex);

    const display: FriendDisplay = {
      friendshipId: f.id,
      identity: isSender ? f.receiverId : f.senderId,
      name: otherPlayer?.name || "Unknown",
      level: otherPlayer?.level ?? 1,
      playerClass:
        ((otherPlayer?.characterClass as { tag: string })?.tag as PlayerClass) ?? "Unclassed",
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
      status: (f.status as { tag: string }).tag as "Pending" | "Accepted",
    };

    if ((f.status as { tag: string }).tag === "Accepted") {
      friends.push(display);
    } else if (isSender) {
      outgoingRequests.push(display);
    } else {
      incomingRequests.push(display);
    }
  }

  const sendFriendRequest = useReducer(reducers.sendFriendRequest);
  const acceptFriendRequest = useReducer(reducers.acceptFriendRequest);
  const rejectFriendRequest = useReducer(reducers.rejectFriendRequest);
  const removeFriend = useReducer(reducers.removeFriend);

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    sendFriendRequest: (targetName: string) => sendFriendRequest({ targetName }),
    acceptFriendRequest: (friendshipId: bigint) => acceptFriendRequest({ friendshipId }),
    rejectFriendRequest: (friendshipId: bigint) => rejectFriendRequest({ friendshipId }),
    removeFriend: (friendshipId: bigint) => removeFriend({ friendshipId }),
  };
}
