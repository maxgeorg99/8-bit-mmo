import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import { Progress } from "@/components/ui/8bit/progress";
import type { Quest } from "@/lib/types";
import { ACTIVITY_ICONS, ACTIVITY_LABELS } from "@/lib/types";

interface QuestCardProps {
  quest: Quest;
  onClaim: (questId: string) => void;
}

export function QuestCard({ quest, onClaim }: QuestCardProps) {
  const hasProgress = quest.activityType !== null && quest.targetMin > 0;
  const progress = hasProgress
    ? Math.min(Math.round((quest.progressMin / quest.targetMin) * 100), 100)
    : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-2">
            {quest.activityType && <span>{ACTIVITY_ICONS[quest.activityType]}</span>}
            {!quest.activityType && <span>🎯</span>}
            {quest.title}
          </CardTitle>
          <Badge variant={quest.completed ? "default" : "secondary"} className="text-[7px]">
            {quest.completed ? "DONE" : quest.type.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {quest.description && (
          <p className="retro text-[7px] text-muted-foreground">{quest.description}</p>
        )}
        {quest.activityType && (
          <div className="retro text-[7px] text-muted-foreground">
            {ACTIVITY_LABELS[quest.activityType]}
          </div>
        )}

        {hasProgress && (
          <div className="space-y-1">
            <div className="flex justify-between retro text-[7px] text-muted-foreground">
              <span>Progress</span>
              <span>
                {Math.min(quest.progressMin, quest.targetMin)}/{quest.targetMin} min
              </span>
            </div>
            <Progress
              value={progress}
              variant="retro"
              progressBg={quest.completed ? "bg-green-500" : "bg-yellow-500"}
              className="h-2"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="retro text-[7px] text-yellow-500">+{quest.xpReward} XP</span>
        {quest.completed && (
          <Button size="sm" onClick={() => onClaim(quest.id)} className="text-[8px]">
            Claim Reward
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
