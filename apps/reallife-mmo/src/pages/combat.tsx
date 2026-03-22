import { useNavigate } from "react-router";
import { Button } from "@/components/ui/8bit/button";
import { asset } from "@/lib/utils";
import { useCombat } from "@/hooks/useCombat";
import { CombatArena } from "@/components/combat/CombatArena";
import { WaitingScreen } from "@/components/combat/WaitingScreen";
import { VictoryScreen } from "@/components/combat/VictoryScreen";

export function Combat() {
  const navigate = useNavigate();
  const {
    connected,
    identity,
    combat,
    spells,
    logs,
    isMyTurn,
    isPlayer1,
    myHp,
    myMana,
    opponentHp,
    opponentMana,
    joinCombat,
    castSpell,
    leaveCombat,
  } = useCombat();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/")}>
          &lt; Back
        </Button>
        <h1 className="retro text-lg md:text-2xl text-foreground">8-Bit Arena</h1>
        <div className="w-20" />
      </div>

      {/* Connection status */}
      {!connected && (
        <div className="text-center space-y-4 flex-1 flex flex-col items-center justify-center">
          <p className="retro text-sm text-muted-foreground">Connecting to server...</p>
        </div>
      )}

      {/* No active combat — show join button */}
      {connected && !combat && (
        <div className="text-center space-y-6 flex-1 flex flex-col items-center justify-center">
          <div className="flex gap-8 items-end">
            <img
              src={asset("8bit-wizard.png")}
              alt="Mage"
              className="pixelated w-32 h-32 md:w-40 md:h-40"
            />
            <span className="retro text-2xl text-destructive mb-8">VS</span>
            <img
              src={asset("8bit-orc-warrior.png")}
              alt="Orc"
              className="pixelated w-32 h-32 md:w-40 md:h-40 -scale-x-100"
            />
          </div>
          <p className="retro text-xs text-muted-foreground max-w-sm">
            Enter the arena and face your opponent in magical combat!
          </p>
          <Button onClick={joinCombat}>Enter Arena</Button>
        </div>
      )}

      {/* Waiting for opponent */}
      {combat?.status.tag === "WaitingForPlayers" && (
        <div className="flex-1 flex items-center">
          <WaitingScreen onCancel={leaveCombat} />
        </div>
      )}

      {/* Combat in progress */}
      {combat?.status.tag === "InProgress" && identity && (
        <CombatArena
          combat={combat}
          identity={identity}
          spells={spells}
          logs={logs}
          isMyTurn={isMyTurn}
          isPlayer1={!!isPlayer1}
          myHp={myHp}
          myMana={myMana}
          opponentHp={opponentHp}
          opponentMana={opponentMana}
          onCast={castSpell}
        />
      )}

      {/* Combat finished */}
      {combat?.status.tag === "Finished" && (
        <div className="flex-1 flex items-center">
          <VictoryScreen
            winnerId={combat.winnerId}
            identity={identity}
            onPlayAgain={() => {
              // Leave finished combat, then rejoin
              leaveCombat();
              setTimeout(joinCombat, 500);
            }}
            onGoHome={() => navigate("/")}
          />
        </div>
      )}
    </div>
  );
}
