import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { WorldMapSVG } from "@/components/game/WorldMapSVG";
import { RegionInfoPanel } from "@/components/game/RegionInfoPanel";
import { useBiome } from "@/hooks/useBiome";
import { BIOME_META, type BiomeId } from "@/lib/biomeThemes";

export function WorldMap() {
  const navigate = useNavigate();
  const { currentBiome, unlockedBiomes, travelTo, isUnlocked } = useBiome();
  const [selectedBiome, setSelectedBiome] = useState<BiomeId | null>(null);
  const [confirmTravel, setConfirmTravel] = useState(false);

  const handleRegionClick = (biomeId: BiomeId) => {
    setSelectedBiome(biomeId);
    setConfirmTravel(false);
  };

  const handleTravel = () => {
    if (!selectedBiome) return;
    travelTo(selectedBiome);
    setConfirmTravel(false);
    setSelectedBiome(null);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="text-[8px]">
          &lt; Back
        </Button>
        <h1 className="retro text-sm text-foreground">World Map</h1>
        <div className="w-16" />
      </div>

      {/* Current biome indicator */}
      <div className="flex items-center justify-center gap-2 pb-3">
        <span className="text-sm">{BIOME_META[currentBiome].icon}</span>
        <span className="retro text-[9px] text-primary">{BIOME_META[currentBiome].name}</span>
      </div>

      {/* Map */}
      <div className="flex-1 relative border border-border overflow-hidden min-h-[250px]">
        <WorldMapSVG
          currentBiome={currentBiome}
          unlockedBiomes={unlockedBiomes}
          selectedBiome={selectedBiome}
          onRegionClick={handleRegionClick}
        />
      </div>

      {/* Region info panel */}
      {selectedBiome && !confirmTravel && (
        <RegionInfoPanel
          biomeId={selectedBiome}
          isUnlocked={isUnlocked(selectedBiome)}
          isCurrent={selectedBiome === currentBiome}
          onTravel={() => setConfirmTravel(true)}
          onClose={() => setSelectedBiome(null)}
        />
      )}

      {/* Travel confirmation */}
      {confirmTravel && selectedBiome && (
        <Card className="mt-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Travel to {BIOME_META[selectedBiome].name}?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="retro text-[7px] text-muted-foreground">
              Your world shifts to match. The UI, the colours, everything. You carry your stats —
              but the boss changes.
            </p>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-[8px] flex-1"
              onClick={() => setConfirmTravel(false)}
            >
              Cancel
            </Button>
            <Button size="sm" className="text-[8px] flex-1" onClick={handleTravel}>
              Travel
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Unlocked count */}
      <div className="text-center pt-3">
        <span className="retro text-[7px] text-muted-foreground">
          {unlockedBiomes.length}/9 regions discovered
        </span>
      </div>
    </div>
  );
}
