import { useEffect, useState } from "react";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { QuestCard } from "@/components/game/QuestCard";
import { useGameStore } from "@/lib/gameStore";

export function Quests() {
  const quests = useGameStore((s) => s.quests);
  const claimQuest = useGameStore((s) => s.claimQuest);
  const completeCustomQuest = useGameStore((s) => s.completeCustomQuest);
  const createCustomQuest = useGameStore((s) => s.createCustomQuest);
  const checkDailyRefresh = useGameStore((s) => s.checkDailyRefresh);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Auto-refresh daily quests on page load
  useEffect(() => {
    checkDailyRefresh();
  }, [checkDailyRefresh]);

  const dailyQuests = quests.filter((q) => q.type === "daily");
  const customQuests = quests.filter((q) => q.type === "custom");
  const completed = quests.filter((q) => q.completed);
  const activeDailies = dailyQuests.filter((q) => !q.completed);
  const activeCustom = customQuests.filter((q) => !q.completed);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createCustomQuest(newTitle.trim(), newDesc.trim(), 30);
    setNewTitle("");
    setNewDesc("");
    setShowCreate(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="retro text-lg text-foreground">Quest Board</h1>
          <p className="retro text-[8px] text-muted-foreground mt-1">
            Daily quests refresh each day. Create your own goals too!
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-[8px]"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? "Cancel" : "+ New Goal"}
        </Button>
      </div>

      {/* Create custom quest */}
      {showCreate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Create Personal Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="retro text-[8px] text-muted-foreground">Goal</label>
              <Input
                placeholder="e.g. Learn a handstand, Run 10km, Bake sourdough..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="retro text-[8px] text-muted-foreground">
                Details <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <Input
                placeholder="Any extra notes or milestones..."
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
              Create Goal (+30 XP on completion)
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Completed quests ready to claim */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="retro text-[10px] text-green-500">Ready to Claim</h2>
          {completed.map((q) => (
            <QuestCard key={q.id} quest={q} onClaim={claimQuest} />
          ))}
        </div>
      )}

      {/* Personal goals */}
      {(activeCustom.length > 0 || customQuests.length > 0) && (
        <div className="space-y-3">
          <h2 className="retro text-[10px] text-foreground">Personal Goals</h2>
          {activeCustom.length === 0 ? (
            <p className="retro text-[7px] text-muted-foreground">
              No active goals. Create one above!
            </p>
          ) : (
            activeCustom.map((q) => (
              <Card key={q.id} className="w-full">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="retro text-[9px]">{q.title}</div>
                    <span className="retro text-[7px] text-yellow-500">+{q.xpReward} XP</span>
                  </div>
                  {q.description && (
                    <p className="retro text-[7px] text-muted-foreground">{q.description}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    size="sm"
                    className="text-[8px] w-full"
                    onClick={() => completeCustomQuest(q.id)}
                  >
                    Mark as Done
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Daily quests */}
      <div className="space-y-3">
        <h2 className="retro text-[10px] text-muted-foreground">Daily Quests</h2>
        {activeDailies.length === 0 ? (
          <p className="retro text-[7px] text-muted-foreground text-center py-4">
            All daily quests completed! Come back tomorrow.
          </p>
        ) : (
          activeDailies.map((q) => <QuestCard key={q.id} quest={q} onClaim={claimQuest} />)
        )}
      </div>
    </div>
  );
}
