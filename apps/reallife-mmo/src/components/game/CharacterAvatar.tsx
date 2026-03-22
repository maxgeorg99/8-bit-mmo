import { Badge } from "@/components/ui/8bit/badge";
import type { PlayerClass, CharacterTier, EquipSlot, EquipmentItem } from "@/lib/types";
import {
  CLASS_COLORS,
  CLASS_SPRITES,
  TIER_GLOW,
  TIER_LABELS,
  getCharacterTier,
  RARITY_BORDER,
  RARITY_COLORS,
  SLOT_ICONS,
} from "@/lib/types";
import { TITLE_MAP } from "@/lib/titles";
import { cn, asset } from "@/lib/utils";

interface CharacterAvatarProps {
  playerClass: PlayerClass;
  level: number;
  name: string;
  equipment: Partial<Record<EquipSlot, EquipmentItem>>;
  activeTitle?: string | null;
}

const TIER_BORDER: Record<CharacterTier, string> = {
  novice: "border-muted-foreground/30",
  apprentice: "border-green-500/50",
  adept: "border-blue-500/50",
  veteran: "border-purple-500/50",
  master: "border-yellow-500/60",
  legend: "border-red-500/60",
};

const TIER_BG: Record<CharacterTier, string> = {
  novice: "",
  apprentice: "bg-green-500/5",
  adept: "bg-blue-500/5",
  veteran: "bg-purple-500/5",
  master: "bg-yellow-500/5",
  legend: "bg-red-500/5",
};

export function CharacterAvatar({
  playerClass,
  level,
  name,
  equipment,
  activeTitle,
}: CharacterAvatarProps) {
  const tier = getCharacterTier(level);
  const sprite = CLASS_SPRITES[playerClass];
  const title = activeTitle ? TITLE_MAP.get(activeTitle) : null;

  const equippedSlots: EquipSlot[] = ["weapon", "head", "armor", "accessory"];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Tier badge */}
      <Badge
        variant="secondary"
        className={cn(
          "text-[7px]",
          tier !== "novice" &&
            RARITY_COLORS[
              tier === "legend"
                ? "legendary"
                : tier === "master"
                  ? "epic"
                  : tier === "veteran"
                    ? "rare"
                    : "uncommon"
            ],
        )}
      >
        {TIER_LABELS[tier]}
      </Badge>

      {/* Avatar with tier frame */}
      <div className={cn("relative p-2 border-4 transition-all", TIER_BORDER[tier], TIER_BG[tier])}>
        <img
          src={asset(sprite)}
          alt={`${name} - ${playerClass}`}
          className={cn("pixelated w-32 h-32 md:w-40 md:h-40", TIER_GLOW[tier])}
        />

        {/* Level badge overlay */}
        <div className="absolute -top-2 -right-2">
          <Badge className="text-[7px]">Lv.{level}</Badge>
        </div>
      </div>

      {/* Name + class + title */}
      <div className="text-center">
        <div className="retro text-[11px]">{name || "Unnamed Hero"}</div>
        <div className={cn("retro text-[9px]", CLASS_COLORS[playerClass])}>{playerClass}</div>
        {title && (
          <div className="retro text-[7px] text-amber-400/80 mt-0.5">
            {title.icon} {title.name}
          </div>
        )}
      </div>

      {/* Equipment slots */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
        {equippedSlots.map((slot) => {
          const item = equipment[slot];
          return (
            <div
              key={slot}
              className={cn(
                "flex flex-col items-center p-2 border-2 text-center min-h-[60px] justify-center",
                item ? RARITY_BORDER[item.rarity] : "border-border",
              )}
            >
              <span className="text-sm">{SLOT_ICONS[slot]}</span>
              {item ? (
                <span
                  className={cn("retro text-[5px] mt-1 leading-tight", RARITY_COLORS[item.rarity])}
                >
                  {item.name}
                </span>
              ) : (
                <span className="retro text-[5px] text-muted-foreground/50 mt-1">Empty</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
