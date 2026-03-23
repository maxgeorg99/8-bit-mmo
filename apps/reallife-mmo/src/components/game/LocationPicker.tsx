import { useNavigate } from "react-router";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { BIOME_META, type BiomeId } from "@/lib/biomeThemes";
import { LOCATION_TYPE_LABELS } from "@/lib/types";
import type { Location } from "@/lib/types";
import { useGameStore } from "@/lib/gameStore";

interface LocationPickerProps {
  biomeId: BiomeId;
  onClose: () => void;
}

export function LocationPicker({ biomeId, onClose }: LocationPickerProps) {
  const navigate = useNavigate();
  const enterLocation = useGameStore((s) => s.enterLocation);
  const meta = BIOME_META[biomeId];

  const handleEnter = (location: Location) => {
    enterLocation(location.id);
    void navigate(`/location/${location.id}`);
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="retro text-[10px] text-primary">
          {meta.icon} {meta.name} — Locations
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="retro text-[10px] text-muted-foreground hover:text-foreground"
        >
          x
        </button>
      </div>

      <div className="grid gap-2">
        {meta.locations.map((loc) => {
          const isBossLair = loc.type === "boss_lair";
          return (
            <Card key={loc.id} className={isBossLair ? "opacity-60" : ""}>
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <span className="text-xl">{loc.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="retro text-[9px] text-foreground">{loc.name}</span>
                    <Badge variant="outline" className="text-[6px]">
                      {LOCATION_TYPE_LABELS[loc.type]}
                    </Badge>
                  </div>
                  <p className="retro text-[7px] text-muted-foreground mt-0.5">{loc.description}</p>
                </div>
                <Button
                  size="sm"
                  variant={isBossLair ? "outline" : "default"}
                  className="text-[7px] shrink-0"
                  disabled={isBossLair}
                  onClick={() => handleEnter(loc)}
                >
                  {isBossLair ? "Locked" : "Enter"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Boss lair note */}
      <p className="retro text-[6px] text-muted-foreground text-center">
        Boss Lairs unlock with the Guild Raid system
      </p>
    </div>
  );
}
