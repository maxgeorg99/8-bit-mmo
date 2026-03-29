import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Button } from "@/components/ui/8bit/button";
import { Badge } from "@/components/ui/8bit/badge";
import { Input } from "@/components/ui/8bit/input";
import { Slider } from "@/components/ui/8bit/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/8bit/select";
import type { ActivityType } from "@/lib/types";
import { ACTIVITY_ICONS, ACTIVITY_INPUT, ACTIVITY_TYPES } from "@/lib/types";
import { calculateStatDeltas, calculateXpGain } from "@/lib/statEngine";
import { cn } from "@/lib/utils";

interface ActivityLoggerProps {
  streakDays: number;
  defaultActivityType?: ActivityType;
  onLog: (type: ActivityType, rawValue: number, intensity: number, note?: string) => void;
}

export function ActivityLogger({ streakDays, defaultActivityType, onLog }: ActivityLoggerProps) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<ActivityType>(
    defaultActivityType ?? "StrengthTraining",
  );
  const [rawValue, setRawValue] = useState(
    ACTIVITY_INPUT[defaultActivityType ?? "StrengthTraining"].defaultValue,
  );
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");
  const [justLogged, setJustLogged] = useState(false);

  const config = ACTIVITY_INPUT[selectedType];

  // Reset value to default when activity type changes
  useEffect(() => {
    setRawValue(config.defaultValue);
    if (!config.hasIntensity) setIntensity(5);
  }, [selectedType, config.defaultValue, config.hasIntensity]);

  // Preview deltas
  const previewDeltas = calculateStatDeltas(selectedType, rawValue, intensity, streakDays, 0);
  const previewXp = calculateXpGain(selectedType, rawValue, intensity, streakDays);

  const handleLog = () => {
    onLog(selectedType, rawValue, intensity, note || undefined);
    setNote("");
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1500);
  };

  // Format the display value based on mode
  const formatValue = (val: number): string => {
    switch (config.mode) {
      case "sleep":
        return val % 1 === 0 ? `${val}h` : `${val}h`;
      case "meal":
        return ["", "Snack", "Light meal", "Full meal"][val] ?? `${val}`;
      case "glasses":
        return `${val} ${val === 1 ? "glass" : "glasses"}`;
      case "duration":
      default:
        return val >= 60
          ? `${Math.floor(val / 60)}h ${val % 60 > 0 ? `${val % 60}m` : ""}`
          : `${val}m`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">{t("activity.logActivity")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Activity type select */}
        <div className="space-y-2">
          <label className="retro text-[10px] text-muted-foreground">
            {t("activity.activityType")}
          </label>
          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ActivityType)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {ACTIVITY_ICONS[type]} {t(`activityTypes.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Value input — adapts per activity type */}
        <div className="space-y-4">
          <label className="retro text-[10px] text-muted-foreground block pb-1">
            {config.label}: <span className="text-foreground">{formatValue(rawValue)}</span>
          </label>

          {/* Quick presets */}
          <div className="flex gap-3 flex-wrap">
            {config.presets.map((p) => (
              <Button
                key={p.value}
                variant={rawValue === p.value ? "default" : "outline"}
                size="sm"
                className="text-[7px] px-3 py-1"
                onClick={() => setRawValue(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Slider for fine control */}
          <Slider
            min={config.min}
            max={config.max}
            step={config.step}
            value={[rawValue]}
            onValueChange={([v]) => setRawValue(v)}
            className="mt-2"
          />
        </div>

        {/* Intensity — only for activities that have it */}
        {config.hasIntensity && (
          <div className="space-y-3">
            <label className="retro text-[10px] text-muted-foreground">
              {t("activity.intensity", { value: intensity })}
            </label>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[intensity]}
              onValueChange={([v]) => setIntensity(v)}
            />
            <div className="flex justify-between retro text-[6px] text-muted-foreground">
              <span>{t("activity.intensityEasy")}</span>
              <span>{t("activity.intensityModerate")}</span>
              <span>{t("activity.intensityMax")}</span>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="space-y-2">
          <label className="retro text-[10px] text-muted-foreground">
            {t("activity.note")}{" "}
            <span className="text-muted-foreground/50">{t("activity.noteOptional")}</span>
          </label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} className="text-xs" />
        </div>

        {/* Preview */}
        <div className="border border-border p-3 space-y-2">
          <div className="retro text-[8px] text-muted-foreground">{t("activity.previewGains")}</div>
          <div className="retro text-[9px] text-yellow-500">+{previewXp} XP</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(previewDeltas).map(([stat, val]) => (
              <Badge key={stat} variant="secondary" className="text-[7px]">
                {stat} +{(val as number).toFixed(1)}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleLog}
          className={cn("w-full", justLogged && "bg-green-600")}
          disabled={justLogged}
        >
          {justLogged ? t("activity.logged") : t("activity.logActivity")}
        </Button>
      </CardFooter>
    </Card>
  );
}
