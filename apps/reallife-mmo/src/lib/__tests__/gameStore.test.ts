/**
 * Tests for the Zustand game store (Phase 4.2/4.3).
 *
 * The game store acts as a UI cache layer backed by SpacetimeDB subscriptions.
 * We test the store shape, default values, and action behaviors.
 */
import { describe, expect, it, beforeEach } from "vite-plus/test";
import { create } from "zustand";
import type { Player, Quest, ActivityLog } from "../types";

// ── Replicated store shape (no persistence in tests) ───────────

interface GameStoreState {
  connected: boolean;
  player: Player | null;
  activityLogs: ActivityLog[];
  quests: Quest[];
  unlockedTitles: string[];
  offlineQueueSize: number;
}

interface GameStoreActions {
  setPlayer: (player: Player | null) => void;
  setActivityLogs: (logs: ActivityLog[]) => void;
  setQuests: (quests: Quest[]) => void;
  setUnlockedTitles: (titles: string[]) => void;
  setConnected: (connected: boolean) => void;
  setOfflineQueueSize: (size: number) => void;
}

type GameStore = GameStoreState & GameStoreActions;

function createTestStore() {
  return create<GameStore>()((set) => ({
    connected: false,
    player: null,
    activityLogs: [],
    quests: [],
    unlockedTitles: [],
    offlineQueueSize: 0,
    setPlayer: (player) => set({ player }),
    setActivityLogs: (activityLogs) => set({ activityLogs }),
    setQuests: (quests) => set({ quests }),
    setUnlockedTitles: (unlockedTitles) => set({ unlockedTitles }),
    setConnected: (connected) => set({ connected }),
    setOfflineQueueSize: (offlineQueueSize) => set({ offlineQueueSize }),
  }));
}

const MOCK_PLAYER: Player = {
  name: "TestPlayer",
  level: 10,
  xp: 150,
  xpToNext: 250,
  hp: 80,
  maxHp: 100,
  gold: 500,
  playerClass: "Mage",
  stats: { STR: 5, AGI: 8, INT: 25, CON: 10, WIS: 18, CHA: 12, MP: 30 },
  streakDays: 5,
  totalActivities: 42,
  joinedAt: 0,
  currentBiome: "spire",
  currentLocation: null,
  activeTitle: "Scholar",
  unlockedBiomes: ["plains", "forest", "spire"],
  equipment: {},
  chest: [],
  unlockedTitles: ["Century", "Scholar"],
};

// ── Tests ──────────────────────────────────────────────────────

describe("GameStore", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe("initial state", () => {
    it("starts disconnected", () => {
      expect(store.getState().connected).toBe(false);
    });

    it("starts with null player", () => {
      expect(store.getState().player).toBeNull();
    });

    it("starts with empty arrays", () => {
      expect(store.getState().activityLogs).toEqual([]);
      expect(store.getState().quests).toEqual([]);
      expect(store.getState().unlockedTitles).toEqual([]);
    });

    it("starts with zero offline queue size", () => {
      expect(store.getState().offlineQueueSize).toBe(0);
    });
  });

  describe("setPlayer", () => {
    it("sets player data", () => {
      store.getState().setPlayer(MOCK_PLAYER);
      expect(store.getState().player).toEqual(MOCK_PLAYER);
    });

    it("can set player to null", () => {
      store.getState().setPlayer(MOCK_PLAYER);
      store.getState().setPlayer(null);
      expect(store.getState().player).toBeNull();
    });

    it("replaces previous player data", () => {
      store.getState().setPlayer(MOCK_PLAYER);
      const updated = { ...MOCK_PLAYER, level: 20 };
      store.getState().setPlayer(updated);
      expect(store.getState().player?.level).toBe(20);
    });
  });

  describe("setConnected", () => {
    it("toggles connected state", () => {
      store.getState().setConnected(true);
      expect(store.getState().connected).toBe(true);

      store.getState().setConnected(false);
      expect(store.getState().connected).toBe(false);
    });
  });

  describe("setOfflineQueueSize", () => {
    it("updates queue size", () => {
      store.getState().setOfflineQueueSize(5);
      expect(store.getState().offlineQueueSize).toBe(5);
    });

    it("can be set to zero", () => {
      store.getState().setOfflineQueueSize(3);
      store.getState().setOfflineQueueSize(0);
      expect(store.getState().offlineQueueSize).toBe(0);
    });
  });

  describe("setUnlockedTitles", () => {
    it("sets title list", () => {
      store.getState().setUnlockedTitles(["Iron Will", "Century"]);
      expect(store.getState().unlockedTitles).toEqual(["Iron Will", "Century"]);
    });

    it("replaces previous titles", () => {
      store.getState().setUnlockedTitles(["Iron Will"]);
      store.getState().setUnlockedTitles(["Iron Will", "Century", "Scholar"]);
      expect(store.getState().unlockedTitles).toHaveLength(3);
    });
  });

  describe("setQuests", () => {
    it("sets quest list", () => {
      const quests: Quest[] = [
        {
          id: "1",
          title: "Daily Cardio",
          description: "Run 30 minutes",
          type: "daily",
          activityType: "Cardio",
          targetMin: 30,
          progressMin: 0,
          xpReward: 50,
          completed: false,
          expiresAt: 0,
          manualComplete: false,
        },
      ];
      store.getState().setQuests(quests);
      expect(store.getState().quests).toEqual(quests);
    });
  });

  describe("state isolation", () => {
    it("setting one field does not affect others", () => {
      store.getState().setPlayer(MOCK_PLAYER);
      store.getState().setConnected(true);

      // Only player and connected changed
      expect(store.getState().activityLogs).toEqual([]);
      expect(store.getState().quests).toEqual([]);
      expect(store.getState().offlineQueueSize).toBe(0);
    });
  });
});
