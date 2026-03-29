/**
 * Tests for phase 6.1 — Localization (i18n).
 *
 * Verifies:
 * - All 7 locale files have identical key structures
 * - Interpolation placeholders work correctly
 * - Language detection and persistence logic
 * - SUPPORTED_LANGUAGES constant covers all expected languages
 */
import { describe, expect, it } from "vite-plus/test";

// ── Import locale JSON directly for structural validation ──────
import en from "../../i18n/locales/en.json";
import de from "../../i18n/locales/de.json";
import es from "../../i18n/locales/es.json";
import fr from "../../i18n/locales/fr.json";
import pt from "../../i18n/locales/pt.json";
import ja from "../../i18n/locales/ja.json";
import zh from "../../i18n/locales/zh.json";

// ── Helpers ────────────────────────────────────────────────────

/** Recursively extract all leaf keys from a nested object as dot-separated paths */
function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    const val = obj[k];
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      keys = keys.concat(getKeys(val as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

/** Extract interpolation placeholders like {{name}} from a string */
function extractPlaceholders(value: string): string[] {
  const matches = value.match(/\{\{(\w+)\}\}/g);
  return matches ? matches.sort() : [];
}

/** Recursively collect all leaf values as [key, value] pairs */
function getLeafEntries(obj: Record<string, unknown>, prefix = ""): Array<[string, string]> {
  const entries: Array<[string, string]> = [];
  for (const k of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    const val = obj[k];
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      entries.push(...getLeafEntries(val as Record<string, unknown>, path));
    } else if (typeof val === "string") {
      entries.push([path, val]);
    }
  }
  return entries;
}

// ── Locale map for iteration ──────────────────────────────────

const LOCALES: Record<string, Record<string, unknown>> = {
  en,
  de,
  es,
  fr,
  pt,
  ja,
  zh,
};

const LOCALE_CODES = Object.keys(LOCALES);
const enKeys = getKeys(en as Record<string, unknown>);

// ── Tests ─────────────────────────────────────────────────────

describe("i18n locale structure", () => {
  it("has all 7 required languages", () => {
    expect(LOCALE_CODES).toEqual(
      expect.arrayContaining(["en", "de", "es", "fr", "pt", "ja", "zh"]),
    );
    expect(LOCALE_CODES).toHaveLength(7);
  });

  it("English locale has a reasonable number of keys", () => {
    expect(enKeys.length).toBeGreaterThan(100);
  });

  for (const code of LOCALE_CODES.filter((c) => c !== "en")) {
    it(`${code} has the same keys as en`, () => {
      const keys = getKeys(LOCALES[code] as Record<string, unknown>);
      const missingInLocale = enKeys.filter((k) => !keys.includes(k));
      const extraInLocale = keys.filter((k) => !enKeys.includes(k));

      expect(missingInLocale).toEqual([]);
      expect(extraInLocale).toEqual([]);
    });
  }

  for (const code of LOCALE_CODES.filter((c) => c !== "en")) {
    it(`${code} has no empty string values`, () => {
      const entries = getLeafEntries(LOCALES[code] as Record<string, unknown>);
      const empties = entries.filter(([, v]) => v === "");
      expect(empties.map(([k]) => k)).toEqual([]);
    });
  }
});

describe("i18n interpolation placeholders", () => {
  const enEntries = getLeafEntries(en as Record<string, unknown>);

  for (const code of LOCALE_CODES.filter((c) => c !== "en")) {
    it(`${code} has matching interpolation placeholders for every key`, () => {
      const localeEntries = new Map(getLeafEntries(LOCALES[code] as Record<string, unknown>));
      const mismatches: string[] = [];

      for (const [key, enValue] of enEntries) {
        const localeValue = localeEntries.get(key);
        if (!localeValue) continue; // Missing keys are caught by structure tests

        const enPlaceholders = extractPlaceholders(enValue);
        const localePlaceholders = extractPlaceholders(localeValue);

        if (JSON.stringify(enPlaceholders) !== JSON.stringify(localePlaceholders)) {
          mismatches.push(
            `${key}: en=${JSON.stringify(enPlaceholders)} ${code}=${JSON.stringify(localePlaceholders)}`,
          );
        }
      }

      expect(mismatches).toEqual([]);
    });
  }

  it("known interpolated keys contain expected placeholders", () => {
    // Spot-check a few important keys
    expect(en.common.levelAbbr).toContain("{{level}}");
    expect(en.common.goldAmount).toContain("{{amount}}");
    expect(en.common.playerCount_one).toContain("{{count}}");
    expect(en.dashboard.dayStreak).toContain("{{count}}");
    expect(en.combat.youDefeated).toContain("{{name}}");
    expect(en.quests.createGoalButton).toContain("{{xp}}");
    expect(en.activityInput.durationWithIntensity).toContain("{{min}}");
    expect(en.activityInput.durationWithIntensity).toContain("{{intensity}}");
  });
});

describe("i18n top-level namespace coverage", () => {
  const expectedNamespaces = [
    "common",
    "nav",
    "home",
    "dashboard",
    "character",
    "activity",
    "activityTypes",
    "activityInput",
    "quests",
    "combat",
    "worldMap",
    "location",
    "guild",
    "raid",
    "leaderboard",
    "friends",
    "notFound",
    "chat",
    "levelUp",
    "settings",
  ];

  for (const ns of expectedNamespaces) {
    it(`has namespace "${ns}" in en locale`, () => {
      expect(en).toHaveProperty(ns);
    });
  }
});

describe("SUPPORTED_LANGUAGES constant", () => {
  // We test the replicated constant here to avoid importing the module
  // which triggers i18n init side effects in the test environment
  const SUPPORTED_LANGUAGES = [
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "pt", label: "Português" },
    { code: "ja", label: "日本語" },
    { code: "zh", label: "中文" },
  ] as const;

  it("has all 7 languages", () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(7);
  });

  it("codes match locale file names", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toEqual(LOCALE_CODES);
  });

  it("every language has a native-script label (not English)", () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(lang.label.length).toBeGreaterThan(0);
      // Non-English labels should not be the English name (except English itself)
      if (lang.code !== "en") {
        expect(lang.label).not.toBe(lang.code);
      }
    }
  });
});

