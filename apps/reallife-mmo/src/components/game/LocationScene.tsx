import { useNavigate } from "react-router";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import HealthBar from "@/components/ui/8bit/health-bar";
import { BIOME_META, type BiomeId } from "@/lib/biomeThemes";
import { BIOME_MOBS } from "@/lib/mobs";
import type { Location } from "@/lib/types";
import { useGameStore } from "@/lib/gameStore";

interface LocationSceneProps {
  location: Location;
  biomeId: BiomeId;
}

export function LocationScene({ location, biomeId }: LocationSceneProps) {
  const navigate = useNavigate();
  const player = useGameStore((s) => s.player);
  const enterLocation = useGameStore((s) => s.enterLocation);
  const meta = BIOME_META[biomeId];
  const hpPercent = player.maxHp > 0 ? Math.round((player.hp / player.maxHp) * 100) : 100;

  const handleLeave = () => {
    enterLocation(null);
    void navigate("/map");
  };

  if (location.type === "city") {
    return (
      <CityScene
        location={location}
        biomeName={meta.name}
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

  // boss_lair — placeholder
  return (
    <div className="space-y-4 text-center py-8">
      <span className="text-4xl">{location.icon}</span>
      <h2 className="retro text-sm text-foreground">{location.name}</h2>
      <p className="retro text-[8px] text-muted-foreground">
        The door is sealed. Only a guild raid can breach it.
      </p>
      <Button variant="outline" onClick={handleLeave} className="text-[8px]">
        Return to Map
      </Button>
    </div>
  );
}

// ── City Sub-scene ──────────────────────────────────────────────

function CityScene({
  location,
  biomeName,
  hpPercent,
  onLeave,
}: {
  location: Location;
  biomeName: string;
  hpPercent: number;
  onLeave: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* City header */}
      <div className="text-center space-y-1">
        <span className="text-3xl">{location.icon}</span>
        <h2 className="retro text-sm text-foreground">{location.name}</h2>
        <p className="retro text-[7px] text-muted-foreground">{biomeName} — City</p>
      </div>

      {/* City description */}
      <Card>
        <CardContent className="py-3">
          <p className="retro text-[8px] text-muted-foreground italic text-center">
            "{location.description}"
          </p>
        </CardContent>
      </Card>

      {/* City services */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-[9px]">🏥 Rest & Heal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <HealthBar value={hpPercent} variant="retro" className="h-2" />
              <p className="retro text-[7px] text-muted-foreground">
                {hpPercent >= 100 ? "Fully healed!" : "Rest at the inn to recover."}
              </p>
              <Button
                size="sm"
                className="w-full text-[7px]"
                disabled={hpPercent >= 100}
                onClick={() => {
                  // HP restore will be more meaningful after PvE combat (Phase 1.2)
                }}
              >
                {hpPercent >= 100 ? "Full HP" : "Rest"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-[9px]">🛒 Shop</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="retro text-[7px] text-muted-foreground">
              NPC merchants will sell biome-specific gear.
            </p>
            <Button size="sm" variant="outline" className="w-full text-[7px] mt-2" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* NPCs / ambiance */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-[9px]">👥 Town Square</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 justify-center py-2">
            {["🧙", "🗡️", "🛡️", "🏹"].map((npc, i) => (
              <div key={i} className="text-center">
                <span className="text-xl">{npc}</span>
                <div className="retro text-[6px] text-muted-foreground mt-0.5">NPC</div>
              </div>
            ))}
          </div>
          <p className="retro text-[6px] text-muted-foreground text-center mt-1">
            Other players will appear here after SpacetimeDB migration
          </p>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={onLeave} className="w-full text-[8px]">
        Leave City
      </Button>
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
  const navigate = useNavigate();
  const mobs = BIOME_MOBS[biomeId];

  return (
    <div className="space-y-4">
      {/* Wilderness header */}
      <div className="text-center space-y-1">
        <span className="text-3xl">{location.icon}</span>
        <h2 className="retro text-sm text-foreground">{location.name}</h2>
        <p className="retro text-[7px] text-muted-foreground">{biomeName} — Wilderness</p>
      </div>

      <Card>
        <CardContent className="py-3">
          <p className="retro text-[8px] text-muted-foreground italic text-center">
            "{location.description}"
          </p>
        </CardContent>
      </Card>

      {/* Encounter zone — shows actual mobs from this biome */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[9px]">⚔️ Encounter Zone</CardTitle>
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
          <p className="retro text-[7px] text-muted-foreground">
            Hostile creatures roam this area. Defeat them for XP and loot!
          </p>
          <Button className="text-[8px]" onClick={() => void navigate(`/pve/${biomeId}`)}>
            Fight
          </Button>
        </CardContent>
      </Card>

      {/* Loot hint */}
      <Card>
        <CardContent className="py-3 flex items-center gap-3">
          <span className="text-lg">🎁</span>
          <div>
            <p className="retro text-[8px] text-foreground">Loot Drops</p>
            <p className="retro text-[6px] text-muted-foreground">
              Defeat mobs here to earn biome-specific equipment
            </p>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={onLeave} className="w-full text-[8px]">
        Leave Wilderness
      </Button>
    </div>
  );
}
