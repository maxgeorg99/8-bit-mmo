import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";
import { tables, reducers } from "@/generated";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import HealthBar from "@/components/ui/8bit/health-bar";
import { useMyPlayer } from "@/hooks/useStdbPlayer";
import { RAID_BOSSES } from "@/lib/bossDefinitions";
import {
  getBossName,
  getBossIntro,
  getBossMechanic,
  getAbilityName,
  getLogSpellName,
  getLogCombatantName,
} from "@/lib/i18nBoss";
import { getEquipmentName } from "@/lib/i18nEquipment";
import { BIOME_META, type BiomeId } from "@/lib/biomeThemes";
import { CLASS_SPRITES } from "@/lib/types";
import { spellEmoji } from "@/lib/combatEngine";
import { asset, cn } from "@/lib/utils";

// Raid spells available to players (same as before)
const PLAYER_SPELLS_RAID = [
  {
    id: "r-slash",
    name: "Slash",
    i18nKey: "raid.spells.slash",
    element: "Physical",
    damage: 10,
    manaCost: 0,
    isHeal: false,
  },
  {
    id: "r-fireball",
    name: "Fireball",
    i18nKey: "raid.spells.fireball",
    element: "Fire",
    damage: 16,
    manaCost: 10,
    isHeal: false,
  },
  {
    id: "r-heal",
    name: "Heal",
    i18nKey: "raid.spells.heal",
    element: "Heal",
    damage: 14,
    manaCost: 12,
    isHeal: true,
  },
  {
    id: "r-arcane",
    name: "Arcane Bolt",
    i18nKey: "raid.spells.arcaneBolt",
    element: "Arcane",
    damage: 20,
    manaCost: 16,
    isHeal: false,
  },
];

