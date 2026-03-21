import { useState } from "react";
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

export function Home() {
  const navigate = useNavigate();
  const [quest, setQuest] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="retro text-3xl md:text-5xl text-foreground leading-tight">8-Bit Demo</h1>
        <p className="retro text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
          A retro-styled playground built with 8bitcn components
        </p>
      </div>

      {/* Quest Input */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Enter Your Quest</CardTitle>
          <CardDescription className="text-xs">Every hero needs a mission</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Type your quest..."
            value={quest}
            onChange={(e) => setQuest(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex gap-4 flex-wrap">
          <Button onClick={() => alert(`Quest accepted: ${quest || "???"}`)}>Accept Quest</Button>
          <Button variant="outline" onClick={() => setQuest("")}>
            Clear
          </Button>
        </CardFooter>
      </Card>

      {/* Enter Arena */}
      <div className="space-y-6 text-center">
        <div className="flex gap-6 items-end justify-center">
          <img src="/8bit-wizard.png" alt="Mage" className="pixelated w-20 h-20" />
          <span className="retro text-lg text-destructive mb-4">VS</span>
          <img src="/8bit-orc-warrior.png" alt="Orc" className="pixelated w-20 h-20 -scale-x-100" />
        </div>
        <Button onClick={() => navigate("/combat")}>Enter the Arena</Button>
      </div>

      {/* Button Variants */}
      <div className="space-y-6 text-center">
        <h2 className="retro text-sm text-muted-foreground">Button Variants</h2>
        <div className="flex flex-wrap gap-6 justify-center">
          <Button>Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
    </div>
  );
}
