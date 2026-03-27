import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/8bit/button";
import { LocationScene } from "@/components/game/LocationScene";
import { useMyPlayer } from "@/hooks/useStdbPlayer";
import { BIOME_META, type BiomeId } from "@/lib/biomeThemes";

export function LocationPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { player } = useMyPlayer();
  const currentBiome = (player?.currentBiome ?? "plains") as BiomeId;
  const meta = BIOME_META[currentBiome];

  const location = meta.locations.find((l) => l.id === locationId);

  if (!location) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="retro text-[10px] text-muted-foreground">Location not found.</p>
        <Button variant="outline" onClick={() => navigate("/map")} className="text-[8px]">
          Back to Map
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/map")} className="text-[8px]">
          &lt; Map
        </Button>
        <span className="retro text-[8px] text-muted-foreground">
          {meta.icon} {meta.name}
        </span>
        <div className="w-12" />
      </div>

      <LocationScene location={location} biomeId={currentBiome} />
    </div>
  );
}
