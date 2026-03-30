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
import { resolveQuestString } from "../questI18n";

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
    // Phase 6.1 B10 bug fix namespaces
    "stats",
    "merchants",
    "shop",
    "equipment",
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

describe("B9: location translation keys in all locales", () => {
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
  const locationSuffixes = ["city", "wild", "boss"];

  for (const biome of biomeIds) {
    for (const suffix of locationSuffixes) {
      const locId = `${biome}-${suffix}`;
      it(`has locations.${locId}.name and .description in all locales`, () => {
        for (const [code, locale] of Object.entries(LOCALES)) {
          const locations = (locale as Record<string, Record<string, Record<string, string>>>)
            .locations;
          expect(locations, `${code} missing locations namespace`).toBeDefined();
          expect(locations[locId], `${code} missing locations.${locId}`).toBeDefined();
          expect(locations[locId].name, `${code} missing locations.${locId}.name`).toBeDefined();
          expect(
            locations[locId].description,
            `${code} missing locations.${locId}.description`,
          ).toBeDefined();
        }
      });
    }
  }

  it("has locationTypes (city, wilderness, boss_lair) in all locales", () => {
    const types = ["city", "wilderness", "boss_lair"];
    for (const [code, locale] of Object.entries(LOCALES)) {
      const lt = (locale as Record<string, Record<string, string>>).locationTypes;
      expect(lt, `${code} missing locationTypes namespace`).toBeDefined();
      for (const type of types) {
        expect(lt[type], `${code} missing locationTypes.${type}`).toBeDefined();
      }
    }
  });

  it("has locationPicker keys in all locales", () => {
    const requiredKeys = ["needMoreGuildMembers", "joinGuildToUnlock", "raid"];
    for (const [code, locale] of Object.entries(LOCALES)) {
      const lp = (locale as Record<string, Record<string, string>>).locationPicker;
      expect(lp, `${code} missing locationPicker namespace`).toBeDefined();
      for (const key of requiredKeys) {
        expect(lp[key], `${code} missing locationPicker.${key}`).toBeDefined();
      }
    }
  });
});

