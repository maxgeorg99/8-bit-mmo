import { asset } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
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
import { useMyPlayer } from "@/hooks/useStdbPlayer";
import { useReducer } from "spacetimedb/react";
import { reducers } from "@/generated";
import { LanguageSelector } from "@/components/game/LanguageSelector";

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { player } = useMyPlayer();
  const stdbSetName = useReducer(reducers.setPlayerName);
  const [name, setName] = useState(player?.name ?? "");

  const hasStarted = (player?.totalActivities ?? 0) > 0 || (player?.name ?? "") !== "";

  // Returning players skip the landing and go straight to dashboard
  useEffect(() => {
    if (hasStarted) void navigate("/dashboard", { replace: true });
  }, [hasStarted, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="retro text-2xl md:text-4xl text-foreground leading-tight">
          {t("home.title")}
        </h1>
        <p className="retro text-[8px] md:text-[10px] text-muted-foreground max-w-sm mx-auto">
          {t("home.subtitle")}
        </p>
      </div>

      {/* Class showcase */}
      <div className="flex gap-4 items-end">
        <div className="text-center">
          <img src={asset("8bit-wizard.png")} alt="Mage" className="pixelated w-16 h-16 mx-auto" />
          <Badge variant="secondary" className="text-[6px] mt-1">
            {t("home.classes.mage")}
          </Badge>
        </div>
        <div className="text-center">
          <img
            src={asset("8bit-orc-warrior.png")}
            alt="Warrior"
            className="pixelated w-20 h-20 mx-auto"
          />
          <Badge className="text-[6px] mt-1">{t("home.classes.warrior")}</Badge>
        </div>
        <div className="text-center">
          <img src={asset("8bit-ogre.png")} alt="Tank" className="pixelated w-16 h-16 mx-auto" />
          <Badge variant="secondary" className="text-[6px] mt-1">
            {t("home.classes.tank")}
          </Badge>
        </div>
      </div>

      {/* Name entry — only shown for new players (returning players are redirected) */}
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-sm">{t("home.chooseYourName")}</CardTitle>
          <CardDescription className="text-[8px]">
            {t("home.everyHeroNeedsIdentity")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder={t("home.enterHeroName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-xs"
          />
          <div className="space-y-1">
            <label className="retro text-[8px] text-muted-foreground">
              {t("settings.language")}
            </label>
            <LanguageSelector />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              const heroName = name || t("home.unnamedHero");
              void stdbSetName({ name: heroName });
              void navigate("/dashboard");
            }}
          >
            {t("home.beginAdventure")}
          </Button>
        </CardFooter>
      </Card>

      {/* Feature highlights */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {[
          {
            icon: "💪",
            label: t("home.features.logActivities"),
            desc: t("home.features.logActivitiesDesc"),
          },
          {
            icon: "⚔️",
            label: t("home.features.earnStats"),
            desc: t("home.features.earnStatsDesc"),
          },
          {
            icon: "📜",
            label: t("home.features.dailyQuests"),
            desc: t("home.features.dailyQuestsDesc"),
          },
          {
            icon: "🏟️",
            label: t("home.features.pvpArena"),
            desc: t("home.features.pvpArenaDesc"),
          },
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
