import { useState } from "react";
import { useNavigate } from "react-router";
import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";
import { tables, reducers } from "@/generated";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { Input } from "@/components/ui/8bit/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/8bit/dialog";
import { useMyPlayer } from "@/hooks/useStdbPlayer";
import { openChat } from "@/components/game/ChatPanel";
import { BIOME_META, ALL_BIOMES } from "@/lib/biomeThemes";
import { RAID_BOSSES } from "@/lib/bossDefinitions";
import { CLASS_SPRITES } from "@/lib/types";
import { asset, cn } from "@/lib/utils";

// ── Role colors & labels ──────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  Leader: "text-amber-400",
  Officer: "text-blue-400",
  Member: "text-muted-foreground",
};

const ROLE_LABELS: Record<string, string> = {
  Leader: "Leader",
  Officer: "Officer",
  Member: "Member",
};

// ── Helpers to join guild members with player data ─────────────

interface GuildMemberDisplay {
  playerId: { toHexString(): string; isEqual(other: any): boolean };
  name: string;
  playerClass: string;
  level: number;
  role: string;
  online: boolean;
}

function buildMemberList(
  memberRows: readonly any[],
  allPlayers: readonly any[],
): GuildMemberDisplay[] {
  const playerMap = new Map<string, any>();
  for (const p of allPlayers) {
    playerMap.set(p.identity.toHexString(), p);
  }

  return memberRows.map((m) => {
    const p = playerMap.get(m.playerId.toHexString());
    return {
      playerId: m.playerId,
      name: p?.name || "Unknown",
      playerClass: p?.characterClass?.tag ?? "Unclassed",
      level: p?.level ?? 1,
      role: m.role.tag,
      online: p?.online ?? false,
    };
  });
}

// ── Main Page ─────────────────────────────────────────────────

export function GuildPage() {
  const [guildRows] = useTable(tables.my_guild);
  const guild = guildRows[0] ?? null;

  return (
    <div className="space-y-6">
      <h1 className="retro text-sm text-center text-foreground">Guild Hall</h1>
      {guild ? <GuildView guild={guild} /> : <NoGuildView />}
    </div>
  );
}

// ── No Guild — Browse / Create ────────────────────────────────

