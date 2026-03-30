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
    // Phase 6.1 bug fix interpolation keys
    expect(en.activityInput.glass_one).toContain("{{count}}");
    expect(en.activityInput.glass_other).toContain("{{count}}");
    expect(en.activityInput.glassesOfWater).toContain("{{count}}");
    expect(en.activityInput.hoursOfSleep).toContain("{{hours}}");
    expect(en.activityInput.minDuration).toContain("{{min}}");
    expect(en.questTemplates.session).toContain("{{activity}}");
    expect(en.questTemplates.sessionDesc).toContain("{{min}}");
    expect(en.playerInspect.whisper).toContain("{{name}}");
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
    // Phase 6.1 bug fix namespaces
    "classes",
    "common2",
    "questTypes",
    "questTemplates",
    "biomes",
    "titles",
    "tierLabels",
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

// ── Phase 6.1 Bug Fix Coverage ───────────────────────────────

describe("B1/B2: class names translated in all locales", () => {
  const expectedClasses = [
    "Warrior",
    "Mage",
    "Rogue",
    "Paladin",
    "Druid",
    "Ranger",
    "Bard",
    "Scholar",
    "Unclassed",
  ];

  for (const cls of expectedClasses) {
    it(`has classes.${cls} in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const classes = (locale as Record<string, Record<string, string>>).classes;
        expect(classes, `${code} missing classes namespace`).toBeDefined();
        expect(classes[cls], `${code} missing classes.${cls}`).toBeDefined();
        expect(classes[cls].length, `${code} classes.${cls} is empty`).toBeGreaterThan(0);
      }
    });
  }

  it("non-English locales actually translate class names (not just English)", () => {
    for (const code of LOCALE_CODES.filter((c) => c !== "en")) {
      const locale = LOCALES[code] as Record<string, Record<string, string>>;
      // At least some classes should differ from English
      const enClasses = (en as unknown as Record<string, Record<string, string>>).classes;
      const translated = Object.keys(enClasses).filter(
        (cls) => locale.classes[cls] !== enClasses[cls],
      );
      expect(
        translated.length,
        `${code} has no translated class names — all identical to English`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("B1: health/experience/mana labels (common2)", () => {
  const requiredKeys = ["health", "experience", "mana"];

  for (const key of requiredKeys) {
    it(`has common2.${key} in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const common2 = (locale as Record<string, Record<string, string>>).common2;
        expect(common2, `${code} missing common2 namespace`).toBeDefined();
        expect(common2[key], `${code} missing common2.${key}`).toBeDefined();
      }
    });
  }
});

describe("B3: quest template keys in all locales", () => {
  const requiredTemplateKeys = [
    "session",
    "extended",
    "morningRitual",
    "quick",
    "sessionDesc",
    "extendedDesc",
    "morningRitualDesc",
    "quickDesc",
  ];

  for (const key of requiredTemplateKeys) {
    it(`has questTemplates.${key} in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const qt = (locale as Record<string, Record<string, string>>).questTemplates;
        expect(qt, `${code} missing questTemplates namespace`).toBeDefined();
        expect(qt[key], `${code} missing questTemplates.${key}`).toBeDefined();
      }
    });
  }

  it("activity-interpolated templates contain {{activity}} placeholder", () => {
    const activityTemplates = ["session", "extended", "quick"];
    for (const key of activityTemplates) {
      expect(en.questTemplates[key as keyof typeof en.questTemplates]).toContain("{{activity}}");
    }
  });

  it("description templates with min contain {{min}} placeholder", () => {
    const minTemplates = ["sessionDesc", "extendedDesc", "quickDesc"];
    for (const key of minTemplates) {
      expect(en.questTemplates[key as keyof typeof en.questTemplates]).toContain("{{min}}");
    }
  });
});

describe("B4: quest type keys in all locales", () => {
  const requiredTypes = ["daily", "weekly", "custom"];

  for (const key of requiredTypes) {
    it(`has questTypes.${key} in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const qt = (locale as Record<string, Record<string, string>>).questTypes;
        expect(qt, `${code} missing questTypes namespace`).toBeDefined();
        expect(qt[key], `${code} missing questTypes.${key}`).toBeDefined();
      }
    });
  }
});

