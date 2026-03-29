import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/8bit/button";
import { asset } from "@/lib/utils";

export function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-8 text-center">
      {/* Ogre character */}
      <img
        src={asset("8bit-ogre.png")}
        alt="8-bit Ogre"
        className="pixelated w-48 h-48 md:w-64 md:h-64"
      />

      {/* Error text */}
      <div className="space-y-4">
        <h1 className="retro text-4xl md:text-6xl text-destructive">{t("notFound.title")}</h1>
        <h2 className="retro text-sm md:text-lg text-foreground">{t("notFound.ogreAngry")}</h2>
        <p className="retro text-[10px] md:text-xs text-muted-foreground max-w-sm mx-auto">
          {t("notFound.roomDoesntExist")}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-6">
        <Button onClick={() => navigate("/dashboard")}>{t("notFound.returnToTown")}</Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          {t("notFound.goBack")}
        </Button>
      </div>
    </div>
  );
}
