import { useCallback, useEffect, useRef, useState } from "react";
import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";
import { tables, reducers } from "@/generated";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/8bit/input";
import { Button } from "@/components/ui/8bit/button";
import { Badge } from "@/components/ui/8bit/badge";
// Guild data now comes from SpacetimeDB
// Guild data now comes purely from SpacetimeDB

// ── Chat state shared via a simple pub/sub for cross-component control ──

type ChatTab = "local" | "guild" | "whisper";

interface ChatStore {
  expanded: boolean;
  activeTab: ChatTab;
  whisperTarget: string | null;
  listeners: Set<() => void>;
}

const chatStore: ChatStore = {
  expanded: false,
  activeTab: "local",
  whisperTarget: null,
  listeners: new Set(),
};

function notify() {
  for (const fn of chatStore.listeners) fn();
}

/** Open the chat panel to a specific tab, optionally targeting a whisper recipient. */
export function openChat(tab: ChatTab, whisperTarget?: string) {
  chatStore.expanded = true;
  chatStore.activeTab = tab;
  if (tab === "whisper" && whisperTarget) {
    chatStore.whisperTarget = whisperTarget;
  }
  notify();
}

function useChatStore() {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const fn = () => forceUpdate((n) => n + 1);
    chatStore.listeners.add(fn);
    return () => {
      chatStore.listeners.delete(fn);
    };
  }, []);
  return chatStore;
}

// ── Message row type ──
// Structural type covering all three message view shapes
interface MessageRow {
  id: bigint;
  authorId: { toHexString(): string };
  authorName?: string;
  recipientName?: string;
  text: string;
  timestamp: { toMillis(): bigint };
  guildId?: bigint;
  biomeId?: string;
  whisperTo?: { toHexString(): string };
}

// ── ChatPanel Component ──

