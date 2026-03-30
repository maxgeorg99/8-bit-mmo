import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import HealthBar from "@/components/ui/8bit/health-bar";
import { BIOME_META, type BiomeId } from "@/lib/biomeThemes";
import { BIOME_MOBS } from "@/lib/mobs";
import { BIOME_MERCHANTS } from "@/lib/shopItems";
import { getMerchantName } from "@/lib/i18nEquipment";
import { NPC_PLAYERS, type NpcPlayer } from "@/lib/npcPlayers";
import { CLASS_SPRITES } from "@/lib/types";
import type { Location } from "@/lib/types";
import { useReducer } from "spacetimedb/react";
import { reducers } from "@/generated";
import { useMyPlayer, useBiomePlayers, useEquipmentActions } from "@/hooks/useStdbPlayer";
import { asset } from "@/lib/utils";
import { ShopDialog } from "./ShopDialog";
import { PlayerInspect, type InspectablePlayer } from "./PlayerInspect";

interface LocationSceneProps {
  location: Location;
  biomeId: BiomeId;
}

export function LocationScene({ location, biomeId }: LocationSceneProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { player } = useMyPlayer();
  const enterLocation = useReducer(reducers.enterLocation);
  const meta = BIOME_META[biomeId];

  if (!player) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="retro text-[10px] text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  const hpPercent = player.maxHp > 0 ? Math.round((player.hp / player.maxHp) * 100) : 100;

  const handleLeave = () => {
    void enterLocation({ locationId: undefined });
    void navigate("/map");
  };

  if (location.type === "city") {
    return (
      <CityScene
        location={location}
        biomeName={meta.name}
        biomeId={biomeId}
        hpPercent={hpPercent}
        onLeave={handleLeave}
      />
    );
  }

  if (location.type === "wilderness") {
    return (
      <WildernessScene
        location={location}
        biomeName={meta.name}
        biomeId={biomeId}
        onLeave={handleLeave}
      />
    );
  }

  // boss_lair — link to raid
  return (
    <div className="space-y-4 text-center py-8">
      <span className="text-4xl">{location.icon}</span>
      <h2 className="retro text-sm text-foreground">
        {t(`locations.${location.id}.name`, location.name)}
      </h2>
      <p className="retro text-[8px] text-muted-foreground italic">
        "{t(`locations.${location.id}.description`, location.description)}"
      </p>
      <p className="retro text-[8px] text-muted-foreground">{t("location.gatherGuild")}</p>
      <Button className="text-[8px]" onClick={() => void navigate(`/raid/${biomeId}`)}>
        {t("location.enterRaid")}
      </Button>
      <Button variant="outline" onClick={handleLeave} className="text-[8px]">
        {t("location.returnToMap")}
      </Button>
    </div>
  );
}

// ── City Sub-scene ──────────────────────────────────────────────

