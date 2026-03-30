# Phase 6.1 Verification Report — Localization (i18n) Bug Fixes B1-B8

> Verified: 2026-03-30
> Tester: Playwright automated evaluation
> App URL: http://localhost:5173/8-bit-mmo/

---

## Summary

Bug fixes B1-B8 are **mostly resolved**. 6 of 8 bugs are fully fixed, 1 is partially fixed, and 1 remains unfixed due to an architectural gap (quest data comes from SpacetimeDB with hardcoded English, not from the client-side quest generator that was patched). The i18n infrastructure is solid and the vast majority of UI text is properly translated across all tested languages (German, Japanese, English).

---

## Bug Fix Verification

### B1: Hardcoded "Health" and "Experience" in character-sheet component

**Status: FIXED**

- Dashboard shows "Leben" (Health) and "Erfahrung" (Experience) in German
- Character page shows "LP" (Lebenspunkte) and "EP" (Erfahrungspunkte) in German
- Japanese shows "HP" and "EXP"
- English roundtrip correctly reverts to "Health" and "Experience"

### B2: Hardcoded "Unclassed" class name

**Status: FIXED**

- Dashboard shows "Klassenlos" in German
- Character page shows "Klassenlos" in German
- Japanese shows "未分類"
- English roundtrip correctly reverts to "Unclassed"
- Minor: The `<img>` alt text still reads "TestHeld - Unclassed" regardless of language (accessibility-only, not user-visible)

### B3: Quest names and descriptions are hardcoded English

**Status: NOT FIXED**

- Quest names remain in English across all languages: "Extended Mindfulness", "Quick Social", "Extended Nutrition"
- Quest descriptions remain in English: "Push yourself with a 60-minute session", "A short 15-minute burst to stay on track"
- **Root cause**: The `questGenerator.ts` was updated to use `i18n:key:param` format strings, and `QuestCard.tsx` has `resolveQuestString()` to parse them. However, the quests actually come from **SpacetimeDB** (`useTable(tables.my_quests)`), not from the client-side quest generator. The server stores plain English quest titles and descriptions. The client-side `resolveQuestString()` check (`str.startsWith("i18n:")`) returns the raw string because server data doesn't have the `i18n:` prefix.
- **Additionally**: The dashboard (`dashboard.tsx` line 180) renders `q.title` directly without calling `resolveQuestString()` at all.
- **Fix needed**: Either (a) have the SpacetimeDB server store quest template keys instead of resolved strings, or (b) add a lookup/mapping layer on the client that matches server quest data to translation keys.

### B4: Quest type badge "DAILY" is hardcoded

**Status: FIXED**

- German shows "TAGLICH" (Daily badge translated)
- Japanese shows "デイリー"
- Uses `t('questTypes.${quest.type}')` correctly

### B5: Biome names are not translated on World Map

**Status: FIXED**

- All 9 biome names translated in German: "GRUNE EBENEN", "EISHOHLE", "LAVAKERN", "PIXELWALD", "KERKERFACKEL", "ZWERGENTRESOR", "ALTE RUNEN", "DRACHENHORT", "RAUMSTATION"
- Page title "Weltkarte" and region counter "1/9 Regionen entdeckt" also translated

### B6: "Duration" label hardcoded in activity input configs

**Status: FIXED**

- German shows "Dauer: 45m" for duration-based activities
- "Mahlzeitqualitat: Volle Mahlzeit" for Nutrition
- "Wasseraufnahme: 2 Glaser" for Hydration
- All activity input label keys use `t(config.labelKey)` pattern correctly

### B7: Activity input format strings hardcoded ("Snack", "Light meal", etc.)

**Status: PARTIALLY FIXED**

- The `formatValue()` function in `ActivityLogger.tsx` correctly uses `t("activityInput.snack")`, `t("activityInput.lightMeal")`, `t("activityInput.fullMeal")`, and `t("activityInput.glass")` for the **label display text**
- Hydration: "2 Glaser" correctly translated
- The label "Mahlzeitqualitat: Volle Mahlzeit" correctly shows translated value
- **Still broken**: Preset **buttons** for Nutrition render `p.label` directly from `types.ts` config, which contains hardcoded English strings: `"Snack"`, `"Light"`, `"Full meal"` (lines 147-149 of `types.ts`)
- **Fix needed**: Change preset labels to i18n keys and resolve them with `t()` at render time in `ActivityLogger.tsx` line 119

### B8: Title names not translated

