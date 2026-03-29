import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import { Progress } from "@/components/ui/8bit/progress";
import type { Quest } from "@/lib/types";
import { ACTIVITY_ICONS } from "@/lib/types";

interface QuestCardProps {
  quest: Quest;
  onClaim: (questId: string) => void;
}

/**
 * Resolve a quest string that may contain an i18n key.
 * Format: "i18n:key:param1=val1:param2=val2"
 * If not prefixed with "i18n:", returns the raw string (custom quests).
 */
function resolveQuestString(
  str: string,
  t: (key: string, params?: Record<string, string>) => string,
): string {
  if (!str.startsWith("i18n:")) return str;
  // Format: "i18n:questTemplates.session:activityType=Cardio"
  const keyAndParams = str.slice(5); // remove "i18n:"
  const segments = keyAndParams.split(":");
  const key = segments[0];
  const params: Record<string, string> = {};
  for (let i = 1; i < segments.length; i++) {
    const eqIdx = segments[i].indexOf("=");
    if (eqIdx > 0) {
      const paramKey = segments[i].slice(0, eqIdx);
      const paramVal = segments[i].slice(eqIdx + 1);
      // If param is activityType, translate it
      if (paramKey === "activityType") {
        params["activity"] = t(`activityTypes.${paramVal}`);
      } else {
        params[paramKey] = paramVal;
      }
    }
  }
  return t(key, params);
}

export function QuestCard({ quest, onClaim }: QuestCardProps) {
  const { t } = useTranslation();
  const hasProgress = quest.activityType !== null && quest.targetMin > 0;
  const progress = hasProgress
    ? Math.min(Math.round((quest.progressMin / quest.targetMin) * 100), 100)
    : 0;

  const resolvedTitle = resolveQuestString(quest.title, t);
  const resolvedDescription = resolveQuestString(quest.description, t);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-2">
            {quest.activityType && <span>{ACTIVITY_ICONS[quest.activityType]}</span>}
            {!quest.activityType && <span>🎯</span>}
            {resolvedTitle}
          </CardTitle>
          <Badge variant={quest.completed ? "default" : "secondary"} className="text-[7px]">
            {quest.completed ? t("common.done") : t(`questTypes.${quest.type}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {resolvedDescription && (
          <p className="retro text-[7px] text-muted-foreground">{resolvedDescription}</p>
        )}
        {quest.activityType && (
          <div className="retro text-[7px] text-muted-foreground">
            {t(`activityTypes.${quest.activityType}`)}
          </div>
        )}

        {hasProgress && (
          <div className="space-y-1">
            <div className="flex justify-between retro text-[7px] text-muted-foreground">
              <span>{t("quests.progress")}</span>
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
        <span className="retro text-[7px] text-yellow-500">
          +{quest.xpReward} {t("common.xp")}
        </span>
        {quest.completed && (
          <Button size="sm" onClick={() => onClaim(quest.id)} className="text-[8px]">
            {t("quests.claimReward")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
