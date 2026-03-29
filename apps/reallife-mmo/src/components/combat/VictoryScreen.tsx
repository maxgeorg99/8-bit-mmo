import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { asset } from "@/lib/utils";
import type { Identity } from "spacetimedb";

interface VictoryScreenProps {
  winnerId: Identity | undefined;
  identity: Identity | null;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function VictoryScreen({ winnerId, identity, onPlayAgain, onGoHome }: VictoryScreenProps) {
  const { t } = useTranslation();
  const isWinner = identity && winnerId && winnerId.isEqual(identity);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle
          className={`text-2xl text-center ${isWinner ? "text-primary" : "text-destructive"}`}
        >
          {isWinner ? t("combat.victory") : t("combat.defeat")}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <img
          src={isWinner ? asset("8bit-wizard.png") : asset("8bit-ogre.png")}
          alt={isWinner ? "Victory" : "Defeat"}
          className="pixelated w-40 h-40 mx-auto"
        />
        <p className="retro text-xs text-muted-foreground">
          {isWinner ? t("combat.enemyVanquished") : t("combat.fallenInBattle")}
        </p>
      </CardContent>
      <CardFooter className="justify-center gap-4">
        <Button onClick={onPlayAgain}>{t("combat.playAgain")}</Button>
        <Button variant="outline" onClick={onGoHome}>
          {t("combat.goHome")}
        </Button>
      </CardFooter>
    </Card>
  );
}
