import { useState } from "react";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { WorldMapSVG } from "@/components/game/WorldMapSVG";
import { RegionInfoPanel } from "@/components/game/RegionInfoPanel";
import { LocationPicker } from "@/components/game/LocationPicker";
import { useBiome } from "@/hooks/useBiome";
import { BIOME_META, type BiomeId } from "@/lib/biomeThemes";

export function WorldMap() {
  const { currentBiome, unlockedBiomes, travelTo, isUnlocked } = useBiome();
  const [selectedBiome, setSelectedBiome] = useState<BiomeId | null>(null);
  const [confirmTravel, setConfirmTravel] = useState(false);
  const [showLocations, setShowLocations] = useState(false);

  const handleRegionClick = (biomeId: BiomeId) => {
    if (biomeId === currentBiome) {
      // Clicking current biome opens location picker directly
      setSelectedBiome(null);
      setConfirmTravel(false);
      setShowLocations(true);
      return;
    }
    setSelectedBiome(biomeId);
    setConfirmTravel(false);
    setShowLocations(false);
  };

  const handleTravel = () => {
    if (!selectedBiome) return;
    travelTo(selectedBiome);
    setConfirmTravel(false);
    setSelectedBiome(null);
    setShowLocations(true);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h1 className="retro text-sm text-foreground">World Map</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">{BIOME_META[currentBiome].icon}</span>
          <span className="retro text-[8px] text-primary">{BIOME_META[currentBiome].name}</span>
        </div>
      </div>

      {/* Map */}
      <div className="relative border border-border overflow-hidden rounded-sm">
        <WorldMapSVG
          currentBiome={currentBiome}
          unlockedBiomes={unlockedBiomes}
          selectedBiome={selectedBiome}
          onRegionClick={handleRegionClick}
        />
      </div>

      {/* Location picker for current biome */}
      {showLocations && !selectedBiome && !confirmTravel && (
        <LocationPicker biomeId={currentBiome} onClose={() => setShowLocations(false)} />
      )}

      {/* Region info panel for selected (non-current) biome */}
      {selectedBiome && !confirmTravel && !showLocations && (
        <RegionInfoPanel
          biomeId={selectedBiome}
          isUnlocked={isUnlocked(selectedBiome)}
          isCurrent={false}
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
