import { useState } from "react";
import { useTable, useReducer } from "spacetimedb/react";
import { useTranslation } from "react-i18next";
import { tables, reducers } from "@/generated";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { QuestCard } from "@/components/game/QuestCard";
import type { Quest, ActivityType } from "@/lib/types";

/** Convert a SpacetimeDB quest row to the local Quest type */
function stdbQuestToLocal(row: any): Quest {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    type: row.questType.tag.toLowerCase() as Quest["type"],
    activityType: row.activityType ? ((row.activityType.value?.tag as ActivityType) ?? null) : null,
    targetMin: row.targetMin,
    progressMin: row.progressMin,
    xpReward: row.xpReward,
    completed: row.completed,
    expiresAt: row.expiresAt ? Number(row.expiresAt.value?.toMillis?.() ?? 0) : 0,
    manualComplete: row.manualComplete,
  };
}

export function Quests() {
  const { t } = useTranslation();
  const [questRows] = useTable(tables.my_quests);
  const claimQuestReducer = useReducer(reducers.claimQuest);
  const completeCustomQuestReducer = useReducer(reducers.completeCustomQuest);
  const createCustomQuestReducer = useReducer(reducers.createCustomQuest);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const quests = questRows.map(stdbQuestToLocal);

  const dailyQuests = quests.filter((q) => q.type === "daily");
  const customQuests = quests.filter((q) => q.type === "custom");
  const completed = quests.filter((q) => q.completed && !q.manualComplete);
  const activeDailies = dailyQuests.filter((q) => !q.completed);
  const activeCustom = customQuests.filter((q) => !q.completed);

  const handleClaim = (questId: string) => {
    void claimQuestReducer({ questId: BigInt(questId) });
  };

  const handleCompleteCustom = (questId: string) => {
    void completeCustomQuestReducer({ questId: BigInt(questId) });
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    void createCustomQuestReducer({
      title: newTitle.trim(),
      description: newDesc.trim(),
      xpReward: 30,
    });
    setNewTitle("");
    setNewDesc("");
    setShowCreate(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="retro text-lg text-foreground">{t("quests.questBoard")}</h1>
          <p className="retro text-[8px] text-muted-foreground mt-1">{t("quests.subtitle")}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-[8px]"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? t("common.cancel") : t("quests.newGoal")}
        </Button>
      </div>

      {/* Create custom quest */}
      {showCreate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">{t("quests.createPersonalGoal")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="retro text-[8px] text-muted-foreground">{t("quests.goal")}</label>
              <Input
                placeholder={t("quests.goalPlaceholder")}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="retro text-[8px] text-muted-foreground">
                {t("quests.details")}{" "}
                <span className="text-muted-foreground/50">{t("quests.detailsOptional")}</span>
              </label>
              <Input
                placeholder={t("quests.detailsPlaceholder")}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="text-xs"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreate}
              className="w-full text-[8px]"
              disabled={!newTitle.trim()}
            >
              {t("quests.createGoalButton", { xp: 30 })}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Completed quests ready to claim */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="retro text-[10px] text-green-500">{t("quests.readyToClaim")}</h2>
          {completed.map((q) => (
            <QuestCard key={q.id} quest={q} onClaim={handleClaim} />
          ))}
        </div>
      )}

      {/* Personal goals */}
      {(activeCustom.length > 0 || customQuests.length > 0) && (
        <div className="space-y-3">
          <h2 className="retro text-[10px] text-foreground">{t("quests.personalGoals")}</h2>
          {activeCustom.length === 0 ? (
            <p className="retro text-[7px] text-muted-foreground">{t("quests.noActiveGoals")}</p>
          ) : (
            activeCustom.map((q) => (
              <Card key={q.id} className="w-full">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="retro text-[9px]">{q.title}</div>
                    <span className="retro text-[7px] text-yellow-500">
                      +{q.xpReward} {t("common.xp")}
                    </span>
                  </div>
                  {q.description && (
                    <p className="retro text-[7px] text-muted-foreground">{q.description}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    size="sm"
                    className="text-[8px] w-full"
                    onClick={() => handleCompleteCustom(q.id)}
                  >
                    {t("quests.markAsDone")}
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Daily quests */}
      <div className="space-y-3">
        <h2 className="retro text-[10px] text-muted-foreground">{t("quests.dailyQuests")}</h2>
        {activeDailies.length === 0 ? (
          <p className="retro text-[7px] text-muted-foreground text-center py-4">
            {t("quests.allDailyCompleted")}
          </p>
        ) : (
          activeDailies.map((q) => <QuestCard key={q.id} quest={q} onClaim={handleClaim} />)
        )}
      </div>
    </div>
  );
}
