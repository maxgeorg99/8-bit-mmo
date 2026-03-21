import { CharacterDisplay } from "./CharacterDisplay";
import { SpellMenu } from "./SpellMenu";
import { CombatLog } from "./CombatLog";
import type { Combat, CombatLog as CombatLogEntry, Spell } from "@/hooks/useCombat";
import type { Identity } from "spacetimedb";

interface CombatArenaProps {
  combat: Combat;
  identity: Identity;
  spells: Spell[];
  logs: CombatLogEntry[];
  isMyTurn: boolean;
  isPlayer1: boolean;
  myHp: number;
  myMana: number;
  opponentHp: number;
  opponentMana: number;
  onCast: (spellId: bigint) => void;
}

export function CombatArena({
  combat,
  identity,
  spells,
  logs,
  isMyTurn,
  isPlayer1,
  myHp,
  myMana,
  opponentHp,
  opponentMana,
  onCast,
}: CombatArenaProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Characters facing each other */}
      <div className="flex items-start justify-between gap-4 md:gap-8">
        <CharacterDisplay
          name={isPlayer1 ? "Mage (You)" : "Mage"}
          imageUrl="/8bit-wizard.png"
          hp={isPlayer1 ? myHp : opponentHp}
          maxHp={100}
          mana={isPlayer1 ? myMana : opponentMana}
          maxMana={100}
          side="left"
          isActive={combat.currentTurn.isEqual(combat.player1)}
        />

        {/* VS divider */}
        <div className="flex flex-col items-center justify-center pt-16">
          <span className="retro text-xl md:text-3xl text-destructive">VS</span>
        </div>

        <CharacterDisplay
          name={!isPlayer1 ? "Orc (You)" : "Orc"}
          imageUrl="/8bit-orc-warrior.png"
          hp={!isPlayer1 ? myHp : opponentHp}
          maxHp={100}
          mana={!isPlayer1 ? myMana : opponentMana}
          maxMana={100}
          side="right"
          isActive={combat.player2 ? combat.currentTurn.isEqual(combat.player2) : false}
        />
      </div>

      {/* Combat log */}
      <CombatLog logs={logs} combat={combat} identity={identity} />

      {/* Spell menu */}
      <SpellMenu spells={spells} currentMana={myMana} isMyTurn={isMyTurn} onCast={onCast} />
    </div>
  );
}
