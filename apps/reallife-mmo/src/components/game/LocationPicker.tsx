import { useNavigate } from "react-router";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { BIOME_META, type BiomeId } from "@/lib/biomeThemes";
import { LOCATION_TYPE_LABELS } from "@/lib/types";
import type { Location } from "@/lib/types";
import { useTable, useReducer } from "spacetimedb/react";
import { tables, reducers } from "@/generated";

interface LocationPickerProps {
  biomeId: BiomeId;
  onClose: () => void;
}

export function LocationPicker({ biomeId, onClose }: LocationPickerProps) {
  const navigate = useNavigate();
  const enterLocation = useReducer(reducers.enterLocation);
  const [guildRows] = useTable(tables.my_guild);
  const [memberRows] = useTable(tables.my_guild_members);
  const meta = BIOME_META[biomeId];

  const hasGuild = guildRows.length > 0;
  const canRaid = hasGuild && memberRows.length >= 3;

  const handleEnter = (location: Location) => {
    void enterLocation({ locationId: location.id });
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
          const bossLocked = isBossLair && !canRaid;
          return (
            <Card key={loc.id} className={bossLocked ? "opacity-60" : ""}>
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
                {isBossLair ? (
                  <Button
                    size="sm"
                    variant={canRaid ? "default" : "outline"}
                    className="text-[7px] shrink-0"
                    disabled={!canRaid}
                    onClick={() => handleEnter(loc)}
                  >
                    {canRaid ? "Raid" : "Locked"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="text-[7px] shrink-0"
                    onClick={() => handleEnter(loc)}
                  >
                    Enter
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Boss lair note */}
      {!canRaid && (
        <p className="retro text-[6px] text-muted-foreground text-center">
          {hasGuild
            ? `Need ${3 - memberRows.length} more guild member(s) to unlock Boss Lairs`
            : "Join a guild with 3+ members to unlock Boss Lairs"}
        </p>
      )}
    </div>
  );
}
