import { useRef, useState } from "react";
import { useNavigate } from "react-router";
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
import { useGuildStore } from "@/lib/guildStore";
import { useGameStore } from "@/lib/gameStore";
import { BIOME_META, ALL_BIOMES } from "@/lib/biomeThemes";
import { RAID_BOSSES } from "@/lib/bossDefinitions";
import { CLASS_SPRITES } from "@/lib/types";
import type { Guild, GuildMember } from "@/lib/types";
import { asset } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ── Role colors & labels ──────────────────────────────────────

const ROLE_COLORS: Record<GuildMember["role"], string> = {
  leader: "text-amber-400",
  officer: "text-blue-400",
  member: "text-muted-foreground",
};

const ROLE_LABELS: Record<GuildMember["role"], string> = {
  leader: "Leader",
  officer: "Officer",
  member: "Member",
};

// ── Main Page ─────────────────────────────────────────────────

export function GuildPage() {
  const guild = useGuildStore((s) => s.guild);

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
  const browseGuilds = useGuildStore((s) => s.browseGuilds);
  const joinGuild = useGuildStore((s) => s.joinGuild);
  const player = useGameStore((s) => s.player);

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
        {browseGuilds.map((g) => (
          <Card key={g.id}>
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
                      👥 {g.members.length}/{g.maxMembers}
                    </span>
                    <span className="retro text-[6px] text-muted-foreground">
                      🟢 {g.members.filter((m) => m.online).length} online
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[6px] shrink-0"
                  disabled={g.members.length >= g.maxMembers}
                  onClick={() => joinGuild(g.id, player.name, player.playerClass, player.level)}
                >
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {browseGuilds.length === 0 && (
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
  const createGuild = useGuildStore((s) => s.createGuild);
  const player = useGameStore((s) => s.player);

  const canCreate = name.trim().length >= 3 && tag.trim().length >= 2;

  function handleCreate() {
    if (!canCreate) return;
    createGuild(
      name.trim(),
      tag.trim(),
      desc.trim(),
      player.name,
      player.playerClass,
      player.level,
    );
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

function GuildView({ guild }: { guild: Guild }) {
  const player = useGameStore((s) => s.player);
  const leaveGuild = useGuildStore((s) => s.leaveGuild);
  const sendMessage = useGuildStore((s) => s.sendMessage);
  const promoteMember = useGuildStore((s) => s.promoteMember);
  const kickMember = useGuildStore((s) => s.kickMember);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const myMember = guild.members.find((m) => m.name === (player.name || "Hero"));
  const isLeader = myMember?.role === "leader";
  const isOfficer = myMember?.role === "leader" || myMember?.role === "officer";
  const sortedMembers = [...guild.members].sort((a, b) => {
    const roleOrder = { leader: 0, officer: 1, member: 2 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  function handleSend() {
    const text = chatInput.trim();
    if (!text) return;
    sendMessage(player.name || "Hero", text);
    setChatInput("");
    // Scroll to bottom after a tick
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

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
              "{guild.description}"
            </p>
          )}
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="retro text-[7px] text-muted-foreground">
              👥 {guild.members.length}/{guild.maxMembers}
            </span>
            <span className="retro text-[7px] text-muted-foreground">
              🟢 {guild.members.filter((m) => m.online).length} online
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
              <div key={m.name} className="flex items-center gap-2">
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
                    <span className={cn("retro text-[6px]", ROLE_COLORS[m.role])}>
                      {ROLE_LABELS[m.role]}
                    </span>
                    <span className="retro text-[6px] text-muted-foreground">
                      Lv.{m.level} {m.playerClass}
                    </span>
                  </div>
                </div>
                {/* Leader/officer actions */}
                {isOfficer && m.name !== (player.name || "Hero") && m.role === "member" && (
                  <div className="flex gap-1 shrink-0">
                    {isLeader && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[5px] px-1.5"
                        onClick={() => promoteMember(m.name)}
                      >
                        Promote
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[5px] px-1.5 text-red-400"
                      onClick={() => kickMember(m.name)}
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

      {/* Guild chat */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-[9px]">Guild Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 overflow-y-auto border border-border bg-muted/20 p-2 space-y-1.5 mb-2">
            {guild.messages.map((msg) => {
              const isSystem = msg.authorName === "System";
              return (
                <div key={msg.id}>
                  {isSystem ? (
                    <p className="retro text-[6px] text-amber-400/70 text-center italic">
                      {msg.text}
                    </p>
                  ) : (
                    <p className="retro text-[6px]">
                      <span className="text-primary">{msg.authorName}</span>
                      <span className="text-muted-foreground">: {msg.text}</span>
                    </p>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Say something..."
              className="text-[7px] flex-1"
              maxLength={200}
            />
            <Button size="sm" className="text-[6px] shrink-0" onClick={handleSend}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Raid bosses */}
      <RaidSection guild={guild} />

      {/* Leave guild */}
      <Button
        variant="outline"
        className="w-full text-[8px] text-red-400"
        onClick={() => leaveGuild(player.name || "Hero")}
      >
        Leave Guild
      </Button>
    </>
  );
}

// ── Raid Section ─────────────────────────────────────────────

function RaidSection({ guild }: { guild: Guild }) {
  const navigate = useNavigate();
  const canRaid = guild.members.length >= 3;
  const player = useGameStore((s) => s.player);
  const unlockedBiomes = new Set(player.unlockedBiomes);

  // If there's an active raid, show resume button
  if (guild.activeRaid) {
    const boss = RAID_BOSSES[guild.activeRaid.biomeId as keyof typeof RAID_BOSSES];
    return (
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-[9px]">⚔️ Active Raid</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <span className="text-2xl block">{boss?.sprite ?? "⚔️"}</span>
          <p className="retro text-[8px] text-foreground">{boss?.name ?? "Unknown Boss"}</p>
          <p className="retro text-[6px] text-muted-foreground">
            Boss HP: {guild.activeRaid.bossHp}/{guild.activeRaid.bossMaxHp}
          </p>
          <Button
            className="w-full text-[7px]"
            onClick={() => navigate(`/raid/${guild.activeRaid!.biomeId}`)}
          >
            Resume Raid
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-[9px]">⚔️ Raid Bosses</CardTitle>
      </CardHeader>
      <CardContent>
        {!canRaid ? (
          <p className="retro text-[7px] text-muted-foreground text-center py-2">
            Need {3 - guild.members.length} more member(s) to unlock raids.
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
