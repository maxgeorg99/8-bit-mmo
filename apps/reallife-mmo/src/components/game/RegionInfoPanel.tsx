import { Button } from "@/components/ui/8bit/button";
import { Badge } from "@/components/ui/8bit/badge";
import { Progress } from "@/components/ui/8bit/progress";
import { BIOME_META, type BiomeId } from "@/lib/biomeThemes";
import { useBiomeProgress } from "@/hooks/useBiomeProgress";

interface RegionInfoPanelProps {
  biomeId: BiomeId;
  isUnlocked: boolean;
  isCurrent: boolean;
  onTravel: () => void;
  onClose: () => void;
}

export function RegionInfoPanel({
  biomeId,
  isUnlocked,
  isCurrent,
  onTravel,
  onClose,
}: RegionInfoPanelProps) {
  const meta = BIOME_META[biomeId];
  const progress = useBiomeProgress(biomeId);
  const progressPercent =
    progress.required > 0 ? Math.round((progress.current / progress.required) * 100) : 0;

  return (
    <div className="border-t-4 border-foreground dark:border-ring bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{meta.icon}</span>
            <h3 className="retro text-[12px] text-primary">{meta.name}</h3>
          </div>
          <p className="retro text-[7px] text-muted-foreground italic mt-1">"{meta.description}"</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isUnlocked && !isCurrent && (
            <Button onClick={onTravel} size="sm" className="text-[8px]">
              Travel
            </Button>
          )}
          {isCurrent && (
            <Badge variant="outline" className="text-[7px]">
              You are here
            </Badge>
          )}
          <button
            type="button"
            onClick={onClose}
            className="retro text-[10px] text-muted-foreground hover:text-foreground"
          >
            x
          </button>
        </div>
      </div>

      {/* Raid boss */}
      <div className="flex items-center gap-2">
        <span className="retro text-[7px] text-muted-foreground">Raid Boss:</span>
        <span className="retro text-[8px] text-foreground">{meta.raidBoss}</span>
      </div>

      {/* Unlock progress (only for locked biomes) */}
      {!isUnlocked && (
        <div className="space-y-1.5">
          <div className="flex justify-between retro text-[7px] text-muted-foreground">
            <span>{meta.unlockHint}</span>
            <span>
              {progress.current}/{progress.required}
            </span>
          </div>
          <Progress
            value={progressPercent}
            variant="retro"
            progressBg="bg-primary"
            className="h-2"
          />
        </div>
      )}
    </div>
  );
}
