import HealthBar from "@/components/ui/8bit/health-bar";
import { Progress } from "@/components/ui/8bit/progress";
import { Badge } from "@/components/ui/8bit/badge";
import { cn } from "@/lib/utils";

interface CharacterDisplayProps {
  name: string;
  imageUrl: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  side: "left" | "right";
  isActive: boolean;
}

export function CharacterDisplay({
  name,
  imageUrl,
  hp,
  maxHp,
  mana,
  maxMana,
  side,
  isActive,
}: CharacterDisplayProps) {
  const hpPercent = Math.round((hp / maxHp) * 100);
  const manaPercent = Math.round((mana / maxMana) * 100);

  return (
    <div className={cn("flex flex-col items-center gap-3 flex-1", isActive && "animate-pulse")}>
      <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
        {name}
      </Badge>

      <img
        src={imageUrl}
        alt={name}
        className={cn(
          "pixelated w-32 h-32 md:w-48 md:h-48 drop-shadow-lg",
          side === "right" && "-scale-x-100",
        )}
      />

      {/* HP bar */}
      <div className="w-full max-w-48 space-y-1">
        <div className="flex justify-between retro text-[8px] text-muted-foreground">
          <span>HP</span>
          <span>
            {hp}/{maxHp}
          </span>
        </div>
        <HealthBar value={hpPercent} variant="retro" className="h-3" />
      </div>

      {/* Mana bar */}
      <div className="w-full max-w-48 space-y-1">
        <div className="flex justify-between retro text-[8px] text-muted-foreground">
          <span>MP</span>
          <span>
            {mana}/{maxMana}
          </span>
        </div>
        <Progress value={manaPercent} variant="retro" progressBg="bg-blue-500" className="h-3" />
      </div>
    </div>
  );
}
