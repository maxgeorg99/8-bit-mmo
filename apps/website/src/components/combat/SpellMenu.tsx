import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import type { Spell } from "@/hooks/useCombat";

const ELEMENT_EMOJI: Record<string, string> = {
  Fire: "\u{1F525}",
  Ice: "\u{2744}\u{FE0F}",
  Lightning: "\u{26A1}",
};

interface SpellMenuProps {
  spells: Spell[];
  currentMana: number;
  isMyTurn: boolean;
  onCast: (spellId: bigint) => void;
}

export function SpellMenu({ spells, currentMana, isMyTurn, onCast }: SpellMenuProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          {isMyTurn ? "Your Turn - Choose a Spell" : "Waiting for opponent..."}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 justify-center">
          {spells.map((spell) => {
            const canCast = isMyTurn && currentMana >= spell.manaCost;
            return (
              <Button
                key={spell.name}
                disabled={!canCast}
                onClick={() => onCast(spell.id)}
                variant={canCast ? "default" : "secondary"}
                className="text-[10px] md:text-xs"
              >
                {ELEMENT_EMOJI[spell.element.tag] || ""} {spell.name}
                <span className="text-muted-foreground ml-1">
                  ({spell.damage}dmg / {spell.manaCost}mp)
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
