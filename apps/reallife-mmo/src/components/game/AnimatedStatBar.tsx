import { Progress } from "@/components/ui/8bit/progress";
import { useAnimatedValue } from "@/hooks/useAnimatedValue";
import type { StatName } from "@/lib/types";
import { STAT_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AnimatedStatBarProps {
  stat: StatName;
  value: number;
  maxValue?: number;
  bonus?: number;
}

export function AnimatedStatBar({ stat, value, maxValue = 100, bonus }: AnimatedStatBarProps) {
  const { value: animValue, isAnimating } = useAnimatedValue(value);
  const percent = Math.min(Math.round((animValue / maxValue) * 100), 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between retro text-[8px] text-muted-foreground">
        <span>{stat}</span>
        <span className={cn(isAnimating && "text-yellow-400 animate-pulse")}>
          {bonus && bonus > 0 && <span className="text-green-400 mr-1">(+{bonus})</span>}
          {animValue.toFixed(1)}
        </span>
      </div>
      <Progress
        value={percent}
        variant="retro"
        progressBg={cn(STAT_COLORS[stat])}
        className={cn("h-2", isAnimating && "animate-pulse")}
      />
    </div>
  );
}