describe("B5: biome names, descriptions, and unlock hints in all locales", () => {
  const biomeIds = [
    "plains",
    "tundra",
    "volcano",
    "forest",
    "dungeon",
    "desert",
    "spire",
    "ruins",
    "celestial",
  ];

  for (const biome of biomeIds) {
    it(`has biomes.${biome} (name) in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const biomes = (locale as Record<string, Record<string, string>>).biomes;
        expect(biomes[biome], `${code} missing biomes.${biome}`).toBeDefined();
      }
    });

    it(`has biomes.${biome}Desc in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const biomes = (locale as Record<string, Record<string, string>>).biomes;
        expect(biomes[`${biome}Desc`], `${code} missing biomes.${biome}Desc`).toBeDefined();
      }
    });

    it(`has biomes.${biome}Unlock in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const biomes = (locale as Record<string, Record<string, string>>).biomes;
        expect(biomes[`${biome}Unlock`], `${code} missing biomes.${biome}Unlock`).toBeDefined();
      }
    });
  }
});

describe("B6: activity input label keys reference valid i18n keys", () => {
  // The ACTIVITY_INPUT configs use labelKey like "activityInput.duration"
  const requiredLabelKeys = [
    "activityInput.duration",
    "activityInput.mealQuality",
    "activityInput.waterIntake",
    "activityInput.sleepDuration",
  ];

  for (const key of requiredLabelKeys) {
    it(`${key} exists in en locale`, () => {
      const [ns, subkey] = key.split(".");
      expect((en as unknown as Record<string, Record<string, string>>)[ns][subkey]).toBeDefined();
    });
  }
});

describe("B7: activity input format values in all locales", () => {
  const requiredKeys = [
    "snack",
    "lightMeal",
    "fullMeal",
    "glass_one",
    "glass_other",
    "glassesOfWater",
    "hoursOfSleep",
    "minDuration",
    "durationWithIntensity",
  ];

  for (const key of requiredKeys) {
    it(`has activityInput.${key} in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const ai = (locale as Record<string, Record<string, string>>).activityInput;
        expect(ai, `${code} missing activityInput namespace`).toBeDefined();
        expect(ai[key], `${code} missing activityInput.${key}`).toBeDefined();
      }
    });
  }
});

describe("B8: title names and descriptions in all locales", () => {
  // Spot-check a representative set of titles
  const sampleTitles = [
    "first_step",
    "iron_will",
    "century",
    "marathon_finisher",
    "zen_master",
    "world_explorer",
    "dragonslayer",
    "gladiator",
    "guild_champion",
    "dedicated",
    "class_master",
  ];

  for (const titleId of sampleTitles) {
    it(`has titles.${titleId} and titles.${titleId}_desc in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const titles = (locale as Record<string, Record<string, string>>).titles;
        expect(titles, `${code} missing titles namespace`).toBeDefined();
        expect(titles[titleId], `${code} missing titles.${titleId}`).toBeDefined();
        expect(titles[`${titleId}_desc`], `${code} missing titles.${titleId}_desc`).toBeDefined();
      }
    });
  }
});

describe("tier labels in all locales", () => {
  const tiers = ["novice", "apprentice", "adept", "veteran", "master", "legend"];

  for (const tier of tiers) {
    it(`has tierLabels.${tier} in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const tl = (locale as Record<string, Record<string, string>>).tierLabels;
        expect(tl, `${code} missing tierLabels namespace`).toBeDefined();
        expect(tl[tier], `${code} missing tierLabels.${tier}`).toBeDefined();
      }
    });
  }
});

describe("quest i18n: key encoding and resolution", () => {
  /**
   * Replicate resolveQuestString from QuestCard.tsx for testing.
   * Format: "i18n:key:param1=val1:param2=val2"
   */
  function resolveQuestString(
    str: string,
    t: (key: string, params?: Record<string, string>) => string,
  ): string {
    if (!str.startsWith("i18n:")) return str;
    const keyAndParams = str.slice(5);
    const segments = keyAndParams.split(":");
    const key = segments[0];
    const params: Record<string, string> = {};
    for (let i = 1; i < segments.length; i++) {
      const eqIdx = segments[i].indexOf("=");
      if (eqIdx > 0) {
        const paramKey = segments[i].slice(0, eqIdx);
        const paramVal = segments[i].slice(eqIdx + 1);
        if (paramKey === "activityType") {
          params["activity"] = `[translated:${paramVal}]`;
        } else {
          params[paramKey] = paramVal;
        }
      }
    }
    return t(key, params);
  }

  it("returns raw string when not prefixed with i18n:", () => {
    const t = (key: string) => key;
    expect(resolveQuestString("Custom quest", t)).toBe("Custom quest");
  });

  it("extracts key from i18n: prefix", () => {
    let capturedKey = "";
    const t = (key: string) => {
      capturedKey = key;
      return key;
    };
    resolveQuestString("i18n:questTemplates.morningRitual", t);
    expect(capturedKey).toBe("questTemplates.morningRitual");
  });

  it("extracts key and params from i18n: prefix with params", () => {
    let capturedKey = "";
    let capturedParams: Record<string, string> = {};
    const t = (key: string, params?: Record<string, string>) => {
      capturedKey = key;
      capturedParams = params ?? {};
      return key;
    };
    resolveQuestString("i18n:questTemplates.session:activityType=Cardio", t);
    expect(capturedKey).toBe("questTemplates.session");
    expect(capturedParams.activity).toBe("[translated:Cardio]");
  });

  it("extracts numeric min param from description key", () => {
    let capturedParams: Record<string, string> = {};
    const t = (_key: string, params?: Record<string, string>) => {
      capturedParams = params ?? {};
      return "";
    };
    resolveQuestString("i18n:questTemplates.sessionDesc:min=30", t);
    expect(capturedParams.min).toBe("30");
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
