import { useEffect } from "react";
import { getThemeCode, Theme } from "@/lib/themes";

/**
 * Injects the dark mode CSS variables for the active theme.
 * Extracts just the .dark { ... } block and applies it as a high-specificity
 * override via a <style> tag with :root.dark selector.
 */
export function ThemeStyles({ theme }: { theme: Theme }) {
  useEffect(() => {
    const css = getThemeCode(theme);
    if (!css) return;

    // Extract the .dark { ... } block
    const darkMatch = css.match(/\.dark\s*\{([^}]+)\}/);
    if (!darkMatch) return;

    const darkVars = darkMatch[1].trim();

    // Also extract :root vars for light mode
    const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
    const rootVars = rootMatch ? rootMatch[1].trim() : "";

    // Apply as high-specificity selectors that override the base theme
    const scoped = `
      :root { ${rootVars} }
      .dark { ${darkVars} }
    `;

    const id = "theme-css-active";
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = scoped;
  }, [theme]);

  return null;
}
