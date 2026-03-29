import { useState, useMemo } from "react";
import { useTable, useSpacetimeDB } from "spacetimedb/react";
import { tables } from "@/generated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/8bit/tabs";
import { Badge } from "@/components/ui/8bit/badge";
import { NPC_PLAYERS } from "@/lib/npcPlayers";
import { CLASS_SPRITES, CLASS_COLORS, type StatName } from "@/lib/types";
import { asset, cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  name: string;
  level: number;
  playerClass: string;
  value: number;
  isPlayer: boolean;
  guildName?: string;
  online?: boolean;
}

const STAT_KEYS: Record<StatName, string> = {
  STR: "strength",
  AGI: "agility",
  INT: "intelligence",
  CON: "constitution",
  WIS: "wisdom",
  CHA: "charisma",
  MP: "mana",
};

const STAT_TABS: StatName[] = ["STR", "AGI", "INT", "CON", "WIS", "CHA"];

export function Leaderboard() {
  const { identity } = useSpacetimeDB();
  const [leaderboardRows] = useTable(tables.leaderboard);
  const [guildRows] = useTable(tables.my_guild);
  const [memberRows] = useTable(tables.my_guild_members);
  const [allGuildMembers] = useTable(tables.guildMember);
  const [allGuilds] = useTable(tables.guild);
  const guild = guildRows[0] ?? null;
  const [tab, setTab] = useState("level");
  const [statTab, setStatTab] = useState<StatName>("STR");

  const myHex = identity?.toHexString();

  // Build guild lookup: playerIdentityHex -> guildName
  const guildNameByPlayer = useMemo(() => {
    const guildMap = new Map<bigint, string>();
    for (const g of allGuilds) {
      guildMap.set(g.id, g.name);
    }
    const playerGuild = new Map<string, string>();
    for (const m of allGuildMembers) {
      const gName = guildMap.get(m.guildId);
      if (gName) {
        playerGuild.set(m.playerId.toHexString(), gName);
      }
    }
    return playerGuild;
  }, [allGuilds, allGuildMembers]);

  // Build entries from SpacetimeDB leaderboard view
  const realPlayers: LeaderboardEntry[] = leaderboardRows.map((row) => {
    const hex = row.identity?.toHexString();
    return {
      id: hex ?? `player-${row.name}`,
      name: row.name || "Anonymous",
      level: row.level,
      playerClass: (row.characterClass as { tag: string })?.tag ?? "Unclassed",
      value: row.level,
      isPlayer: hex === myHex,
      guildName: hex ? guildNameByPlayer.get(hex) : undefined,
      online: row.online,
    };
  });

  // Collect real player names to deduplicate against NPCs
  const realPlayerNames = new Set(realPlayers.map((p) => p.name.toLowerCase()));

  // Only add NPCs if we have fewer than 10 real players, excluding NPCs whose name matches a real player
  const npcEntries: LeaderboardEntry[] =
    realPlayers.length < 10
      ? NPC_PLAYERS.filter((npc) => !realPlayerNames.has(npc.name.toLowerCase())).map((npc) => ({
          id: `npc-${npc.name}`,
          name: npc.name,
          level: npc.level,
          playerClass: npc.playerClass,
          value: npc.level,
          isPlayer: false,
          guildName: npc.guildName,
        }))
      : [];

  const levelBoard = [...realPlayers, ...npcEntries].sort((a, b) => b.value - a.value);

  // Stat board
  const statBoard = [
    ...leaderboardRows.map((row) => {
      const hex = row.identity?.toHexString();
      const statValue = row[STAT_KEYS[statTab] as keyof typeof row] as number;
      return {
        id: hex ?? `player-${row.name}`,
        name: row.name || "Anonymous",
        level: row.level,
        playerClass: (row.characterClass as { tag: string })?.tag ?? "Unclassed",
        value: Math.round((statValue ?? 0) * 10) / 10,
        isPlayer: hex === myHex,
        guildName: hex ? guildNameByPlayer.get(hex) : undefined,
        online: row.online,
      };
    }),
    ...(realPlayers.length < 10
      ? NPC_PLAYERS.filter((npc) => !realPlayerNames.has(npc.name.toLowerCase())).map((npc) => ({
          id: `npc-${npc.name}`,
          name: npc.name,
          level: npc.level,
          playerClass: npc.playerClass,
          value: Math.round(npc.stats[statTab] * 10) / 10,
          isPlayer: false,
          guildName: npc.guildName,
        }))
      : []),
  ].sort((a, b) => b.value - a.value);

  const onlineCount = realPlayers.filter((p) => p.online).length;

  return (
    <div className="space-y-4">
      <h1 className="retro text-sm text-center text-foreground">Leaderboard</h1>

      {/* Guild rank banner */}
      {guild && (
        <Card>
          <CardContent className="py-2 flex items-center justify-center gap-2">
            <span className="text-sm">🏰</span>
            <span className="retro text-[8px] text-foreground">{guild.name}</span>
            <Badge variant="outline" className="text-[5px]">
              {memberRows.length} members
            </Badge>
            <Badge variant="outline" className="text-[5px] text-amber-400">
              {guild.raidWins ?? 0} raid wins
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Online player count */}
      <div className="flex justify-center">
        <Badge variant="outline" className="text-[6px] text-green-400">
          {onlineCount} {onlineCount === 1 ? "player" : "players"} online
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="level" className="flex-1 text-[7px]">
            Level
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex-1 text-[7px]">
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="level" className="mt-2">
          <RankList entries={levelBoard} label="Level" />
        </TabsContent>

        <TabsContent value="stats" className="mt-2 space-y-2">
          <div className="flex gap-1 justify-center flex-wrap">
            {STAT_TABS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatTab(s)}
                className={cn(
                  "retro text-[7px] px-2 py-1 border border-border transition-colors",
                  statTab === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <RankList entries={statBoard} label={statTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RankList({ entries, label }: { entries: LeaderboardEntry[]; label: string }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-[9px]">Top Players — {label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {entries.map((entry, i) => {
            const rank = i + 1;
            const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
            return (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-2 py-1 px-2",
                  entry.isPlayer && "bg-primary/10 border border-primary/30",
                  rank <= 3 && !entry.isPlayer && "bg-muted/30",
                )}
              >
                <span className="retro text-[8px] w-5 text-center text-muted-foreground">
                  {medal ?? `#${rank}`}
                </span>
                <div className="relative">
                  <img
                    src={asset(CLASS_SPRITES[entry.playerClass as keyof typeof CLASS_SPRITES])}
                    alt={entry.playerClass}
                    className="pixelated w-5 h-5"
                  />
                  {entry.online !== undefined && (
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full",
                        entry.online ? "bg-green-500" : "bg-muted-foreground/40",
                      )}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "retro text-[7px] truncate",
                        entry.isPlayer ? "text-primary" : "text-foreground",
                      )}
                    >
                      {entry.name}
                      {entry.isPlayer && " (You)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "retro text-[5px]",
                        CLASS_COLORS[entry.playerClass as keyof typeof CLASS_COLORS],
                      )}
                    >
                      {entry.playerClass}
                    </span>
                    {entry.guildName && (
                      <span className="retro text-[5px] text-muted-foreground">
                        [{entry.guildName}]
                      </span>
                    )}
                  </div>
                </div>
                <span className="retro text-[9px] text-amber-400 shrink-0">{entry.value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
