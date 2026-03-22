import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ActivityLog,
  ActivityType,
  EquipSlot,
  EquipmentItem,
  Player,
  Quest,
  Stats,
} from "./types";
import { EMPTY_STATS } from "./types";
import {
  calculateStatDeltas,
  calculateXpGain,
  maxHp,
  toEffectiveMinutes,
  xpToNextLevel,
} from "./statEngine";
import { deriveClass } from "./classEngine";
import { generateDailyQuests } from "./questGenerator";
import { checkMilestoneRewards } from "./rewards";

interface GameState {
  player: Player;
  activityLogs: ActivityLog[];
  quests: Quest[];
  /** Epoch ms of the last daily quest refresh */
  lastDailyRefresh: number;
  /** Last used activity type — for faster re-logging */
  lastActivityType: ActivityType;
  /** Last date (dateString) an activity was logged — for streak calc */
  lastActivityDate: string;
  /** Pending notifications to show (consumed by UI) */
  pendingNotifications: string[];

  // Actions
  consumeNotifications: () => string[];
  logActivity: (type: ActivityType, rawValue: number, intensity: number, note?: string) => void;
  claimQuest: (questId: string) => void;
  completeCustomQuest: (questId: string) => void;
  createCustomQuest: (title: string, description: string, xpReward: number) => void;
  equipItem: (itemId: string) => void;
  unequipSlot: (slot: EquipSlot) => void;
  setPlayerName: (name: string) => void;
  /** Called on app load — generates new dailies if the day has changed */
  checkDailyRefresh: () => void;
}

function addStats(a: Stats, b: Partial<Stats>): Stats {
  return {
    STR: a.STR + (b.STR ?? 0),
    AGI: a.AGI + (b.AGI ?? 0),
    INT: a.INT + (b.INT ?? 0),
    CON: a.CON + (b.CON ?? 0),
    WIS: a.WIS + (b.WIS ?? 0),
    CHA: a.CHA + (b.CHA ?? 0),
    MP: a.MP + (b.MP ?? 0),
  };
}

function countSameTypeToday(logs: ActivityLog[], type: ActivityType): number {
  const today = new Date().toDateString();
  return logs.filter((l) => l.type === type && new Date(l.timestamp).toDateString() === today)
    .length;
}

function isNewDay(lastRefresh: number): boolean {
  const lastDate = new Date(lastRefresh).toDateString();
  const today = new Date().toDateString();
  return lastDate !== today;
}

/**
 * Calculate the new streak based on the last activity date.
 * - Same day: streak unchanged
 * - Yesterday: streak + 1
 * - More than 1 day gap: streak resets to 1
 */
function calculateStreak(lastDateStr: string, currentStreak: number): number {
  if (!lastDateStr) return 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(lastDateStr);
  last.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return currentStreak; // same day
  if (diffDays === 1) return currentStreak + 1; // consecutive day
  return 1; // streak broken
}