function NoGuildView() {
  const [showCreate, setShowCreate] = useState(false);
  const [browseRows] = useTable(tables.browse_guilds);
  const joinGuildReducer = useReducer(reducers.joinGuild);

  return (
    <>
      <Card>
        <CardContent className="py-4 text-center">
          <span className="text-3xl block mb-2">🏰</span>
          <p className="retro text-[8px] text-muted-foreground">
            You are not in a guild. Create your own or join an existing one!
          </p>
          <Button className="mt-3 text-[8px]" onClick={() => setShowCreate(true)}>
            Create Guild
          </Button>
        </CardContent>
      </Card>

      {/* Browse guilds */}
      <div className="space-y-2">
        <h2 className="retro text-[10px] text-foreground">Available Guilds</h2>
        {browseRows.map((g: any) => (
          <Card key={String(g.id)}>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="retro text-[9px] text-foreground">{g.name}</span>
                    <Badge variant="outline" className="text-[5px]">
                      [{g.tag}]
                    </Badge>
                  </div>
                  <p className="retro text-[6px] text-muted-foreground mt-0.5">{g.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="retro text-[6px] text-muted-foreground">
                      👥 {g.memberCount}/{g.maxMembers}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[6px] shrink-0"
                  disabled={g.memberCount >= g.maxMembers}
                  onClick={() => void joinGuildReducer({ guildId: g.id })}
                >
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {browseRows.length === 0 && (
          <p className="retro text-[7px] text-muted-foreground text-center py-4">
            No guilds available. Be the first to create one!
          </p>
        )}
      </div>

      <CreateGuildDialog open={showCreate} onOpenChange={setShowCreate} />
    </>
  );
}

// ── Create Guild Dialog ───────────────────────────────────────

function CreateGuildDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [desc, setDesc] = useState("");
  const createGuildReducer = useReducer(reducers.createGuild);

  const canCreate = name.trim().length >= 3 && tag.trim().length >= 2;

  function handleCreate() {
    if (!canCreate) return;
    void createGuildReducer({
      name: name.trim(),
      tag: tag.trim(),
      description: desc.trim(),
    });
    onOpenChange(false);
    setName("");
    setTag("");
    setDesc("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xs">Create Guild</DialogTitle>
          <DialogDescription className="retro text-[7px]">
            Found your own guild! Minimum 3 characters for name, 2 for tag.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="retro text-[7px] text-muted-foreground block mb-1">Guild Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Iron Wolves"
              className="text-[8px]"
              maxLength={24}
            />
          </div>
          <div>
            <label className="retro text-[7px] text-muted-foreground block mb-1">
              Tag (2-4 chars)
            </label>
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value.toUpperCase())}
              placeholder="IW"
              className="text-[8px]"
              maxLength={4}
            />
          </div>
          <div>
            <label className="retro text-[7px] text-muted-foreground block mb-1">Description</label>
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Warriors forged in iron..."
              className="text-[8px]"
              maxLength={80}
            />
          </div>
          <Button className="w-full text-[8px]" disabled={!canCreate} onClick={handleCreate}>
            Found Guild
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Guild View — Members, Chat, Actions ───────────────────────

function GuildView({ guild }: { guild: any }) {
  const { identity } = useSpacetimeDB();
  const [memberRows] = useTable(tables.my_guild_members);
  const [allPlayers] = useTable(tables.player);
  const leaveGuildReducer = useReducer(reducers.leaveGuild);
  const promoteReducer = useReducer(reducers.promoteMember);
  const kickReducer = useReducer(reducers.kickMember);

  const members = buildMemberList(memberRows, allPlayers);
  const myHex = identity?.toHexString();
  const myMember = members.find((m) => m.playerId.toHexString() === myHex);
  const isLeader = myMember?.role === "Leader";
  const isOfficer = isLeader || myMember?.role === "Officer";

  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder: Record<string, number> = { Leader: 0, Officer: 1, Member: 2 };
    return (roleOrder[a.role] ?? 2) - (roleOrder[b.role] ?? 2);
  });

  return (
    <>
      {/* Guild header */}
      <Card>
        <CardContent className="py-3 text-center">
          <span className="text-3xl block mb-1">🏰</span>
          <div className="flex items-center justify-center gap-2">
            <h2 className="retro text-sm text-foreground">{guild.name}</h2>
            <Badge variant="outline" className="text-[6px]">
              [{guild.tag}]
            </Badge>
          </div>
          {guild.description && (
            <p className="retro text-[7px] text-muted-foreground mt-1 italic">
              &quot;{guild.description}&quot;
            </p>
          )}
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="retro text-[7px] text-muted-foreground">
              👥 {members.length}/{guild.maxMembers}
            </span>
            <span className="retro text-[7px] text-muted-foreground">
              🟢 {members.filter((m) => m.online).length} online
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Member list */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-[9px]">Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedMembers.map((m) => (
              <div key={m.playerId.toHexString()} className="flex items-center gap-2">
                <img
                  src={asset(CLASS_SPRITES[m.playerClass as keyof typeof CLASS_SPRITES])}
                  alt={m.playerClass}
                  className="pixelated w-6 h-6"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "retro text-[8px]",
                        m.online ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {m.name}
                    </span>
                    {m.online && <span className="text-[6px]">🟢</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "retro text-[6px]",
                        ROLE_COLORS[m.role] ?? "text-muted-foreground",
                      )}
                    >
                      {ROLE_LABELS[m.role] ?? m.role}
                    </span>
                    <span className="retro text-[6px] text-muted-foreground">
                      Lv.{m.level} {m.playerClass}
                    </span>
                  </div>
                </div>
                {/* Leader/officer actions */}
                {isOfficer && m.playerId.toHexString() !== myHex && m.role === "Member" && (
                  <div className="flex gap-1 shrink-0">
                    {isLeader && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[5px] px-1.5"
                        onClick={() => void promoteReducer({ targetPlayerId: m.playerId } as any)}
                      >
                        Promote
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[5px] px-1.5 text-red-400"
                      onClick={() => void kickReducer({ targetPlayerId: m.playerId } as any)}
                    >
                      Kick
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guild chat — opens global chat panel */}
      <Button variant="outline" className="w-full text-[8px]" onClick={() => openChat("guild")}>
        Open Guild Chat
      </Button>

      {/* Raid bosses */}
      <RaidSection memberCount={members.length} />

      {/* Leave guild */}
      <Button
        variant="outline"
        className="w-full text-[8px] text-red-400"
        onClick={() => void leaveGuildReducer()}
      >
        Leave Guild
      </Button>
    </>
  );
}

// ── Raid Section ─────────────────────────────────────────────

function RaidSection({ memberCount }: { memberCount: number }) {
  const navigate = useNavigate();
  const canRaid = memberCount >= 3;
  const { player } = useMyPlayer();
  const unlockedBiomes = new Set(player?.unlockedBiomes ?? ["plains"]);

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-[9px]">⚔️ Raid Bosses</CardTitle>
      </CardHeader>
      <CardContent>
        {!canRaid ? (
          <p className="retro text-[7px] text-muted-foreground text-center py-2">
            Need {3 - memberCount} more member(s) to unlock raids.
          </p>
        ) : (
          <div className="space-y-2">
            {ALL_BIOMES.filter((b) => unlockedBiomes.has(b)).map((biomeId) => {
              const boss = RAID_BOSSES[biomeId];
              const meta = BIOME_META[biomeId];
              return (
                <div key={biomeId} className="flex items-center gap-2">
                  <span className="text-lg">{boss.sprite}</span>
                  <div className="flex-1 min-w-0">
                    <span className="retro text-[7px] text-foreground">{boss.name}</span>
                    <p className="retro text-[5px] text-muted-foreground">{meta.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[6px] shrink-0"
                    onClick={() => navigate(`/raid/${biomeId}`)}
                  >
                    Challenge
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
