import { useCallback, useMemo, useRef, useState } from "react";
import { DbConnection } from "@/generated";
import { tables } from "@/generated";

const SPACETIMEDB_URI =
  import.meta.env.VITE_SPACETIMEDB_URI ||
  (import.meta.env.PROD ? "wss://maincloud.spacetimedb.com" : "ws://127.0.0.1:3000");
const DATABASE_NAME = import.meta.env.VITE_SPACETIMEDB_DB || "8bit-combat";
const TOKEN_KEY = "spacetimedb_auth_token";

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 15000];

function getToken(): string | undefined {
  return localStorage.getItem(TOKEN_KEY) ?? undefined;
}

function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function buildConnection(onReconnect: () => void, onConnected: () => void) {
  return DbConnection.builder()
    .withUri(SPACETIMEDB_URI)
    .withDatabaseName(DATABASE_NAME)
    .withToken(getToken())
    .withConfirmedReads(false)
    .withCompression("none")
    .onConnect((conn, identity, token) => {
      console.log("[SpacetimeDB] Connected, identity:", identity.toHexString());
      saveToken(token);
      onConnected();

      conn
        .subscriptionBuilder()
        .onApplied(() => {
          console.log("[SpacetimeDB] Subscription applied");
        })
        .onError((e) => {
          console.error("[SpacetimeDB] Subscription error:", e);
        })
        .subscribe([
          // Core tables
          "SELECT * FROM player",
          "SELECT * FROM spell",
          // Views — server filters to caller's data
          "SELECT * FROM my_player",
          "SELECT * FROM my_equipment",
          "SELECT * FROM my_quests",
          "SELECT * FROM my_titles",
          "SELECT * FROM my_guild",
          "SELECT * FROM my_guild_members",
          "SELECT * FROM my_guild_messages",
          "SELECT * FROM my_biome_messages",
          "SELECT * FROM my_whisper_messages",
          "SELECT * FROM my_activity_logs",
          "SELECT * FROM my_combat",
          "SELECT * FROM my_combat_log",
          "SELECT * FROM my_raid",
          "SELECT * FROM my_raid_combatants",
          "SELECT * FROM my_raid_log",
          "SELECT * FROM biome_players",
          "SELECT * FROM leaderboard",
          "SELECT * FROM browse_guilds",
          // Raw tables for combat + equipment (for inspecting other players)
          "SELECT * FROM equipment_item",
          "SELECT * FROM combat",
          "SELECT * FROM combat_log",
        ]);
    })
    .onDisconnect((_ctx, error) => {
      console.log("[SpacetimeDB] Disconnected:", error?.message ?? "connection closed");
      onReconnect();
    })
    .onConnectError((_ctx, error) => {
      console.log("[SpacetimeDB] Connect error:", error?.message ?? "connection failed");
      onReconnect();
    });
}

/**
 * Returns a connectionBuilder that auto-reconnects on disconnect/error.
 * Pass this to <SpacetimeDBProvider connectionBuilder={builder}>.
 *
 * Pattern from watchdle — creates a new builder on each reconnect attempt,
 * which triggers SpacetimeDBProvider to re-establish the connection.
 */
export function useConnectionBuilder() {
  const [reconnectKey, setReconnectKey] = useState(0);
  const retryRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleReconnect = useCallback(() => {
    if (timerRef.current) return;
    const delay = RECONNECT_DELAYS[Math.min(retryRef.current, RECONNECT_DELAYS.length - 1)]!;
    console.log(`[SpacetimeDB] Reconnecting in ${delay}ms (attempt ${retryRef.current + 1})...`);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      retryRef.current += 1;
      setReconnectKey((k) => k + 1);
    }, delay);
  }, []);

  const resetRetries = useCallback(() => {
    retryRef.current = 0;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const builder = useMemo(
    () => buildConnection(scheduleReconnect, resetRetries),
    // reconnectKey forces a fresh builder after disconnect
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reconnectKey, scheduleReconnect, resetRetries],
  );

  return builder;
}

// Re-export the generated tables for use with useTable()
export { tables };