const initialPlayer: Player = {
  name: "",
  level: 1,
  xp: 0,
  xpToNext: xpToNextLevel(1),
  hp: 50,
  maxHp: 50,
  stats: { ...EMPTY_STATS },
  playerClass: "Unclassed",
  streakDays: 0,
  totalActivities: 0,
  joinedAt: Date.now(),
  equipment: {},
  chest: [],
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      player: initialPlayer,
      activityLogs: [],
      quests: generateDailyQuests(3),
      lastDailyRefresh: Date.now(),
      lastActivityType: "StrengthTraining" as ActivityType,
      lastActivityDate: "",
      pendingNotifications: [],

      consumeNotifications: () => {
        const notifs = get().pendingNotifications;
        if (notifs.length > 0) set({ pendingNotifications: [] });
        return notifs;
      },

      setPlayerName: (name: string) => {
        set((s) => ({
          player: { ...s.player, name },
        }));
      },

      checkDailyRefresh: () => {
        const state = get();
        if (isNewDay(state.lastDailyRefresh)) {
          // Remove expired daily quests, keep customs and incomplete dailies
          const kept = state.quests.filter((q) => q.type === "custom");
          set({
            quests: [...kept, ...generateDailyQuests(3)],
            lastDailyRefresh: Date.now(),
          });
        }
      },

      logActivity: (type, rawValue, intensity, note) => {
        const state = get();
        const sameTypeCount = countSameTypeToday(state.activityLogs, type);
        const effectiveMin = toEffectiveMinutes(type, rawValue);

        const deltas = calculateStatDeltas(
          type,
          rawValue,
          intensity,
          state.player.streakDays,
          sameTypeCount,
        );

        const xpGain = calculateXpGain(type, rawValue, intensity, state.player.streakDays);

        const log: ActivityLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type,
          rawValue,
          durationMin: effectiveMin,
          intensity,
          timestamp: Date.now(),
          statDeltas: deltas,
          note: note || undefined,
        };

        const newLogs = [...state.activityLogs, log];
        const newStats = addStats(state.player.stats, deltas);
        const newClass = deriveClass(newLogs);

        // Level up check
        const notifications: string[] = [];
        let { level, xp } = state.player;
        const startLevel = level;
        xp += xpGain;
        let xpToNext = xpToNextLevel(level);

        while (xp >= xpToNext) {
          xp -= xpToNext;
          level++;
          xpToNext = xpToNextLevel(level);
        }

        if (level > startLevel) {
          notifications.push(`⬆️ Level Up! You are now Level ${level}`);
        }

        // Update quest progress (using effective minutes for quest tracking)
        const newQuests = state.quests.map((q) => {
          if (q.completed || q.activityType !== type) return q;
          const newProgress = q.progressMin + effectiveMin;
          return {
            ...q,
            progressMin: newProgress,
            completed: newProgress >= q.targetMin,
          };
        });

        const newTotalActivities = state.player.totalActivities + 1;
        const todayStr = new Date().toDateString();
        const newStreak = calculateStreak(state.lastActivityDate, state.player.streakDays);

        // Check for milestone item rewards
        const existingIds = state.player.chest.map((i) => i.id);
        const newItems = checkMilestoneRewards(level, newTotalActivities, newClass, existingIds);
        for (const item of newItems) {
          notifications.push(`🎁 New loot: ${item.name}! Check your Chest.`);
        }

        // Class change notification
        if (newClass !== state.player.playerClass && newClass !== "Unclassed") {
          notifications.push(`✨ Class evolved to ${newClass}!`);
        }

        set({
          activityLogs: newLogs,
          quests: newQuests,
          lastActivityType: type,
          lastActivityDate: todayStr,
          pendingNotifications: [...state.pendingNotifications, ...notifications],
          player: {
            ...state.player,
            stats: newStats,
            playerClass: newClass,
            level,
            xp,
            xpToNext,
            hp: maxHp(level, newStats.CON),
            maxHp: maxHp(level, newStats.CON),
            totalActivities: newTotalActivities,
            streakDays: newStreak,
            chest: [...state.player.chest, ...newItems],
          },
        });
      },

      claimQuest: (questId) => {
        set((state) => {
          const quest = state.quests.find((q) => q.id === questId);
          if (!quest || !quest.completed) return state;

          let { xp, level } = state.player;
          xp += quest.xpReward;
          let xpToNext = xpToNextLevel(level);

          while (xp >= xpToNext) {
            xp -= xpToNext;
            level++;
            xpToNext = xpToNextLevel(level);
          }

          return {
            quests: state.quests.filter((q) => q.id !== questId),
            player: {
              ...state.player,
              xp,
              level,
              xpToNext,
              hp: maxHp(level, state.player.stats.CON),
              maxHp: maxHp(level, state.player.stats.CON),
            },
          };
        });
      },

      completeCustomQuest: (questId) => {
        set((state) => ({
          quests: state.quests.map((q) =>
            q.id === questId && q.type === "custom"
              ? { ...q, completed: true, manualComplete: true }
              : q,
          ),
        }));
      },

      equipItem: (itemId) => {
        set((state) => {
          const item = state.player.chest.find((i) => i.id === itemId);
          if (!item) return state;
          return {
            player: {
              ...state.player,
              equipment: { ...state.player.equipment, [item.slot]: item },
            },
          };
        });
      },

      unequipSlot: (slot) => {
        set((state) => {
          const newEquip = { ...state.player.equipment };
          delete newEquip[slot];
          return {
            player: { ...state.player, equipment: newEquip },
          };
        });
      },

      createCustomQuest: (title, description, xpReward) => {
        const quest: Quest = {
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title,
          description,
          type: "custom",
          activityType: null,
          targetMin: 0,
          progressMin: 0,
          xpReward,
          completed: false,
          expiresAt: 0, // never expires
        };
        set((state) => ({
          quests: [...state.quests, quest],
        }));
      },
    }),
    {
      name: "reallife-mmo-save",
      // Merge persisted state with defaults so old saves don't crash
      merge: (persisted, current) => {
        const p = persisted as Partial<GameState> | undefined;
        if (!p) return current;

        const pp = (p.player ?? {}) as Partial<Player> & { inventory?: EquipmentItem[] };

        // Deep merge player with defaults for new fields
        const player: Player = {
          ...current.player,
          ...pp,
          equipment: pp.equipment ?? {},
          chest: pp.chest ?? pp.inventory ?? [],
          stats: { ...current.player.stats, ...pp.stats },
        };

        return {
          ...current,
          ...p,
          player,
          pendingNotifications: p.pendingNotifications ?? [],
          lastActivityType: p.lastActivityType ?? ("StrengthTraining" as ActivityType),
          lastActivityDate: p.lastActivityDate ?? "",
        };
      },
    },
  ),
);
