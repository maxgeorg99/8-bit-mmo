import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { asset } from "@/lib/utils";

interface WaitingScreenProps {
  onCancel: () => void;
}

export function WaitingScreen({ onCancel }: WaitingScreenProps) {
  const { t } = useTranslation();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg text-center">{t("combat.waitingForOpponentTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <img
          src={asset("8bit-wizard.png")}
          alt="Mage waiting"
          className="pixelated w-32 h-32 mx-auto animate-bounce"
        />
        <p className="retro text-[10px] text-muted-foreground">{t("combat.challengerSoon")}</p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </CardFooter>
    </Card>
  );
}
