import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/8bit/dialog";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { Progress } from "@/components/ui/8bit/progress";
import type { NpcPlayer } from "@/lib/npcPlayers";
import {
  CLASS_SPRITES,
  CLASS_COLORS,
  STAT_COLORS,
  SLOT_ICONS,
  RARITY_COLORS,
  type StatName,
} from "@/lib/types";
import { asset, cn } from "@/lib/utils";

interface PlayerInspectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: NpcPlayer | null;
}

const STATS_ORDER: StatName[] = ["STR", "AGI", "INT", "CON", "WIS", "CHA", "MP"];

export function PlayerInspect({ open, onOpenChange, player }: PlayerInspectProps) {
  if (!player) return null;

  const maxStat = Math.max(...STATS_ORDER.map((s) => player.stats[s]), 1);
  const equippedItems = Object.entries(player.equipment).filter(([, item]) => item != null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xs flex items-center gap-2">
            <img
              src={asset(CLASS_SPRITES[player.playerClass])}
              alt={player.playerClass}
              className="pixelated w-8 h-8"
            />
            {player.name}
          </DialogTitle>
          <DialogDescription className="retro text-[7px] flex items-center gap-2">
            <span className={CLASS_COLORS[player.playerClass]}>
              Lv.{player.level} {player.playerClass}
            </span>
            {player.guildName && (
              <Badge variant="outline" className="text-[5px]">
                {player.guildName}
              </Badge>
            )}
            {player.online ? (
              <span className="text-[6px] text-green-400">Online</span>
            ) : (
              <span className="text-[6px] text-muted-foreground">Offline</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Title */}
        {player.title && (
          <div className="text-center">
            <span className="retro text-[8px] text-amber-400/80">{player.title}</span>
          </div>
        )}

        {/* Stats */}
        <Card>
          <CardContent className="py-2 space-y-1.5">
            {STATS_ORDER.map((stat) => {
              const value = player.stats[stat];
              const pct = Math.round((value / maxStat) * 100);
              return (
                <div key={stat} className="flex items-center gap-2">
                  <span className="retro text-[7px] w-6 text-muted-foreground">{stat}</span>
                  <Progress
                    value={pct}
                    variant="retro"
                    progressBg={STAT_COLORS[stat]}
                    className="h-1.5 flex-1"
                  />
                  <span className="retro text-[7px] w-6 text-right text-foreground">
                    {Math.round(value)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Equipment */}
        {equippedItems.length > 0 && (
          <Card>
            <CardContent className="py-2 space-y-1">
              {equippedItems.map(([slot, item]) => {
                if (!item) return null;
                return (
                  <div key={slot} className="flex items-center gap-2">
                    <span className="text-sm">{SLOT_ICONS[slot as keyof typeof SLOT_ICONS]}</span>
                    <span className={cn("retro text-[7px]", RARITY_COLORS[item.rarity])}>
                      {item.name}
                    </span>
                    <span className="retro text-[5px] text-muted-foreground ml-auto">
                      {Object.entries(item.statBonus)
                        .map(([s, v]) => `+${v} ${s}`)
                        .join(" ")}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
