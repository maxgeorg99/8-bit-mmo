import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { Theme } from "@/lib/themes";

const DEFAULT_THEME = Theme.PixelForest; // RPG default — dark forest theme

interface ThemeContextType {
  activeTheme: Theme;
  setActiveTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ActiveThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme?: Theme;
}) {
  const [activeTheme, setActiveTheme] = useState<Theme>(() => initialTheme || DEFAULT_THEME);

  useEffect(() => {
    const targets = [document.body, document.documentElement];

    for (const el of targets) {
      // Remove all existing theme classes
      const themeClasses = Array.from(el.classList).filter((className) =>
        className.startsWith("theme-"),
      );
      for (const className of themeClasses) {
        el.classList.remove(className);
      }
      // Add the active theme class
      el.classList.add(`theme-${activeTheme}`);
    }
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeConfig() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeConfig must be used within an ActiveThemeProvider");
  }
  return context;
}