export function ChatPanel() {
  const store = useChatStore();
  const { identity } = useSpacetimeDB();
  const identityOrNull = identity ?? null;

  // SpacetimeDB data
  const [guildMessages] = useTable(tables.my_guild_messages);
  const [biomeMessages] = useTable(tables.my_biome_messages);
  const [whisperMessages] = useTable(tables.my_whisper_messages);
  const [guildRows] = useTable(tables.my_guild);
  const [allPlayers] = useTable(tables.player);
  const hasGuild = guildRows.length > 0;

  // Build identity → name map for whisper partner resolution
  const identityNameMap = new Map<string, string>();
  for (const p of allPlayers) {
    if (p.name) identityNameMap.set(p.identity.toHexString(), p.name);
  }

  // Reducers
  const sendGuildMessageStdb = useReducer(reducers.sendGuildMessage);
  const sendBiomeMessage = useReducer(reducers.sendBiomeMessage);
  const sendWhisper = useReducer(reducers.sendWhisper);

  // Input state
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputId = "chat-input";

  // Auto-scroll on new messages
  const activeMessages = getActiveMessages(
    store.activeTab,
    biomeMessages as readonly MessageRow[],
    guildMessages as readonly MessageRow[],
    whisperMessages as readonly MessageRow[],
    store.whisperTarget,
    identityOrNull,
  );

  useEffect(() => {
    if (store.expanded) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeMessages.length, store.expanded]);

  // Whisper conversation partners (derived from whisper messages)
  const whisperPartners = getWhisperPartners(
    whisperMessages as readonly MessageRow[],
    identityOrNull,
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    // Parse commands
    const whisperMatch = text.match(/^\/(?:w|whisper)\s+(\S+)\s+(.+)$/i);
    const guildMatch = text.match(/^\/g\s+(.+)$/i);

    if (whisperMatch) {
      const [, targetName, msg] = whisperMatch;
      void sendWhisper({ targetName: targetName!, text: msg! });
      chatStore.activeTab = "whisper";
      chatStore.whisperTarget = targetName!;
      notify();
    } else if (guildMatch) {
      if (hasGuild) void sendGuildMessageStdb({ text: guildMatch[1]! });
    } else {
      // Send to active tab
      switch (store.activeTab) {
        case "local":
          void sendBiomeMessage({ text });
          break;
        case "guild":
          if (hasGuild) void sendGuildMessageStdb({ text });
          break;
        case "whisper":
          if (store.whisperTarget) {
            void sendWhisper({ targetName: store.whisperTarget, text });
          }
          break;
      }
    }

    setInput("");
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [
    input,
    store.activeTab,
    store.whisperTarget,
    hasGuild,
    sendBiomeMessage,
    sendGuildMessageStdb,
    sendWhisper,
  ]);

  const toggleExpanded = () => {
    chatStore.expanded = !chatStore.expanded;
    notify();
    if (!store.expanded) {
      setTimeout(() => document.getElementById(inputId)?.focus(), 100);
    }
  };

  const setTab = (tab: ChatTab) => {
    chatStore.activeTab = tab;
    notify();
  };

  // Unread indicator counts (basic: count messages not yet seen)
  const biomeCount = biomeMessages.length;
  const guildCount = guildMessages.length;
  const whisperCount = whisperMessages.length;

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-40 transition-all duration-200 ease-in-out",
        "bottom-[52px]", // above NavBar
      )}
    >
      {/* Toggle bar */}
      <button
        type="button"
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between px-3 py-1.5 bg-card border-t-2 border-foreground/20"
      >
        <span className="retro text-[7px] text-muted-foreground">
          {store.expanded ? "v Chat" : "> Chat"}
        </span>
        <div className="flex gap-2">
          {biomeCount > 0 && (
            <Badge variant="outline" className="text-[5px] px-1 py-0">
              L:{biomeCount}
            </Badge>
          )}
          {guildCount > 0 && hasGuild && (
            <Badge variant="outline" className="text-[5px] px-1 py-0">
              G:{guildCount}
            </Badge>
          )}
          {whisperCount > 0 && (
            <Badge variant="outline" className="text-[5px] px-1 py-0 text-purple-400">
              W:{whisperCount}
            </Badge>
          )}
        </div>
      </button>

      {/* Expanded chat panel */}
      {store.expanded && (
        <div className="bg-card border-t border-foreground/10">
          {/* Tabs */}
          <div className="flex border-b border-foreground/10">
            <TabButton
              label="Local"
              active={store.activeTab === "local"}
              onClick={() => setTab("local")}
            />
            {hasGuild && (
              <TabButton
                label="Guild"
                active={store.activeTab === "guild"}
                onClick={() => setTab("guild")}
              />
            )}
            <TabButton
              label="Whisper"
              active={store.activeTab === "whisper"}
              onClick={() => setTab("whisper")}
              className="text-purple-400"
            />
          </div>

          {/* Whisper partner selector */}
          {store.activeTab === "whisper" && whisperPartners.length > 0 && (
            <div className="flex gap-1 px-2 py-1 overflow-x-auto border-b border-foreground/5">
              {whisperPartners.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    chatStore.whisperTarget = name;
                    notify();
                  }}
                  className={cn(
                    "retro text-[6px] px-2 py-0.5 rounded shrink-0 transition-colors",
                    store.whisperTarget === name
                      ? "bg-purple-500/20 text-purple-300"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="h-32 overflow-y-auto px-2 py-1 space-y-0.5">
            {activeMessages.length === 0 && (
              <p className="retro text-[6px] text-muted-foreground text-center py-4">
                {store.activeTab === "local" && "No messages in this biome yet. Say hello!"}
                {store.activeTab === "guild" && "No guild messages yet."}
                {store.activeTab === "whisper" &&
                  (store.whisperTarget
                    ? `No messages with ${store.whisperTarget} yet.`
                    : "Use /whisper <name> <message> to start a conversation.")}
              </p>
            )}
            {activeMessages.map((msg) => (
              <ChatMessage
                key={String(msg.id)}
                msg={msg}
                isWhisper={store.activeTab === "whisper"}
                isOwnMessage={
                  identityOrNull
                    ? msg.authorId.toHexString() === identityOrNull.toHexString()
                    : false
                }
              />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-1.5 px-2 py-1.5 border-t border-foreground/10">
            <Input
              id={inputId}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={getPlaceholder(store.activeTab, store.whisperTarget)}
              className="text-[7px] flex-1 h-7"
              maxLength={500}
            />
            <Button size="sm" className="text-[6px] h-7 px-2 shrink-0" onClick={handleSend}>
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──

function TabButton({
  label,
  active,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "retro text-[7px] px-3 py-1.5 transition-colors",
        active
          ? "text-primary border-b-2 border-primary"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {label}
    </button>
  );
}

function ChatMessage({
  msg,
  isWhisper,
  isOwnMessage,
}: {
  msg: MessageRow;
  isWhisper: boolean;
  isOwnMessage: boolean;
}) {
  const isSystem = msg.authorName === "System";

  if (isSystem) {
    return <p className="retro text-[6px] text-amber-400/70 text-center italic">{msg.text}</p>;
  }

  return (
    <p className="retro text-[6px]">
      {isWhisper && <span className="text-purple-400/60">{isOwnMessage ? "To " : "From "}</span>}
      <span className={cn(isWhisper ? "text-purple-400" : "text-primary")}>
        {isWhisper && isOwnMessage ? msg.recipientName : msg.authorName}
      </span>
      <span className="text-muted-foreground">: {msg.text}</span>
    </p>
  );
}

// ── Helpers ──

function getActiveMessages(
  tab: ChatTab,
  biome: readonly MessageRow[],
  guild: readonly MessageRow[],
  whisper: readonly MessageRow[],
  whisperTarget: string | null,
  identity: { toHexString(): string } | null,
): MessageRow[] {
  switch (tab) {
    case "local":
      return sortByTimestamp(biome);
    case "guild":
      return sortByTimestamp(guild);
    case "whisper": {
      if (!whisperTarget || !identity) return sortByTimestamp(whisper);
      const myHex = identity.toHexString();
      return sortByTimestamp(
        whisper.filter(
          (m) =>
            m.authorId.toHexString() === myHex
              ? m.recipientName === whisperTarget // sent: use stored recipientName
              : m.authorName === whisperTarget, // received: use authorName
        ),
      );
    }
    default:
      return [];
  }
}

function sortByTimestamp(messages: readonly MessageRow[]): MessageRow[] {
  return [...messages].sort((a, b) => {
    const ta = a.timestamp.toMillis();
    const tb = b.timestamp.toMillis();
    if (ta < tb) return -1;
    if (ta > tb) return 1;
    return 0;
  });
}

function getWhisperPartners(
  whispers: readonly MessageRow[],
  identity: { toHexString(): string } | null,
): string[] {
  if (!identity) return [];
  const myHex = identity.toHexString();
  const partners = new Set<string>();
  for (const m of whispers) {
    if (m.authorId.toHexString() === myHex) {
      if (m.recipientName) partners.add(m.recipientName); // ← was nameMap lookup
    } else {
      partners.add(m.authorName ?? "Unknown");
    }
  }
  return Array.from(partners).sort();
}

function getPlaceholder(tab: ChatTab, whisperTarget: string | null): string {
  switch (tab) {
    case "local":
      return "Say something... (/w name msg to whisper)";
    case "guild":
      return "Guild chat... (/w name msg to whisper)";
    case "whisper":
      return whisperTarget ? `Whisper to ${whisperTarget}...` : "/whisper <name> <message>";
  }
}