function CityScene({
  location,
  biomeName,
  biomeId,
  hpPercent,
  onLeave,
}: {
  location: Location;
  biomeName: string;
  biomeId: BiomeId;
  hpPercent: number;
  onLeave: () => void;
}) {
  const { t } = useTranslation();
  const [shopOpen, setShopOpen] = useState(false);
  const [inspecting, setInspecting] = useState<InspectablePlayer | NpcPlayer | null>(null);
  const { player } = useMyPlayer();
  const { restAtCity } = useEquipmentActions();
  const merchant = BIOME_MERCHANTS[biomeId];

  if (!player) {
    return null;
  }

  const healCost = Math.max(5, Math.floor(player.level * 2));
  const canHeal = hpPercent < 100 && player.gold >= healCost;

  // Real players in the same biome from SpacetimeDB (filter out unnamed/empty players)
  const realPlayers = useBiomePlayers().filter((p) => p.name.length > 0);

  // Mix real players with NPC fallbacks — show up to 4 total
  const npcFallbacks = NPC_PLAYERS.filter((n) => n.online).slice(
    0,
    Math.max(0, 2 - realPlayers.length),
  );
  const cityNpcs: (InspectablePlayer | NpcPlayer)[] = [...realPlayers.slice(0, 4), ...npcFallbacks];

  return (
    <div className="space-y-4">
      {/* City header */}
      <div className="text-center space-y-1">
        <span className="text-3xl">{location.icon}</span>
        <h2 className="retro text-sm text-foreground">
          {t(`locations.${location.id}.name`, location.name)}
        </h2>
        <p className="retro text-[7px] text-muted-foreground">
          {biomeName} — {t("worldMap.city")}
        </p>
      </div>

      {/* Gold bar */}
      <div className="flex items-center justify-center gap-1">
        <span className="text-sm">💰</span>
        <span className="retro text-[10px] text-amber-400">{player.gold}g</span>
      </div>

      {/* City description */}
      <Card>
        <CardContent className="py-3">
          <p className="retro text-[8px] text-muted-foreground italic text-center">
            "{t(`locations.${location.id}.description`, location.description)}"
          </p>
        </CardContent>
      </Card>

      {/* ── Town Square scene — pixel-art sprites ── */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-[9px]">👥 {t("location.townSquare")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Ground / scene area */}
          <div className="relative bg-muted/30 border border-border h-28 overflow-hidden">
            {/* Ground line */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-muted/50 border-t border-border" />

            {/* Player sprite */}
            <div className="absolute bottom-5 left-[20%] text-center animate-[bounce_3s_ease-in-out_infinite]">
              <img
                src={asset(CLASS_SPRITES[player.playerClass])}
                alt="You"
                className="pixelated w-10 h-10 mx-auto"
              />
              <div className="retro text-[5px] text-primary mt-0.5">{player.name || "You"}</div>
            </div>

            {/* Merchant NPC */}
            <button
              type="button"
              className="absolute bottom-5 left-[50%] text-center cursor-pointer hover:scale-110 transition-transform"
              onClick={() => setShopOpen(true)}
            >
              <span className="text-2xl block">{merchant.sprite}</span>
              <div className="retro text-[5px] text-amber-400 mt-0.5">
                {getMerchantName(t, biomeId)}
              </div>
            </button>

            {/* Other players — real SpacetimeDB players + NPC fallbacks */}
            {cityNpcs.map((npc, i) => (
              <button
                key={`${npc.name}-${i}`}
                type="button"
                className="absolute bottom-5 text-center cursor-pointer hover:scale-110 transition-transform"
                style={{ right: `${15 + i * 18}%` }}
                onClick={() => setInspecting(npc)}
              >
                <img
                  src={asset(CLASS_SPRITES[npc.playerClass])}
                  alt={npc.name}
                  className="pixelated w-8 h-8 mx-auto"
                />
                <div className="retro text-[5px] text-foreground/70 mt-0.5">
                  {npc.online ? "🟢 " : ""}
                  {npc.name}
                </div>
              </button>
            ))}
          </div>

          <p className="retro text-[6px] text-muted-foreground text-center mt-2">
            {t("location.tapToInspect")}
          </p>
        </CardContent>
      </Card>

      {/* City services */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-[9px]">🏥 {t("location.restAndHeal")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <HealthBar value={hpPercent} variant="retro" className="h-2" />
              <p className="retro text-[7px] text-muted-foreground">
                {hpPercent >= 100
                  ? t("location.fullyHealed")
                  : t("location.restAtInn", { cost: healCost })}
              </p>
              {hpPercent < 100 && player.gold < healCost && (
                <p className="retro text-[6px] text-red-400">{t("location.notEnoughGold")}</p>
              )}
              <Button
                size="sm"
                className="w-full text-[7px]"
                disabled={!canHeal}
                onClick={() => void restAtCity()}
              >
                {hpPercent >= 100
                  ? t("location.fullHp")
                  : t("location.restCost", { cost: healCost })}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-[9px]">🛒 {t("location.shop")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <span className="text-2xl block">{merchant.sprite}</span>
              <p className="retro text-[7px] text-muted-foreground">
                {t("location.sellsBiomeGear", { name: getMerchantName(t, biomeId) })}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-[7px]"
                onClick={() => setShopOpen(true)}
              >
                {t("location.browseWares")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button variant="outline" onClick={onLeave} className="w-full text-[8px]">
        {t("location.leaveCity")}
      </Button>

      <ShopDialog open={shopOpen} onOpenChange={setShopOpen} biomeId={biomeId} />
      <PlayerInspect
        open={inspecting != null}
        onOpenChange={(open) => !open && setInspecting(null)}
        player={inspecting}
      />
    </div>
  );
}

// ── Wilderness Sub-scene ────────────────────────────────────────

function WildernessScene({
  location,
  biomeName,
  biomeId,
  onLeave,
}: {
  location: Location;
  biomeName: string;
  biomeId: BiomeId;
  onLeave: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mobs = BIOME_MOBS[biomeId];

  return (
    <div className="space-y-4">
      {/* Wilderness header */}
      <div className="text-center space-y-1">
        <span className="text-3xl">{location.icon}</span>
        <h2 className="retro text-sm text-foreground">
          {t(`locations.${location.id}.name`, location.name)}
        </h2>
        <p className="retro text-[7px] text-muted-foreground">
          {biomeName} — {t("worldMap.wilderness")}
        </p>
      </div>

      <Card>
        <CardContent className="py-3">
          <p className="retro text-[8px] text-muted-foreground italic text-center">
            "{t(`locations.${location.id}.description`, location.description)}"
          </p>
        </CardContent>
      </Card>

      {/* Encounter zone — shows actual mobs from this biome */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[9px]">⚔️ {t("location.encounterZone")}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <div className="flex justify-center gap-4">
            {mobs.map((mob) => (
              <div key={mob.id} className="text-center">
                <div className="w-12 h-12 border border-border flex items-center justify-center">
                  <span className="text-2xl">{mob.sprite}</span>
                </div>
                <span className="retro text-[6px] text-foreground mt-0.5">{mob.name}</span>
                <span className="retro text-[5px] text-muted-foreground block">{mob.hp} HP</span>
              </div>
            ))}
          </div>
          <p className="retro text-[7px] text-muted-foreground">{t("location.hostileCreatures")}</p>
          <Button className="text-[8px]" onClick={() => void navigate(`/pve/${biomeId}`)}>
            {t("common.fight")}
          </Button>
        </CardContent>
      </Card>

      {/* Loot hint */}
      <Card>
        <CardContent className="py-3 flex items-center gap-3">
          <span className="text-lg">🎁</span>
          <div>
            <p className="retro text-[8px] text-foreground">{t("location.lootDrops")}</p>
            <p className="retro text-[6px] text-muted-foreground">
              {t("location.defeatMobsForGear")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={onLeave} className="w-full text-[8px]">
        {t("location.leaveWilderness")}
      </Button>
    </div>
  );
}
