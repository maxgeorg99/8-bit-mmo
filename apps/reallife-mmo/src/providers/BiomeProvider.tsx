import { useEffect } from "react";
import { useGameStore } from "@/lib/gameStore";
import { useThemeConfig } from "@/components/active-theme";
import { ThemeStyles } from "@/components/theme-styles";
import { BIOME_TO_THEME, type BiomeId } from "@/lib/biomeThemes";

/**
 * Watches the player's current biome and syncs the 8bitcn theme.
 * Wrap inside <ActiveThemeProvider> in main.tsx.
 */
export function BiomeProvider({ children }: { children: React.ReactNode }) {
  const currentBiome = useGameStore((s) => s.player.currentBiome ?? "plains") as BiomeId;
  const { activeTheme, setActiveTheme } = useThemeConfig();

  const targetTheme = BIOME_TO_THEME[currentBiome] ?? BIOME_TO_THEME.plains;

  useEffect(() => {
    if (activeTheme !== targetTheme) {
      setActiveTheme(targetTheme);
    }
  }, [targetTheme, activeTheme, setActiveTheme]);

  return (
    <>
      <ThemeStyles theme={activeTheme} />
      {children}
    </>
  );
}
