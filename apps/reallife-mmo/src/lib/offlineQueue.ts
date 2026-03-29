/**
 * Offline Queue — buffers SpacetimeDB reducer calls when disconnected.
 *
 * When the client is offline, reducer calls are serialized and stored in
 * localStorage. On reconnect, the queue is replayed in order.
 *
 * This is the core of Phase 4.2's offline support.
 */

const QUEUE_KEY = "reallife_mmo_offline_queue";

export interface QueuedReducerCall {
  /** Reducer name as it appears in the generated bindings (e.g. "logActivity") */
  reducerName: string;
  /** Serializable arguments for the reducer */
  args: Record<string, unknown>;
  /** Timestamp when the call was queued */
  queuedAt: number;
}

// ── Internal state ──────────────────────────────────────────────

let connected = false;
let queue: QueuedReducerCall[] = loadQueue();
const listeners = new Set<() => void>();

function loadQueue(): QueuedReducerCall[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedReducerCall[]) : [];
  } catch {
    return [];
  }
}

function persistQueue() {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full or unavailable — silently drop
  }
}

function notify() {
  for (const fn of listeners) fn();
}

// ── Public API ──────────────────────────────────────────────────

/** Mark the connection as online. Triggers queue replay via the provided dispatcher. */
export function setOnline(dispatch: (reducerName: string, args: Record<string, unknown>) => void) {
  connected = true;
  replayQueue(dispatch);
  notify();
}

/** Mark the connection as offline. Future reducer calls will be queued. */
export function setOffline() {
  connected = false;
  notify();
}

/** Returns true if we believe the SpacetimeDB connection is active. */
export function isOnline(): boolean {
  return connected;
}

/**
 * Enqueue a reducer call. If online, the call is dispatched immediately
 * via `dispatch`. If offline, it is buffered to localStorage.
 */
export function enqueueReducerCall(
  reducerName: string,
  args: Record<string, unknown>,
  dispatch: (reducerName: string, args: Record<string, unknown>) => void,
) {
  if (connected) {
    dispatch(reducerName, args);
    return;
  }

  queue.push({
    reducerName,
    args,
    queuedAt: Date.now(),
  });
  persistQueue();
  notify();
}

/** Replay all queued calls via `dispatch`, then clear the queue. */
function replayQueue(dispatch: (reducerName: string, args: Record<string, unknown>) => void) {
  if (queue.length === 0) return;

  const pending = [...queue];
  queue = [];
  persistQueue();

  console.log(`[OfflineQueue] Replaying ${pending.length} queued reducer call(s)`);

  for (const call of pending) {
    try {
      dispatch(call.reducerName, call.args);
    } catch (err) {
      console.error(`[OfflineQueue] Failed to replay ${call.reducerName}:`, err);
    }
  }

  notify();
}

/** Get the current queue length (for UI indicators). */
export function getQueueLength(): number {
  return queue.length;
}

/** Get a snapshot of the current queue (read-only). */
export function getQueue(): readonly QueuedReducerCall[] {
  return queue;
}

/** Clear the queue without replaying. Use for manual discard. */
export function clearQueue() {
  queue = [];
  persistQueue();
  notify();
}

/** Subscribe to queue state changes. Returns an unsubscribe function. */
export function subscribeQueue(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
