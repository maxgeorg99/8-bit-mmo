/**
 * Game Store — Zustand UI cache backed by SpacetimeDB subscriptions.
 *
 * Phase 4.2: Zustand is NOT the source of truth. SpacetimeDB is.
 * This store acts as a UI cache layer that:
 *   1. Receives updates from SpacetimeDB subscriptions (via useStdbSync)
 *   2. Persists a snapshot to localStorage for offline fallback
 *   3. Provides a stable, synchronous read surface for React components
 *
 * Components should read from this store. Writes MUST go through
 * SpacetimeDB reducers (possibly via the offline queue).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Player, Quest, ActivityLog } from "@/lib/types";

// ── Store Shape ─────────────────────────────────────────────────

export interface GameStoreState {
  /** Whether the SpacetimeDB connection is active */
  connected: boolean;
  /** Own player data (mapped to local Player type) */
  player: Player | null;
  /** Activity log entries */
  activityLogs: ActivityLog[];
  /** Quest list */
  quests: Quest[];
  /** Unlocked title IDs */
  unlockedTitles: string[];
  /** Number of pending offline reducer calls */
  offlineQueueSize: number;
}

export interface GameStoreActions {
  /** Called by useStdbSync when SpacetimeDB data changes */
  setPlayer: (player: Player | null) => void;
  setActivityLogs: (logs: ActivityLog[]) => void;
  setQuests: (quests: Quest[]) => void;
  setUnlockedTitles: (titles: string[]) => void;
  setConnected: (connected: boolean) => void;
  setOfflineQueueSize: (size: number) => void;
}

export type GameStore = GameStoreState & GameStoreActions;

// ── Store Creation ──────────────────────────────────────────────

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      // State
      connected: false,
      player: null,
      activityLogs: [],
      quests: [],
      unlockedTitles: [],
      offlineQueueSize: 0,

      // Actions — called by the sync hook, never by UI directly
      setPlayer: (player) => set({ player }),
      setActivityLogs: (activityLogs) => set({ activityLogs }),
      setQuests: (quests) => set({ quests }),
      setUnlockedTitles: (unlockedTitles) => set({ unlockedTitles }),
      setConnected: (connected) => set({ connected }),
      setOfflineQueueSize: (offlineQueueSize) => set({ offlineQueueSize }),
    }),
    {
      name: "reallife-mmo-game-cache",
      // Only persist a subset — SpacetimeDB is the source of truth.
      // We persist just enough for offline read access.
      partialize: (state) => ({
        player: state.player,
        activityLogs: state.activityLogs,
        quests: state.quests,
        unlockedTitles: state.unlockedTitles,
      }),
    },
  ),
);