**Status: FIXED**

- "Neuling" (Novice) displayed in German on character page
- All 19 real-world achievement titles translated: "Erster Schritt", "Eiserner Wille", "Jahrhundert", "Marathon-Finisher", "Halbmarathon unter 2h", "Eisenpumper", "Strasenkrieger", "Zen-Meister", "Meister der Technik", "Bucherwurm", "Fruhaufsteher", "Nachteule", "Gesellschaftsmensch", "Hobbykoch", "Ausgeruht", "Kreative Seele", "Engagiert", "Unaufhaltsam", "Die Tausend"
- Title descriptions also translated
- Japanese shows "初心者" (Novice)

---

## Cross-Language Tests

### German (de)

- All navigation labels translated: Held, Log, Quests, Karte, Gilde
- All page titles translated
- Class names, activity types, stat labels all in German
- Language detection from browser locale works correctly

### Japanese (ja)

- Full CJK rendering works: 英雄, 記録, クエスト, マップ, ギルド
- Character page fully translated with Japanese characters
- Title/achievement names in Japanese

### English (en) Roundtrip

- Switching back to English correctly reverts all text
- No stale translations or mixed-language content
- Language persistence via localStorage("language") works

---

## Test Results Summary

| Bug | Description                           | Status          |
| --- | ------------------------------------- | --------------- |
| B1  | "Health"/"Experience" labels          | FIXED           |
| B2  | "Unclassed" class name                | FIXED           |
| B3  | Quest names/descriptions              | NOT FIXED       |
| B4  | Quest type badge "DAILY"              | FIXED           |
| B5  | Biome names on World Map              | FIXED           |
| B6  | "Duration" label in activity inputs   | FIXED           |
| B7  | Activity input values ("Snack", etc.) | PARTIALLY FIXED |
| B8  | Title names ("Novice", etc.)          | FIXED           |

**Score: 6/8 fully fixed, 1 partial, 1 unfixed**

---

## Remaining Issues

### Critical

- [ ] **B3: Quest titles/descriptions from SpacetimeDB are not translated** — Server stores plain English strings; client-side `resolveQuestString()` only works for `i18n:`-prefixed strings. Dashboard also bypasses resolution entirely.

### Minor

- [ ] **B7: Nutrition preset buttons still English** — `types.ts` lines 147-149 have hardcoded `"Snack"`, `"Light"`, `"Full meal"` preset labels. Needs i18n keys resolved at render time.
- [ ] **`<img>` alt text "Unclassed"** — Character avatar alt text is not translated (accessibility-only issue).

---

## Screenshots

| #   | Description                                   | File                                       |
| --- | --------------------------------------------- | ------------------------------------------ |
| 1   | Home page — German                            | `screenshots/01-home-de.png`               |
| 2   | Dashboard — German (B1, B2 verified)          | `screenshots/02-dashboard-de.png`          |
| 3   | Quests page — German (B3 failing, B4 passing) | `screenshots/03-quests-de.png`             |
| 4   | World Map — German (B5 verified)              | `screenshots/04-worldmap-de.png`           |
| 5   | Activity Logger — German (B6 verified)        | `screenshots/05-activity-de.png`           |
| 6   | Activity Nutrition — German (B7 partial)      | `screenshots/06-activity-nutrition-de.png` |
| 7   | Character page — German (B2, B8 verified)     | `screenshots/07-character-de.png`          |
| 8   | Character titles — German (B8 verified)       | `screenshots/08-character-titles-de.png`   |
| 9   | Character page — Japanese                     | `screenshots/09-character-ja.png`          |
| 10  | Quests page — Japanese (B3 failing)           | `screenshots/10-quests-ja.png`             |
| 11  | Quests page — English roundtrip               | `screenshots/11-quests-en.png`             |
| 12  | Dashboard — English roundtrip                 | `screenshots/12-dashboard-en.png`          |

---

## Verdict

**PARTIAL PASS** — 6 of 8 bug fixes are fully verified and working. The remaining issues are:

1. B3 (quest titles/descriptions) requires server-side changes or a client-side mapping layer since quests come from SpacetimeDB with hardcoded English.
2. B7 (nutrition preset buttons) needs a small fix to use i18n keys instead of hardcoded labels in the presets config.

The i18n infrastructure is solid. The fixes that were within reach of the client-side code are well-implemented. The B3 gap is architectural — it requires either changing the SpacetimeDB quest schema or adding a translation mapping layer for server-generated quest data.
