import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/8bit/card";

interface WaitingScreenProps {
  onCancel: () => void;
}

export function WaitingScreen({ onCancel }: WaitingScreenProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg text-center">Waiting for Opponent...</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <img
          src="/8bit-wizard.png"
          alt="Mage waiting"
          className="pixelated w-32 h-32 mx-auto animate-bounce"
        />
        <p className="retro text-[10px] text-muted-foreground">A challenger will appear soon</p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
