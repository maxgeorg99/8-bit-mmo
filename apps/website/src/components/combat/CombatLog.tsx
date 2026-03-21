import type { CombatLog as CombatLogEntry, Combat } from "@/hooks/useCombat";
import type { Identity } from "spacetimedb";
import { useEffect, useRef } from "react";

interface CombatLogProps {
  logs: CombatLogEntry[];
  combat: Combat;
  identity: Identity | null;
}

export function CombatLog({ logs, combat, identity }: CombatLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [logs.length]);

  function getCasterName(casterId: Identity) {
    if (identity && casterId.isEqual(identity)) return "You";
    if (casterId.isEqual(combat.player1)) return "Mage";
    return "Orc";
  }

  return (
    <div
      ref={scrollRef}
      className="w-full bg-card/50 border border-border rounded-none p-3 h-28 overflow-y-auto retro text-[9px] md:text-[10px] space-y-1"
    >
      {logs.length === 0 && <p className="text-muted-foreground">Battle begins...</p>}
      {logs.map((log) => (
        <p key={String(log.id)} className="text-foreground">
          <span className="text-primary">{getCasterName(log.casterId)}</span>
          {" cast "}
          <span className="text-destructive">{log.spellName}</span>
          {" for "}
          <span className="text-destructive">{log.damage}</span>
          {" damage!"}
        </p>
      ))}
    </div>
  );
}
