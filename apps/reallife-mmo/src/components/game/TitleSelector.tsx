import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/8bit/accordion";
import { Badge } from "@/components/ui/8bit/badge";
import { TITLES } from "@/lib/titles";
import type { TitleCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TitleSelectorProps {
  unlockedTitles: string[];
  activeTitle: string | null;
  onSelect: (titleId: string | null) => void;
}

const CATEGORY_LABELS: Record<TitleCategory, string> = {
  real_world: "Real-World Achievements",
  in_game: "In-Game Achievements",
};

export function TitleSelector({ unlockedTitles, activeTitle, onSelect }: TitleSelectorProps) {
  const unlockedSet = new Set(unlockedTitles);
  const categories: TitleCategory[] = ["real_world", "in_game"];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs">Titles</CardTitle>
          <span className="retro text-[7px] text-muted-foreground">
            {unlockedTitles.length}/{TITLES.length} unlocked
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {activeTitle && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="w-full text-center retro text-[7px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Remove active title
          </button>
        )}

        <Accordion type="multiple">
          {categories.map((category) => {
            const titles = TITLES.filter((t) => t.category === category);
            const unlockedCount = titles.filter((t) => unlockedSet.has(t.id)).length;

            return (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="text-[9px] py-2">
                  <span className="flex items-center gap-2">
                    {CATEGORY_LABELS[category]}
                    <Badge variant="secondary" className="text-[5px] px-1 py-0">
                      {unlockedCount}/{titles.length}
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {titles.map((title) => {
                      const unlocked = unlockedSet.has(title.id);
                      const isActive = activeTitle === title.id;

                      return (
                        <button
                          key={title.id}
                          type="button"
                          disabled={!unlocked}
                          onClick={() => onSelect(isActive ? null : title.id)}
                          className={cn(
                            "flex items-center gap-2 p-2 border text-left transition-all",
                            unlocked
                              ? "border-border hover:border-primary/50 cursor-pointer"
                              : "border-border/30 opacity-40 cursor-not-allowed",
                            isActive && "border-amber-400/60 bg-amber-400/5",
                          )}
                        >
                          <span className="text-base shrink-0">{unlocked ? title.icon : "🔒"}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "retro text-[8px]",
                                  isActive
                                    ? "text-amber-400"
                                    : unlocked
                                      ? "text-foreground"
                                      : "text-muted-foreground",
                                )}
                              >
                                {title.name}
                              </span>
                              {isActive && (
                                <Badge variant="secondary" className="text-[5px] px-1 py-0">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <span className="retro text-[6px] text-muted-foreground">
                              {title.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
