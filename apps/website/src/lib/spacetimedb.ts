import type { Identity } from "spacetimedb";
import { DbConnection } from "@/generated";

const SPACETIMEDB_URI = import.meta.env.VITE_SPACETIMEDB_URI || "ws://127.0.0.1:3000";
const DATABASE_NAME = import.meta.env.VITE_SPACETIMEDB_DB || "8bit-combat";
const TOKEN_KEY = "spacetimedb_auth_token";

let connection: DbConnection | null = null;

export function getConnection(): DbConnection | null {
  return connection;
}

export function connect(
  onConnect?: (conn: DbConnection, identity: Identity) => void,
  onError?: (err: Error) => void,
): DbConnection {
  const token = localStorage.getItem(TOKEN_KEY) ?? undefined;

  const conn = DbConnection.builder()
    .withUri(SPACETIMEDB_URI)
    .withDatabaseName(DATABASE_NAME)
    .withToken(token)
    .onConnect((ctx, identity, authToken) => {
      localStorage.setItem(TOKEN_KEY, authToken);
      connection = ctx;
      onConnect?.(ctx, identity);
    })
    .onConnectError((_ctx, err) => {
      onError?.(err);
    })
    .onDisconnect(() => {
      connection = null;
    })
    .build();

  return conn;
}

export function disconnect() {
  connection?.disconnect();
  connection = null;
}