export function RaidPage() {
  const { biomeId } = useParams<{ biomeId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { identity } = useSpacetimeDB();
  const { player: _player } = useMyPlayer();
  const logRef = useRef<HTMLDivElement>(null);

  // SpacetimeDB data
  const [raidRows] = useTable(tables.my_raid);
  const [combatantRows] = useTable(tables.my_raid_combatants);
  const [raidLogRows] = useTable(tables.my_raid_log);
  const [guildRows] = useTable(tables.my_guild);
  const [memberRows] = useTable(tables.my_guild_members);

  // Reducers
  const startRaidReducer = useReducer(reducers.startRaid);
  const raidCastSpellReducer = useReducer(reducers.raidCastSpell);
  const abandonRaidReducer = useReducer(reducers.abandonRaid);
  const grantPveRewardsReducer = useReducer(reducers.grantPveRewards);

  const bid = biomeId as BiomeId;
  const boss = RAID_BOSSES[bid];
  const meta = BIOME_META[bid];
  const hasGuild = guildRows.length > 0;

  // Find active raid (Fighting or Lobby phase)
  const raid = raidRows.find(
    (r) =>
      r.biomeId === bid &&
      (r.phase.tag === "Fighting" || r.phase.tag === "Victory" || r.phase.tag === "Defeat"),
  );

  // Sort combatants by ID for stable turn order
  const combatants = [...combatantRows].sort((a, b) => Number(a.id - b.id));

  // Sort raid logs by ID
  const raidLogs = [...raidLogRows].sort((a, b) => Number(a.id - b.id));

  // Auto-scroll combat log
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [raidLogs.length]);

  if (!boss || !meta || !hasGuild) {
    return (
      <div className="text-center py-8">
        <p className="retro text-[8px] text-muted-foreground">{t("raid.noGuildOrInvalidBiome")}</p>
        <Button className="mt-4 text-[8px]" onClick={() => navigate("/guild")}>
          {t("raid.backToGuild")}
        </Button>
      </div>
    );
  }

  // No active raid — show lobby
  if (!raid) {
    const canStart = memberRows.length >= 3;
    return (
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <span className="text-4xl block">{boss.sprite}</span>
          <h2 className="retro text-sm text-foreground">{getBossName(t, boss)}</h2>
          <p className="retro text-[7px] text-muted-foreground">
            {t("raid.raidBoss", { name: meta.name })}
          </p>
        </div>

        <Card>
          <CardContent className="py-3">
            <p className="retro text-[8px] text-muted-foreground italic text-center">
              &quot;{getBossIntro(t, boss)}&quot;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-[9px]">{t("raid.bossInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">{t("raid.mechanic")}</span>
              <span className="retro text-[7px] text-foreground">{getBossMechanic(t, boss)}</span>
            </div>
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">{t("raid.scaledHp")}</span>
              <span className="retro text-[7px] text-foreground">
                {boss.baseHp + boss.perMemberHp * memberRows.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">{t("common.rewards")}</span>
              <span className="retro text-[7px] text-amber-400">
                {boss.xpReward} XP · {boss.goldReward}g ·{" "}
                {getEquipmentName(t, boss.loot.id, boss.loot.name)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">
                {t("raid.guildMembers")}
              </span>
              <span className="retro text-[7px] text-foreground">{memberRows.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-[9px]">{t("raid.bossAbilities")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {boss.abilities.map((a) => (
              <div key={a.id} className="flex items-center gap-2">
                <span className="text-sm">{spellEmoji(a.element)}</span>
                <span className="retro text-[7px] text-foreground flex-1">
                  {getAbilityName(t, a)}
                </span>
                <Badge variant="outline" className="text-[5px]">
                  {t(a.isAoe ? "raid.dmgAoe" : "raid.dmg", { damage: a.damage })}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button
          className="w-full text-[8px]"
          disabled={!canStart}
          onClick={() => void startRaidReducer({ biomeId: bid })}
        >
          {canStart
            ? t("raid.beginRaid")
            : t("raid.needMoreMembers", { count: 3 - memberRows.length })}
        </Button>
        <Button variant="outline" className="w-full text-[8px]" onClick={() => navigate("/guild")}>
          {t("raid.backToGuild")}
        </Button>
      </div>
    );
  }

  // Active raid — combat view
  const currentCombatant = combatants[raid.currentTurnIndex];
  const myHex = identity?.toHexString();
  const isPlayerTurn = currentCombatant?.playerId?.toHexString() === myHex;
  const bossHpPct = Math.round((raid.bossHp / raid.bossMaxHp) * 100);

  const handleCastSpell = (spell: (typeof PLAYER_SPELLS_RAID)[number]) => {
    void raidCastSpellReducer({
      raidId: raid.id,
      spellName: spell.name,
      spellDamage: spell.damage,
      spellManaCost: spell.manaCost,
      isHeal: spell.isHeal,
      spellElement: spell.element,
    });
  };

  // Victory screen
  if (raid.phase.tag === "Victory") {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2 py-4">
          <span className="text-4xl block">🎉</span>
          <h2 className="retro text-sm text-amber-400">{t("raid.victoryTitle")}</h2>
          <p className="retro text-[8px] text-foreground">
            {t("raid.bossDefeated", { name: getBossName(t, boss) })}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-[9px]">{t("common.rewards")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">{t("common.xp")}</span>
              <span className="retro text-[7px] text-green-400">+{boss.xpReward}</span>
            </div>
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">{t("common.gold")}</span>
              <span className="retro text-[7px] text-amber-400">+{boss.goldReward}g</span>
            </div>
            <div className="flex justify-between">
              <span className="retro text-[7px] text-muted-foreground">{t("common.loot")}</span>
              <span className="retro text-[7px] text-purple-400">
                {getEquipmentName(t, boss.loot.id, boss.loot.name)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full text-[8px]"
          onClick={() => {
            void grantPveRewardsReducer({
              xpGain: boss.xpReward,
              lootItemId: boss.loot?.id ?? undefined,
              lootName: boss.loot?.name ?? undefined,
              lootSlot: boss.loot ? ({ tag: boss.loot.slot } as any) : undefined,
              lootRarity: boss.loot ? ({ tag: boss.loot.rarity } as any) : undefined,
              lootLevelReq: boss.loot?.levelReq ?? undefined,
              lootBonusStr: boss.loot?.statBonus?.STR ?? undefined,
              lootBonusAgi: boss.loot?.statBonus?.AGI ?? undefined,
              lootBonusInt: boss.loot?.statBonus?.INT ?? undefined,
              lootBonusCon: boss.loot?.statBonus?.CON ?? undefined,
              lootBonusWis: boss.loot?.statBonus?.WIS ?? undefined,
              lootBonusCha: boss.loot?.statBonus?.CHA ?? undefined,
              lootBonusMp: boss.loot?.statBonus?.MP ?? undefined,
            });
            void abandonRaidReducer({ raidId: raid.id });
            void navigate("/guild");
          }}
        >
          {t("raid.claimRewards")}
        </Button>
      </div>
    );
  }

  // Defeat screen
  if (raid.phase.tag === "Defeat") {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2 py-4">
          <span className="text-4xl block">💀</span>
          <h2 className="retro text-sm text-red-400">{t("raid.defeatTitle")}</h2>
          <p className="retro text-[8px] text-muted-foreground">
            {t("raid.guildWiped", { name: getBossName(t, boss) })}
          </p>
          <p className="retro text-[7px] text-muted-foreground">
            {t("raid.bossHpRemaining", { current: raid.bossHp, max: raid.bossMaxHp })}
          </p>
        </div>
        <Button
          className="w-full text-[8px]"
          onClick={() => {
            void abandonRaidReducer({ raidId: raid.id });
            void navigate("/guild");
          }}
        >
          {t("raid.returnToGuild")}
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
        <h2 className="retro text-[10px] text-foreground">{getBossName(t, boss)}</h2>
        <HealthBar value={bossHpPct} variant="retro" className="h-2 mx-8" />
        <p className="retro text-[6px] text-muted-foreground">
          {t("raid.hpStatus", { current: raid.bossHp, max: raid.bossMaxHp })}
        </p>
      </div>

      {/* Party status */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-[8px]">{t("raid.party")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {combatants.map((c: any, i: number) => {
              const hpPct = Math.round((c.hp / c.maxHp) * 100);
              const isActive = i === raid.currentTurnIndex;
              return (
                <div
                  key={String(c.id)}
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
                    <span className="retro text-[6px] truncate">{c.playerName}</span>
                    {c.ko && <span className="text-[6px]">💀</span>}
                  </div>
                  <HealthBar value={hpPct} variant="retro" className="h-1 mt-0.5" />
                  <div className="flex justify-between mt-0.5">
                    <span className="retro text-[5px] text-muted-foreground">
                      {c.hp}/{c.maxHp}
                    </span>
                    <span className="retro text-[5px] text-blue-400">
                      {t("raid.mpStatus", { current: c.mana, max: c.maxMana })}
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
          <CardTitle className="text-[8px]">{t("raid.combatLog")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={logRef}
            className="h-20 overflow-y-auto space-y-0.5 bg-muted/20 border border-border p-1.5"
          >
            {raidLogs.slice(-15).map((entry: any) => (
              <p key={String(entry.id)} className="retro text-[5px]">
                <span className={entry.caster === boss.name ? "text-red-400" : "text-primary"}>
                  {getLogCombatantName(t, entry.caster)}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  → {spellEmoji(entry.element)} {getLogSpellName(t, entry.spellName)} →{" "}
                </span>
                <span className="text-foreground">{getLogCombatantName(t, entry.target)}</span>
                <span className={entry.isHeal ? "text-green-400" : "text-red-300"}>
                  {" "}
                  {entry.isHeal ? "+" : "-"}
                  {entry.damage}
                </span>
              </p>
            ))}
            {raidLogs.length === 0 && (
              <p className="retro text-[5px] text-muted-foreground text-center">
                {t("raid.combatBegins")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spell selection */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-[8px]">
            {isPlayerTurn
              ? t("combat.yourTurnPve")
              : t("combat.playerTurn", { name: currentCombatant?.playerName ?? "..." })}
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
                    onClick={() => handleCastSpell(spell)}
                  >
                    {spellEmoji(spell.element)} {t(spell.i18nKey)}
                    {spell.manaCost > 0 && (
                      <span className="text-blue-400 ml-auto">
                        {t("raid.spellMpCost", { cost: spell.manaCost })}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="retro text-[7px] text-muted-foreground">
                {t("combat.waitingForPlayer", { name: currentCombatant?.playerName })}
              </p>
              <Button
                size="sm"
                className="mt-2 text-[6px]"
                onClick={() => {
                  const mana = currentCombatant?.mana ?? 0;
                  const affordable = PLAYER_SPELLS_RAID.filter(
                    (s) => s.manaCost <= mana && !s.isHeal,
                  );
                  const best =
                    affordable.sort((a, b) => b.damage - a.damage)[0] ?? PLAYER_SPELLS_RAID[0]!;
                  handleCastSpell(best);
                }}
              >
                {t("combat.autoNpcTurn")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full text-[7px] text-red-400"
        onClick={() => {
          void abandonRaidReducer({ raidId: raid.id });
          void navigate("/guild");
        }}
      >
        {t("raid.retreat")}
      </Button>
    </div>
  );
}
