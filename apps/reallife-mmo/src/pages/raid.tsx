import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import HealthBar from "@/components/ui/8bit/health-bar";
import { useGuildStore, PLAYER_SPELLS_RAID } from "@/lib/guildStore";
import { useGameStore } from "@/lib/gameStore";
import { RAID_BOSSES } from "@/lib/bossDefinitions";
import { BIOME_META, type BiomeId } from "@/lib/biomeThemes";
import { CLASS_SPRITES } from "@/lib/types";
import { spellEmoji } from "@/lib/combatEngine";
import { asset } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function RaidPage() {
  const { biomeId } = useParams<{ biomeId: string }>();
  const navigate = useNavigate();
  const guild = useGuildStore((s) => s.guild);
  const startRaid = useGuildStore((s) => s.startRaid);
  const raidCastSpell = useGuildStore((s) => s.raidCastSpell);
  const abandonRaid = useGuildStore((s) => s.abandonRaid);
  const grantPveRewards = useGameStore((s) => s.grantPveRewards);
  const player = useGameStore((s) => s.player);
  const logRef = useRef<HTMLDivElement>(null);

  const bid = biomeId as BiomeId;
  const boss = RAID_BOSSES[bid];
  const meta = BIOME_META[bid];
  const raid = guild?.activeRaid;

  // Auto-scroll combat log
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [raid?.log.length]);

  if (!boss || !meta || !guild) {
    return (
      <div className="text-center py-8">
        <p className="retro text-[8px] text-muted-foreground">No guild or invalid biome.</p>
        <Button className="mt-4 text-[8px]" onClick={() => navigate("/guild")}>
          Back to Guild
        </Button>
      </div>
    );
  }

  // No active raid — show lobby
  if (!raid) {
    const canStart = guild.members.length >= 3;
    return (
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <span className="text-4xl block">{boss.sprite}</span>
          <h2 className="retro text-sm text-foreground">{boss.name}</h2>
          <p className="retro text-[7px] text-muted-foreground">{meta.name} Raid Boss</p>
        </div>

        <Card>
          <CardContent className="py-3">
            <p className="retro text-[8px] text-muted-foreground italic text-center">
              "{boss.intro}"
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-[9px]">Boss Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">Mechanic</span>
              <span className="retro text-[7px] text-foreground">{boss.mechanic}</span>
            </div>
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">Scaled HP</span>
              <span className="retro text-[7px] text-foreground">
                {boss.baseHp + boss.perMemberHp * guild.members.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">Rewards</span>
              <span className="retro text-[7px] text-amber-400">
                {boss.xpReward} XP · {boss.goldReward}g · {boss.loot.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">Guild Members</span>
              <span className="retro text-[7px] text-foreground">{guild.members.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Abilities preview */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-[9px]">Boss Abilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {boss.abilities.map((a) => (
              <div key={a.id} className="flex items-center gap-2">
                <span className="text-sm">{spellEmoji(a.element)}</span>
                <span className="retro text-[7px] text-foreground flex-1">{a.name}</span>
                <Badge variant="outline" className="text-[5px]">
                  {a.damage} dmg{a.isAoe ? " AoE" : ""}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button className="w-full text-[8px]" disabled={!canStart} onClick={() => startRaid(bid)}>
          {canStart ? "Begin Raid!" : `Need ${3 - guild.members.length} more members`}
        </Button>
        <Button variant="outline" className="w-full text-[8px]" onClick={() => navigate("/guild")}>
          Back to Guild
        </Button>
      </div>
    );
  }

  // Active raid — combat view
  const currentCombatant = raid.combatants[raid.currentTurnIndex];
  const isPlayerTurn = currentCombatant?.name === (player.name || "Hero");
  const bossHpPct = Math.round((raid.bossHp / raid.bossMaxHp) * 100);

  // Victory screen
  if (raid.phase === "victory") {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2 py-4">
          <span className="text-4xl block">🎉</span>
          <h2 className="retro text-sm text-amber-400">Victory!</h2>
          <p className="retro text-[8px] text-foreground">{boss.name} has been defeated!</p>
        </div>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-[9px]">Rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">XP</span>
              <span className="retro text-[7px] text-green-400">+{boss.xpReward}</span>
            </div>
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">Gold</span>
              <span className="retro text-[7px] text-amber-400">+{boss.goldReward}g</span>
            </div>
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">Loot</span>
              <span className="retro text-[7px] text-purple-400">{boss.loot.name}</span>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full text-[8px]"
          onClick={() => {
            grantPveRewards(boss.xpReward, [boss.loot]);
            abandonRaid();
            void navigate("/guild");
          }}
        >
          Claim Rewards & Return
        </Button>
      </div>
    );
  }

  // Defeat screen
  if (raid.phase === "defeat") {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2 py-4">
          <span className="text-4xl block">💀</span>
          <h2 className="retro text-sm text-red-400">Defeat</h2>
          <p className="retro text-[8px] text-muted-foreground">
            Your guild was wiped by {boss.name}...
          </p>
          <p className="retro text-[7px] text-muted-foreground">
            Boss HP remaining: {raid.bossHp}/{raid.bossMaxHp}
          </p>
        </div>
        <Button
          className="w-full text-[8px]"
          onClick={() => {
            abandonRaid();
            void navigate("/guild");
          }}
        >
          Return to Guild
        </Button>
      </div>
    );
  }

  // Fighting phase
  return (
    <div className="space-y-3">
      {/* Boss header */}
      <div className="text-center space-y-1">
        <span className="text-3xl block">{boss.sprite}</span>
        <h2 className="retro text-[10px] text-foreground">{boss.name}</h2>
        <HealthBar value={bossHpPct} variant="retro" className="h-2 mx-8" />
        <p className="retro text-[6px] text-muted-foreground">
          {raid.bossHp}/{raid.bossMaxHp} HP
        </p>
      </div>

      {/* Party status */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-[8px]">Party</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {raid.combatants.map((c, i) => {
              const hpPct = Math.round((c.hp / c.maxHp) * 100);
              const isActive = i === raid.currentTurnIndex;
              return (
                <div
                  key={c.name}
                  className={cn(
                    "border border-border p-1.5 rounded",
                    c.ko && "opacity-40",
                    isActive && "border-primary ring-1 ring-primary",
                  )}
                >
                  <div className="flex items-center gap-1">
                    <img
                      src={asset(CLASS_SPRITES[c.playerClass as keyof typeof CLASS_SPRITES])}
                      alt={c.playerClass}
                      className="pixelated w-4 h-4"
                    />
                    <span className="retro text-[6px] truncate">{c.name}</span>
                    {c.ko && <span className="text-[6px]">💀</span>}
                  </div>
                  <HealthBar value={hpPct} variant="retro" className="h-1 mt-0.5" />
                  <div className="flex justify-between mt-0.5">
                    <span className="retro text-[5px] text-muted-foreground">
                      {c.hp}/{c.maxHp}
                    </span>
                    <span className="retro text-[5px] text-blue-400">
                      {c.mana}/{c.maxMana} MP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Combat log */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-[8px]">Combat Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={logRef}
            className="h-20 overflow-y-auto space-y-0.5 bg-muted/20 border border-border p-1.5"
          >
            {raid.log.slice(-15).map((entry) => (
              <p key={entry.id} className="retro text-[5px]">
                <span className={entry.caster === boss.name ? "text-red-400" : "text-primary"}>
                  {entry.caster}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  → {spellEmoji(entry.element)} {entry.spellName} →{" "}
                </span>
                <span className="text-foreground">{entry.target}</span>
                <span className={entry.isHeal ? "text-green-400" : "text-red-300"}>
                  {" "}
                  {entry.isHeal ? "+" : "-"}
                  {entry.damage}
                </span>
              </p>
            ))}
            {raid.log.length === 0 && (
              <p className="retro text-[5px] text-muted-foreground text-center">Combat begins...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spell selection — only for player's turn */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-[8px]">
            {isPlayerTurn
              ? "Your Turn — Choose a Spell"
              : `${currentCombatant?.name ?? "..."}'s Turn`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPlayerTurn ? (
            <div className="grid grid-cols-2 gap-2">
              {PLAYER_SPELLS_RAID.map((spell) => {
                const canCast = (currentCombatant?.mana ?? 0) >= spell.manaCost;
                return (
                  <Button
                    key={spell.id}
                    size="sm"
                    variant={spell.isHeal ? "outline" : "default"}
                    className="text-[6px] justify-start gap-1"
                    disabled={!canCast}
                    onClick={() => raidCastSpell(spell.id)}
                  >
                    {spellEmoji(spell.element)} {spell.name}
                    {spell.manaCost > 0 && (
                      <span className="text-blue-400 ml-auto">{spell.manaCost}mp</span>
                    )}
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="retro text-[7px] text-muted-foreground">
                Waiting for {currentCombatant?.name}...
              </p>
              <Button
                size="sm"
                className="mt-2 text-[6px]"
                onClick={() => {
                  // Auto-play NPC turn — pick highest damage affordable spell
                  const mana = currentCombatant?.mana ?? 0;
                  const affordable = PLAYER_SPELLS_RAID.filter(
                    (s) => s.manaCost <= mana && !s.isHeal,
                  );
                  const best = affordable.sort((a, b) => b.damage - a.damage)[0];
                  raidCastSpell(best?.id ?? "r-slash");
                }}
              >
                Auto (NPC Turn)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full text-[7px] text-red-400"
        onClick={() => {
          abandonRaid();
          void navigate("/guild");
        }}
      >
        Retreat (Abandon Raid)
      </Button>
    </div>
  );
}
