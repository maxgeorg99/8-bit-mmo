import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useReducer } from "spacetimedb/react";
import { reducers } from "@/generated";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import HealthBar from "@/components/ui/8bit/health-bar";
import { Progress } from "@/components/ui/8bit/progress";
import { Badge } from "@/components/ui/8bit/badge";
import { usePveCombat } from "@/hooks/usePveCombat";
import { useMyPlayer } from "@/hooks/useStdbPlayer";
import { spellEmoji } from "@/lib/combatEngine";
import { BIOME_META, type BiomeId } from "@/lib/biomeThemes";
import { CLASS_SPRITES } from "@/lib/types";
import { RARITY_COLORS } from "@/lib/types";
import { asset, cn } from "@/lib/utils";
import { getEquipmentName } from "@/lib/i18nEquipment";

export function PveCombat() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { biomeId } = useParams<{ biomeId: string }>();
  const { player } = useMyPlayer();
  const grantPveRewardsReducer = useReducer(reducers.grantPveRewards);

  const {
    phase,
    mob,
    playerHp,
    playerMaxHp,
    playerMana,
    playerMaxMana,
    mobHp,
    mobMaxHp,
    logs,
    playerSpells,
    isPlayerTurn,
    xpEarned,
    lootDrops,
    startCombat,
    castSpell,
    reset,
  } = usePveCombat();

  const biome = (biomeId ?? player?.currentBiome ?? "plains") as BiomeId;

  // Start combat on mount
  useEffect(() => {
    if (phase === "idle") {
      startCombat(biome);
    }
  }, [phase, biome, startCombat]);

  // Grant rewards on victory
  useEffect(() => {
    if (phase === "victory" && xpEarned > 0) {
      // Call SpacetimeDB reducer for server-side persistence
      const loot = lootDrops[0];
      void grantPveRewardsReducer({
        xpGain: xpEarned,
        lootItemId: loot?.id ?? undefined,
        lootName: loot?.name ?? undefined,
        lootSlot: loot ? ({ tag: loot.slot } as any) : undefined,
        lootRarity: loot ? ({ tag: loot.rarity } as any) : undefined,
        lootLevelReq: loot?.levelReq ?? undefined,
        lootBonusStr: loot?.statBonus?.STR ?? undefined,
        lootBonusAgi: loot?.statBonus?.AGI ?? undefined,
        lootBonusInt: loot?.statBonus?.INT ?? undefined,
        lootBonusCon: loot?.statBonus?.CON ?? undefined,
        lootBonusWis: loot?.statBonus?.WIS ?? undefined,
        lootBonusCha: loot?.statBonus?.CHA ?? undefined,
        lootBonusMp: loot?.statBonus?.MP ?? undefined,
      });
    }
    // Only run once when phase becomes "victory"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleReturn = () => {
    reset();
    void navigate("/map");
  };

  const handleFightAgain = () => {
    reset();
    // startCombat will trigger via the useEffect when phase resets to "idle"
  };

  if (!mob && phase === "idle") {
    return (
      <div className="text-center py-12">
        <p className="retro text-[10px] text-muted-foreground">Searching for enemies...</p>
      </div>
    );
  }

  // ── Victory/Defeat Screen ──────────────────────────────────────
  if (phase === "victory" || phase === "defeat") {
    return (
      <div className="space-y-4 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle
              className={cn(
                "text-lg text-center",
                phase === "victory" ? "text-primary" : "text-destructive",
              )}
            >
              {phase === "victory" ? t("combat.victory") : t("combat.defeat")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {phase === "victory" ? (
              <>
                <div className="text-4xl">🏆</div>
                <p className="retro text-[9px] text-foreground">
                  {t("combat.youDefeated", { name: mob?.name })}
                </p>
                <div className="flex justify-center gap-4">
                  <Badge className="text-[8px]">+{xpEarned} XP</Badge>
                  {lootDrops.length > 0 &&
                    lootDrops.map((item) => (
                      <Badge
                        key={item.id}
                        variant="outline"
                        className={cn("text-[8px]", RARITY_COLORS[item.rarity])}
                      >
                        {getEquipmentName(t, item.id, item.name)}
                      </Badge>
                    ))}
                  {lootDrops.length === 0 && (
                    <Badge variant="outline" className="text-[8px] text-muted-foreground">
                      {t("combat.noLoot")}
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl">💀</div>
                <p className="retro text-[9px] text-muted-foreground">
                  {t("combat.tooStrong", { name: mob?.name })}
                </p>
              </>
            )}
          </CardContent>
          <CardFooter className="flex gap-3 justify-center">
            {phase === "victory" && (
              <Button onClick={handleFightAgain} className="text-[8px]">
                {t("combat.fightAgain")}
              </Button>
            )}
            <Button variant="outline" onClick={handleReturn} className="text-[8px]">
              {t("combat.returnToMap")}
            </Button>
          </CardFooter>
        </Card>

        {/* Final combat log */}
        <CombatLogDisplay logs={logs} mobName={mob?.name ?? "Enemy"} />
      </div>
    );
  }

  // ── Active Combat ──────────────────────────────────────────────
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleReturn} className="text-[8px]">
          {t("combat.flee")}
        </Button>
        <Badge variant="outline" className="text-[7px]">
          {BIOME_META[biome].icon} {BIOME_META[biome].name}
        </Badge>
      </div>

      {/* Combatants */}
      <div className="flex items-start justify-between gap-2">
        {/* Player */}
        <div
          className={cn("flex flex-col items-center gap-2 flex-1", isPlayerTurn && "animate-pulse")}
        >
          <Badge variant={isPlayerTurn ? "default" : "secondary"} className="text-[8px]">
            {player?.name || t("dashboard.unnamedHero")}
            {t("combat.youSuffix")}
          </Badge>
          <img
            src={asset(CLASS_SPRITES[player?.playerClass ?? "Unclassed"])}
            alt={player?.playerClass ?? "Unclassed"}
            className="pixelated w-20 h-20 md:w-28 md:h-28 drop-shadow-lg"
          />
          <div className="w-full max-w-32 space-y-1">
            <div className="flex justify-between retro text-[7px] text-muted-foreground">
              <span>HP</span>
              <span>
                {playerHp}/{playerMaxHp}
              </span>
            </div>
            <HealthBar
              value={Math.round((playerHp / playerMaxHp) * 100)}
              variant="retro"
              className="h-2.5"
            />
          </div>
          <div className="w-full max-w-32 space-y-1">
            <div className="flex justify-between retro text-[7px] text-muted-foreground">
              <span>MP</span>
              <span>
                {playerMana}/{playerMaxMana}
              </span>
            </div>
            <Progress
              value={Math.round((playerMana / playerMaxMana) * 100)}
              variant="retro"
              progressBg="bg-blue-500"
              className="h-2.5"
            />
          </div>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center justify-center pt-10">
          <span className="retro text-lg text-destructive">VS</span>
        </div>

        {/* Mob */}
        <div
          className={cn(
            "flex flex-col items-center gap-2 flex-1",
            !isPlayerTurn && "animate-pulse",
          )}
        >
          <Badge variant={!isPlayerTurn ? "default" : "secondary"} className="text-[8px]">
            {mob?.name}
          </Badge>
          <div className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
            <span className="text-5xl md:text-6xl">{mob?.sprite}</span>
          </div>
          <div className="w-full max-w-32 space-y-1">
            <div className="flex justify-between retro text-[7px] text-muted-foreground">
              <span>HP</span>
              <span>
                {mobHp}/{mobMaxHp}
              </span>
            </div>
            <HealthBar
              value={Math.round((mobHp / mobMaxHp) * 100)}
              variant="retro"
              className="h-2.5"
            />
          </div>
        </div>
      </div>

      {/* Combat log */}
      <CombatLogDisplay logs={logs} mobName={mob?.name ?? "Enemy"} />

      {/* Spell menu */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px]">
            {isPlayerTurn ? "Your Turn — Choose a Spell" : "Enemy's turn..."}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center">
            {playerSpells.map((spell) => {
              const canCast = isPlayerTurn && playerMana >= spell.manaCost;
              return (
                <Button
                  key={spell.id}
                  disabled={!canCast}
                  onClick={() => castSpell(spell.id)}
                  variant={canCast ? "default" : "secondary"}
                  size="sm"
                  className="text-[7px]"
                >
                  {spellEmoji(spell.element)} {spell.name}
                  <span className="text-muted-foreground ml-1">
                    ({spell.isHeal ? `+${spell.damage}hp` : `${spell.damage}dmg`}
                    {spell.manaCost > 0 ? ` / ${spell.manaCost}mp` : ""})
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Combat Log Sub-component ────────────────────────────────────

function CombatLogDisplay({
  logs,
  mobName,
}: {
  logs: { id: number; caster: string; spellName: string; damage: number; isHeal: boolean }[];
  mobName: string;
}) {
  return (
    <div className="bg-card/50 border border-border p-3 h-24 overflow-y-auto retro text-[8px] space-y-0.5">
      {logs.length === 0 && <p className="text-muted-foreground">Battle begins...</p>}
      {logs.map((log) => (
        <p key={log.id} className="text-foreground">
          <span className={log.caster === "player" ? "text-primary" : "text-destructive"}>
            {log.caster === "player" ? "You" : mobName}
          </span>
          {log.isHeal ? " healed for " : " dealt "}
          <span className={log.isHeal ? "text-green-400" : "text-destructive"}>{log.damage}</span>
          {log.isHeal ? " HP" : " damage"}
          {" with "}
          <span className="text-foreground">{log.spellName}</span>
        </p>
      ))}
    </div>
  );
}
