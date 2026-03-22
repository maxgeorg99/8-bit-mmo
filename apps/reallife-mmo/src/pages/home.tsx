import { asset } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { useGameStore } from "@/lib/gameStore";

export function Home() {
  const navigate = useNavigate();
  const player = useGameStore((s) => s.player);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const [name, setName] = useState(player.name);

  const hasStarted = player.totalActivities > 0 || player.name !== "";

  // Returning players skip the landing and go straight to dashboard
  useEffect(() => {
    if (hasStarted) navigate("/dashboard", { replace: true });
  }, [hasStarted, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="retro text-2xl md:text-4xl text-foreground leading-tight">Reallife MMO</h1>
        <p className="retro text-[8px] md:text-[10px] text-muted-foreground max-w-sm mx-auto">
          Your life is the grind. The gym bro becomes a Warrior, the bookworm a Mage, the runner a
          Rogue — all from real logged activity.
        </p>
      </div>

      {/* Class showcase */}
      <div className="flex gap-4 items-end">
        <div className="text-center">
          <img src={asset("8bit-wizard.png")} alt="Mage" className="pixelated w-16 h-16 mx-auto" />
          <Badge variant="secondary" className="text-[6px] mt-1">
            Mage
          </Badge>
        </div>
        <div className="text-center">
          <img
            src={asset("8bit-orc-warrior.png")}
            alt="Warrior"
            className="pixelated w-20 h-20 mx-auto"
          />
          <Badge className="text-[6px] mt-1">Warrior</Badge>
        </div>
        <div className="text-center">
          <img src={asset("8bit-ogre.png")} alt="Tank" className="pixelated w-16 h-16 mx-auto" />
          <Badge variant="secondary" className="text-[6px] mt-1">
            Tank
          </Badge>
        </div>
      </div>

      {/* Name entry — only shown for new players (returning players are redirected) */}
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-sm">Choose Your Name</CardTitle>
          <CardDescription className="text-[8px]">Every hero needs an identity</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter hero name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-xs"
          />
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              setPlayerName(name || "Unnamed Hero");
              navigate("/dashboard");
            }}
          >
            Begin Adventure
          </Button>
        </CardFooter>
      </Card>

      {/* Feature highlights */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {[
          { icon: "💪", label: "Log Activities", desc: "Gym, running, study..." },
          { icon: "⚔️", label: "Earn Stats", desc: "STR, INT, AGI..." },
          { icon: "📜", label: "Daily Quests", desc: "Challenges & rewards" },
          { icon: "🏟️", label: "PvP Arena", desc: "Battle other players" },
        ].map((f) => (
          <div key={f.label} className="border border-border p-3 text-center">
            <div className="text-lg">{f.icon}</div>
            <div className="retro text-[7px] mt-1">{f.label}</div>
            <div className="retro text-[6px] text-muted-foreground">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
