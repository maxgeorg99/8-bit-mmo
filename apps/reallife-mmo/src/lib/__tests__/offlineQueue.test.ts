/**
 * Tests for the offline queue module (Phase 4.2/4.3).
 *
 * The offline queue buffers SpacetimeDB reducer calls when the client
 * is disconnected and replays them on reconnect.
 */
import { describe, expect, it, vi, beforeEach } from "vite-plus/test";

// ── Replicated logic from offlineQueue.ts ──────────────────────
// We replicate the core offline queue logic here as pure functions
// to avoid localStorage and module-level side effects in tests.

interface QueuedReducerCall {
  reducerName: string;
  args: Record<string, unknown>;
  queuedAt: number;
}

function createOfflineQueue() {
  let connected = false;
  let queue: QueuedReducerCall[] = [];
  const listeners = new Set<() => void>();

  function notify() {
    for (const fn of listeners) fn();
  }

  return {
    setOnline(dispatch: (name: string, args: Record<string, unknown>) => void) {
      connected = true;
      // Replay
      if (queue.length > 0) {
        const pending = [...queue];
        queue = [];
        for (const call of pending) {
          dispatch(call.reducerName, call.args);
        }
      }
      notify();
    },
    setOffline() {
      connected = false;
      notify();
    },
    isOnline() {
      return connected;
    },
    enqueue(
      reducerName: string,
      args: Record<string, unknown>,
      dispatch: (name: string, args: Record<string, unknown>) => void,
    ) {
      if (connected) {
        dispatch(reducerName, args);
        return;
      }
      queue.push({ reducerName, args, queuedAt: Date.now() });
      notify();
    },
    getQueueLength() {
      return queue.length;
    },
    getQueue(): readonly QueuedReducerCall[] {
      return queue;
    },
    clearQueue() {
      queue = [];
      notify();
    },
    subscribe(fn: () => void): () => void {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

// ── Tests ──────────────────────────────────────────────────────

describe("Offline Queue", () => {
  let oq: ReturnType<typeof createOfflineQueue>;

  beforeEach(() => {
    oq = createOfflineQueue();
  });

  describe("initial state", () => {
    it("starts offline", () => {
      expect(oq.isOnline()).toBe(false);
    });

    it("starts with empty queue", () => {
      expect(oq.getQueueLength()).toBe(0);
      expect(oq.getQueue()).toEqual([]);
    });
  });

  describe("online/offline toggling", () => {
    it("marks online after setOnline", () => {
      oq.setOnline(vi.fn());
      expect(oq.isOnline()).toBe(true);
    });

    it("marks offline after setOffline", () => {
      oq.setOnline(vi.fn());
      oq.setOffline();
      expect(oq.isOnline()).toBe(false);
    });
  });

  describe("enqueue when online", () => {
    it("dispatches immediately when online", () => {
      const dispatch = vi.fn();
      oq.setOnline(vi.fn());

      oq.enqueue("logActivity", { type: "Cardio", duration: 30 }, dispatch);

      expect(dispatch).toHaveBeenCalledWith("logActivity", { type: "Cardio", duration: 30 });
      expect(oq.getQueueLength()).toBe(0);
    });

    it("does not buffer calls when online", () => {
      const dispatch = vi.fn();
      oq.setOnline(vi.fn());

      oq.enqueue("logActivity", { type: "Cardio" }, dispatch);
      oq.enqueue("claimQuest", { questId: "1" }, dispatch);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(oq.getQueueLength()).toBe(0);
    });
  });

  describe("enqueue when offline", () => {
    it("buffers calls when offline", () => {
      const dispatch = vi.fn();

      oq.enqueue("logActivity", { type: "Cardio", duration: 30 }, dispatch);

      expect(dispatch).not.toHaveBeenCalled();
      expect(oq.getQueueLength()).toBe(1);
    });

    it("preserves call order in queue", () => {
      const dispatch = vi.fn();

      oq.enqueue("logActivity", { type: "Cardio" }, dispatch);
      oq.enqueue("claimQuest", { questId: "1" }, dispatch);
      oq.enqueue("equipItem", { itemId: "sword" }, dispatch);

      expect(oq.getQueueLength()).toBe(3);
      const q = oq.getQueue();
      expect(q[0]!.reducerName).toBe("logActivity");
      expect(q[1]!.reducerName).toBe("claimQuest");
      expect(q[2]!.reducerName).toBe("equipItem");
    });

    it("stores args correctly", () => {
      oq.enqueue("logActivity", { type: "Cardio", duration: 45 }, vi.fn());

      const q = oq.getQueue();
      expect(q[0]!.args).toEqual({ type: "Cardio", duration: 45 });
    });

    it("records queuedAt timestamp", () => {
      const before = Date.now();
      oq.enqueue("logActivity", { type: "Cardio" }, vi.fn());
      const after = Date.now();

      const q = oq.getQueue();
      expect(q[0]!.queuedAt).toBeGreaterThanOrEqual(before);
      expect(q[0]!.queuedAt).toBeLessThanOrEqual(after);
    });
  });

  describe("replay on reconnect", () => {
    it("replays all queued calls on setOnline", () => {
      const offlineDispatch = vi.fn();
      oq.enqueue("logActivity", { type: "Cardio" }, offlineDispatch);
      oq.enqueue("claimQuest", { questId: "1" }, offlineDispatch);

      expect(offlineDispatch).not.toHaveBeenCalled();

      const replayDispatch = vi.fn();
      oq.setOnline(replayDispatch);

      expect(replayDispatch).toHaveBeenCalledTimes(2);
      expect(replayDispatch).toHaveBeenCalledWith("logActivity", { type: "Cardio" });
      expect(replayDispatch).toHaveBeenCalledWith("claimQuest", { questId: "1" });
    });

    it("clears queue after replay", () => {
      oq.enqueue("logActivity", { type: "Cardio" }, vi.fn());
      oq.setOnline(vi.fn());

      expect(oq.getQueueLength()).toBe(0);
    });

    it("does nothing if queue is empty on reconnect", () => {
      const dispatch = vi.fn();
      oq.setOnline(dispatch);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it("replays in FIFO order", () => {
      const callOrder: string[] = [];

      oq.enqueue("first", {}, vi.fn());
      oq.enqueue("second", {}, vi.fn());
      oq.enqueue("third", {}, vi.fn());

      oq.setOnline((name) => callOrder.push(name));

      expect(callOrder).toEqual(["first", "second", "third"]);
    });
  });

  describe("clearQueue", () => {
    it("empties the queue without replaying", () => {
      oq.enqueue("logActivity", { type: "Cardio" }, vi.fn());
      oq.enqueue("claimQuest", { questId: "1" }, vi.fn());

      expect(oq.getQueueLength()).toBe(2);
      oq.clearQueue();
      expect(oq.getQueueLength()).toBe(0);
    });

    it("cleared queue does not replay on reconnect", () => {
      oq.enqueue("logActivity", { type: "Cardio" }, vi.fn());
      oq.clearQueue();

      const dispatch = vi.fn();
      oq.setOnline(dispatch);
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe("subscription", () => {
    it("notifies listeners on enqueue", () => {
      const listener = vi.fn();
      oq.subscribe(listener);

      oq.enqueue("logActivity", { type: "Cardio" }, vi.fn());
      expect(listener).toHaveBeenCalled();
    });

    it("notifies listeners on setOnline", () => {
      const listener = vi.fn();
      oq.subscribe(listener);

      oq.setOnline(vi.fn());
      expect(listener).toHaveBeenCalled();
    });

    it("notifies listeners on setOffline", () => {
      const listener = vi.fn();
      oq.setOnline(vi.fn());
      oq.subscribe(listener);

      oq.setOffline();
      expect(listener).toHaveBeenCalled();
    });

    it("notifies listeners on clearQueue", () => {
      const listener = vi.fn();
      oq.subscribe(listener);

      oq.clearQueue();
      expect(listener).toHaveBeenCalled();
    });

    it("unsubscribe stops notifications", () => {
      const listener = vi.fn();
      const unsub = oq.subscribe(listener);
      unsub();

      oq.enqueue("logActivity", {}, vi.fn());
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