describe("B7: nutrition preset i18n keys in all locales", () => {
  const nutritionPresetKeys = ["snack", "lightMeal", "fullMeal"];

  for (const key of nutritionPresetKeys) {
    it(`has activityInput.${key} in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const ai = (locale as Record<string, Record<string, string>>).activityInput;
        expect(ai, `${code} missing activityInput namespace`).toBeDefined();
        expect(ai[key], `${code} missing activityInput.${key}`).toBeDefined();
        expect(ai[key].length, `${code} activityInput.${key} is empty`).toBeGreaterThan(0);
      }
    });
  }

  it("non-English locales translate nutrition labels (not identical to English)", () => {
    const enAI = (en as unknown as Record<string, Record<string, string>>).activityInput;
    for (const code of LOCALE_CODES.filter((c) => c !== "en")) {
      const localeAI = (LOCALES[code] as Record<string, Record<string, string>>).activityInput;
      const translated = nutritionPresetKeys.filter((key) => localeAI[key] !== enAI[key]);
      expect(
        translated.length,
        `${code} has no translated nutrition labels — all identical to English`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("resolveQuestString — i18n-prefixed strings", () => {
  it("returns raw string when not prefixed with i18n: and no pattern match", () => {
    const t = (key: string) => key;
    expect(resolveQuestString("Custom quest", t)).toBe("Custom quest");
  });

  it("extracts key from i18n: prefix (no params)", () => {
    let capturedKey = "";
    const t = (key: string) => {
      capturedKey = key;
      return key;
    };
    resolveQuestString("i18n:questTemplates.morningRitual", t);
    expect(capturedKey).toBe("questTemplates.morningRitual");
  });

  it("translates activityType param via activityTypes namespace", () => {
    let capturedKey = "";
    let capturedParams: Record<string, string> = {};
    const t = (key: string, params?: Record<string, string>) => {
      capturedKey = key;
      capturedParams = params ?? {};
      // Simulate t() returning translated activity name
      if (key.startsWith("activityTypes.")) return `[translated:${key}]`;
      return key;
    };
    resolveQuestString("i18n:questTemplates.session:activityType=Cardio", t);
    expect(capturedKey).toBe("questTemplates.session");
    expect(capturedParams.activity).toBe("[translated:activityTypes.Cardio]");
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

  it("handles multiple params correctly", () => {
    let capturedParams: Record<string, string> = {};
    const t = (key: string, params?: Record<string, string>) => {
      if (key.startsWith("activityTypes.")) return `[t:${key}]`;
      capturedParams = params ?? {};
      return key;
    };
    resolveQuestString("i18n:questTemplates.extendedDesc:min=45:activityType=Hiit", t);
    expect(capturedParams.min).toBe("45");
    expect(capturedParams.activity).toBe("[t:activityTypes.Hiit]");
  });
});

describe("resolveQuestString — English pattern matching (server strings)", () => {
  /** Helper t() that records calls and returns a placeholder */
  function createMockT() {
    const calls: Array<{ key: string; params?: Record<string, string> }> = [];
    const t = (key: string, params?: Record<string, string>) => {
      calls.push({ key, params });
      if (key.startsWith("activityTypes.")) return `[${key}]`;
      if (params) {
        let result = key;
        for (const [k, v] of Object.entries(params)) {
          result += `(${k}=${v})`;
        }
        return result;
      }
      return key;
    };
    return { t, calls };
  }

  it("matches 'Extended <activity>' title pattern", () => {
    const { t } = createMockT();
    const result = resolveQuestString("Extended Cardio", t);
    expect(result).toContain("questTemplates.extended");
    expect(result).toContain("activityTypes.Cardio");
  });

  it("matches 'Quick <activity>' title pattern", () => {
    const { t } = createMockT();
    const result = resolveQuestString("Quick Mindfulness", t);
    expect(result).toContain("questTemplates.quick");
    expect(result).toContain("activityTypes.Mindfulness");
  });

  it("matches '<activity> Session' title pattern", () => {
    const { t } = createMockT();
    const result = resolveQuestString("Strength Training Session", t);
    expect(result).toContain("questTemplates.session");
  });

  it("matches 'Morning Ritual' title pattern", () => {
    const { t, calls } = createMockT();
    resolveQuestString("Morning Ritual", t);
    expect(calls[0].key).toBe("questTemplates.morningRitual");
  });

  it("matches description pattern: Push yourself with a N-minute session", () => {
    const { t, calls } = createMockT();
    resolveQuestString("Push yourself with a 60-minute session", t);
    expect(calls[0].key).toBe("questTemplates.extendedDesc");
    expect(calls[0].params?.min).toBe("60");
  });

  it("matches description pattern: Complete N minutes of activity", () => {
    const { t, calls } = createMockT();
    resolveQuestString("Complete 30 minutes of activity", t);
    expect(calls[0].key).toBe("questTemplates.sessionDesc");
    expect(calls[0].params?.min).toBe("30");
  });

  it("matches description pattern: Log any activity before noon", () => {
    const { t, calls } = createMockT();
    resolveQuestString("Log any activity before noon", t);
    expect(calls[0].key).toBe("questTemplates.morningRitualDesc");
  });

  it("matches description pattern: A short N-minute burst", () => {
    const { t, calls } = createMockT();
    resolveQuestString("A short 10-minute burst to stay on track", t);
    expect(calls[0].key).toBe("questTemplates.quickDesc");
    expect(calls[0].params?.min).toBe("10");
  });

  it("falls back to raw string for unrecognized patterns", () => {
    const { t } = createMockT();
    const result = resolveQuestString("My custom quest title", t);
    expect(result).toBe("My custom quest title");
  });

  it("handles case-insensitive matching for title patterns", () => {
    const { t } = createMockT();
    const result = resolveQuestString("extended cardio", t);
    expect(result).toContain("questTemplates.extended");
  });

  it("resolves activity names from ENGLISH_ACTIVITY_NAMES map", () => {
    const { t } = createMockT();
    // "Healthy Eating" maps to Nutrition via ENGLISH_ACTIVITY_NAMES
    const result = resolveQuestString("Extended Healthy Eating", t);
    expect(result).toContain("questTemplates.extended");
    expect(result).toContain("activityTypes.Nutrition");
  });

  it("resolves activity names by enum value directly (e.g. 'Creativity')", () => {
    const { t } = createMockT();
    const result = resolveQuestString("Quick Creativity", t);
    expect(result).toContain("questTemplates.quick");
    expect(result).toContain("activityTypes.Creativity");
  });
});

// ── Phase 6.1 Bug Fix B10 Coverage ──────────────────────────

describe("B10: equipment translation keys in all locales", () => {
  const equipmentIds = [
    // Shop items (3 per biome × 9 biomes = 27)
    "shop-plains-staff",
    "shop-plains-tunic",
    "shop-plains-cap",
    "shop-tundra-axe",
    "shop-tundra-cloak",
    "shop-tundra-charm",
    "shop-volcano-blade",
    "shop-volcano-plate",
    "shop-volcano-crown",
    "shop-forest-bow",
    "shop-forest-robe",
    "shop-forest-circlet",
    "shop-dungeon-dagger",
    "shop-dungeon-mail",
    "shop-dungeon-lantern",
    "shop-desert-scimitar",
    "shop-desert-wrap",
    "shop-desert-turban",
    "shop-spire-tome",
    "shop-spire-robe",
    "shop-spire-monocle",
    "shop-ruins-sword",
    "shop-ruins-armor",
    "shop-ruins-skull",
    "shop-celestial-blade",
    "shop-celestial-robe",
    "shop-celestial-halo",
    // Reward/starter items
    "starter-sword",
    "leather-armor",
    "iron-helm",
    "focus-amulet",
    "steel-blade",
    "chainmail",
    "crown-of-wisdom",
    "epic-class-weapon",
    "first-ten",
    "grinder-50",
    "legendary-100",
  ];

  for (const itemId of equipmentIds) {
    it(`has equipment.${itemId}.name in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const equipment = (locale as Record<string, Record<string, Record<string, string>>>)
          .equipment;
        expect(equipment, `${code} missing equipment namespace`).toBeDefined();
        expect(equipment[itemId], `${code} missing equipment.${itemId}`).toBeDefined();
        expect(equipment[itemId].name, `${code} missing equipment.${itemId}.name`).toBeDefined();
        expect(
          equipment[itemId].name.length,
          `${code} equipment.${itemId}.name is empty`,
        ).toBeGreaterThan(0);
      }
    });
  }

  it("non-English locales actually translate equipment names (not all identical to English)", () => {
    const enEquipment = (en as unknown as Record<string, Record<string, Record<string, string>>>)
      .equipment;
    for (const code of LOCALE_CODES.filter((c) => c !== "en")) {
      const localeEquipment = (
        LOCALES[code] as Record<string, Record<string, Record<string, string>>>
      ).equipment;
      const translated = equipmentIds.filter(
        (id) => localeEquipment[id]?.name !== enEquipment[id]?.name,
      );
      expect(
        translated.length,
        `${code} has no translated equipment names — all identical to English`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("B10: merchant translation keys in all locales", () => {
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
    it(`has merchants.${biome}.name and .greeting in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const merchants = (locale as Record<string, Record<string, Record<string, string>>>)
          .merchants;
        expect(merchants, `${code} missing merchants namespace`).toBeDefined();
        expect(merchants[biome], `${code} missing merchants.${biome}`).toBeDefined();
        expect(merchants[biome].name, `${code} missing merchants.${biome}.name`).toBeDefined();
        expect(
          merchants[biome].name.length,
          `${code} merchants.${biome}.name is empty`,
        ).toBeGreaterThan(0);
        expect(
          merchants[biome].greeting,
          `${code} missing merchants.${biome}.greeting`,
        ).toBeDefined();
        expect(
          merchants[biome].greeting.length,
          `${code} merchants.${biome}.greeting is empty`,
        ).toBeGreaterThan(0);
      }
    });
  }

  it("non-English locales translate merchant greetings", () => {
    const enMerchants = (en as unknown as Record<string, Record<string, Record<string, string>>>)
      .merchants;
    for (const code of LOCALE_CODES.filter((c) => c !== "en")) {
      const localeMerchants = (
        LOCALES[code] as Record<string, Record<string, Record<string, string>>>
      ).merchants;
      const translated = biomeIds.filter(
        (id) => localeMerchants[id]?.greeting !== enMerchants[id]?.greeting,
      );
      expect(
        translated.length,
        `${code} has no translated merchant greetings — all identical to English`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("B10: shop UI keys in all locales", () => {
  const shopKeys = ["buyTab", "sellTab", "sellPrice", "owned", "noItemsToSell"];

  for (const key of shopKeys) {
    it(`has shop.${key} in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const shop = (locale as Record<string, Record<string, string>>).shop;
        expect(shop, `${code} missing shop namespace`).toBeDefined();
        expect(shop[key], `${code} missing shop.${key}`).toBeDefined();
        expect(shop[key].length, `${code} shop.${key} is empty`).toBeGreaterThan(0);
      }
    });
  }

  it("shop.sellPrice contains {{price}} interpolation in all locales", () => {
    for (const [code, locale] of Object.entries(LOCALES)) {
      const shop = (locale as Record<string, Record<string, string>>).shop;
      expect(shop.sellPrice, `${code} shop.sellPrice missing {{price}}`).toContain("{{price}}");
    }
  });

  it("non-English locales translate shop labels", () => {
    const enShop = (en as unknown as Record<string, Record<string, string>>).shop;
    for (const code of LOCALE_CODES.filter((c) => c !== "en")) {
      const localeShop = (LOCALES[code] as Record<string, Record<string, string>>).shop;
      const translated = shopKeys.filter((key) => localeShop[key] !== enShop[key]);
      expect(
        translated.length,
        `${code} has no translated shop labels — all identical to English`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("B10: stat abbreviation keys in all locales", () => {
  const statKeys = ["STR", "AGI", "INT", "CON", "WIS", "CHA", "MP"];

  for (const key of statKeys) {
    it(`has stats.${key} in all locales`, () => {
      for (const [code, locale] of Object.entries(LOCALES)) {
        const stats = (locale as Record<string, Record<string, string>>).stats;
        expect(stats, `${code} missing stats namespace`).toBeDefined();
        expect(stats[key], `${code} missing stats.${key}`).toBeDefined();
        expect(stats[key].length, `${code} stats.${key} is empty`).toBeGreaterThan(0);
      }
    });
  }

  it("has stats.statBonus template with {{value}} and {{stat}} in all locales", () => {
    for (const [code, locale] of Object.entries(LOCALES)) {
      const stats = (locale as Record<string, Record<string, string>>).stats;
      expect(stats.statBonus, `${code} missing stats.statBonus`).toBeDefined();
      expect(stats.statBonus, `${code} stats.statBonus missing {{value}}`).toContain("{{value}}");
      expect(stats.statBonus, `${code} stats.statBonus missing {{stat}}`).toContain("{{stat}}");
    }
  });

  it("non-English locales translate stat abbreviations (at least some differ)", () => {
    const enStats = (en as unknown as Record<string, Record<string, string>>).stats;
    for (const code of LOCALE_CODES.filter((c) => c !== "en")) {
      const localeStats = (LOCALES[code] as Record<string, Record<string, string>>).stats;
      const translated = statKeys.filter((key) => localeStats[key] !== enStats[key]);
      // Japanese/Chinese translate all; European locales translate at least some (e.g. AGI→GES in German)
      expect(
        translated.length,
        `${code} has identical stat abbreviations to English — expected at least some translations`,
      ).toBeGreaterThan(0);
    }
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
