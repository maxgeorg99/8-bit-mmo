import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/8bit/tabs";
import { Badge } from "@/components/ui/8bit/badge";
import { useGameStore } from "@/lib/gameStore";
import { useGuildStore } from "@/lib/guildStore";
import { NPC_PLAYERS } from "@/lib/npcPlayers";
import { CLASS_SPRITES, CLASS_COLORS, type StatName } from "@/lib/types";
import { asset, cn } from "@/lib/utils";

interface LeaderboardEntry {
  name: string;
  level: number;
  playerClass: string;
  value: number;
  isPlayer: boolean;
  guildName?: string;
}

function buildLevelBoard(
  playerName: string,
  playerLevel: number,
  playerClass: string,
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = NPC_PLAYERS.map((npc) => ({
    name: npc.name,
    level: npc.level,
    playerClass: npc.playerClass,
    value: npc.level,
    isPlayer: false,
    guildName: npc.guildName,
  }));
  entries.push({
    name: playerName || "You",
    level: playerLevel,
    playerClass,
    value: playerLevel,
    isPlayer: true,
  });
  return entries.sort((a, b) => b.value - a.value);
}

function buildStatBoard(
  stat: StatName,
  playerName: string,
  playerLevel: number,
  playerClass: string,
  playerStatValue: number,
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = NPC_PLAYERS.map((npc) => ({
    name: npc.name,
    level: npc.level,
    playerClass: npc.playerClass,
    value: Math.round(npc.stats[stat] * 10) / 10,
    isPlayer: false,
    guildName: npc.guildName,
  }));
  entries.push({
    name: playerName || "You",
    level: playerLevel,
    playerClass,
    value: Math.round(playerStatValue * 10) / 10,
    isPlayer: true,
  });
  return entries.sort((a, b) => b.value - a.value);
}

const STAT_TABS: StatName[] = ["STR", "AGI", "INT", "CON", "WIS", "CHA"];

export function Leaderboard() {
  const player = useGameStore((s) => s.player);
  const guild = useGuildStore((s) => s.guild);
  const [tab, setTab] = useState("level");
  const [statTab, setStatTab] = useState<StatName>("STR");

  const levelBoard = buildLevelBoard(player.name, player.level, player.playerClass);

  const statBoard = buildStatBoard(
    statTab,
    player.name,
    player.level,
    player.playerClass,
    player.stats[statTab],
  );

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
              {guild.members.length} members
            </Badge>
            <Badge variant="outline" className="text-[5px] text-amber-400">
              {guild.raidWins ?? 0} raid wins
            </Badge>
          </CardContent>
        </Card>
      )}

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
          {/* Stat picker */}
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
                key={entry.name}
                className={cn(
                  "flex items-center gap-2 py-1 px-2",
                  entry.isPlayer && "bg-primary/10 border border-primary/30",
                  rank <= 3 && !entry.isPlayer && "bg-muted/30",
                )}
              >
                <span className="retro text-[8px] w-5 text-center text-muted-foreground">
                  {medal ?? `#${rank}`}
                </span>
                <img
                  src={asset(CLASS_SPRITES[entry.playerClass as keyof typeof CLASS_SPRITES])}
                  alt={entry.playerClass}
                  className="pixelated w-5 h-5"
                />
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