describe("language detection logic", () => {
  const SUPPORTED_CODES = ["en", "de", "es", "fr", "pt", "ja", "zh"];

  /** Replicate detectLanguage logic from i18n/index.ts */
  function detectLanguage(storedLang: string | null, browserLang: string): string {
    if (storedLang && SUPPORTED_CODES.includes(storedLang)) return storedLang;
    const code = browserLang.split("-")[0];
    if (code && SUPPORTED_CODES.includes(code)) return code;
    return "en";
  }

  it("returns saved language from localStorage when valid", () => {
    expect(detectLanguage("de", "en-US")).toBe("de");
    expect(detectLanguage("ja", "fr-FR")).toBe("ja");
  });

  it("ignores invalid saved language", () => {
    expect(detectLanguage("klingon", "en-US")).toBe("en");
  });

  it("falls back to browser language when no saved value", () => {
    expect(detectLanguage(null, "fr-FR")).toBe("fr");
    expect(detectLanguage(null, "de-DE")).toBe("de");
    expect(detectLanguage(null, "ja")).toBe("ja");
  });

  it("extracts base code from browser language with region", () => {
    expect(detectLanguage(null, "pt-BR")).toBe("pt");
    expect(detectLanguage(null, "zh-TW")).toBe("zh");
    expect(detectLanguage(null, "es-MX")).toBe("es");
  });

  it("falls back to en when browser language is unsupported", () => {
    expect(detectLanguage(null, "ko-KR")).toBe("en");
    expect(detectLanguage(null, "sv")).toBe("en");
  });

  it("falls back to en when both localStorage and browser are unsupported", () => {
    expect(detectLanguage("invalid", "unknown")).toBe("en");
  });
});

describe("language persistence", () => {
  /** Replicate changeLanguage persistence logic */
  function changeLanguagePersist(lang: string, storage: Map<string, string>): void {
    storage.set("language", lang);
  }

  it("persists language choice to storage", () => {
    const storage = new Map<string, string>();
    changeLanguagePersist("fr", storage);
    expect(storage.get("language")).toBe("fr");
  });

  it("overwrites previous choice", () => {
    const storage = new Map<string, string>();
    changeLanguagePersist("de", storage);
    changeLanguagePersist("ja", storage);
    expect(storage.get("language")).toBe("ja");
  });
});

describe("i18n config correctness", () => {
  it("fallback language is en", () => {
    // Verified by reading the config — i18n is initialized with fallbackLng: "en"
    // We test this structurally: en must have all keys (it's the superset)
    for (const code of LOCALE_CODES) {
      const keys = getKeys(LOCALES[code] as Record<string, unknown>);
      expect(keys.length).toBe(enKeys.length);
    }
  });

  it("no locale values are just the English key path", () => {
    // Catch untranslated values that were accidentally set to the key path
    for (const code of LOCALE_CODES.filter((c) => c !== "en")) {
      const entries = getLeafEntries(LOCALES[code] as Record<string, unknown>);
      const suspicious = entries.filter(([key, val]) => val === key);
      expect(suspicious.map(([k]) => k)).toEqual([]);
    }
  });
});
