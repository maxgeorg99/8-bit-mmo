# Phase 6.1 Verification Report — Localization (i18n)

> Verified: 2026-03-29
> Tester: Playwright automated evaluation
> App URL: http://localhost:5174/8-bit-mmo/

---

## Summary

Phase 6.1 localization is **largely functional** with a solid i18n foundation. The i18next setup with 7 languages, localStorage persistence, and language selector work correctly. The majority of UI chrome (navigation, page titles, buttons, labels) is translated. However, several categories of hardcoded English strings remain, preventing a full pass.

---

## Test Results

### Passing

- [x] Home page loads without errors
- [x] Language selector is visible and accessible (shadcn Select component on home page)
- [x] Switching to German changes all main UI text (verified: title, subtitle, class names, buttons, feature descriptions)
- [x] Switching to Japanese changes UI text to Japanese characters (verified: full CJK rendering)
- [x] Switching back to English reverts all text correctly
- [x] Language preference persists across page reload (localStorage-backed)
- [x] All 7 languages present in selector: en, de, es, fr, pt, ja, zh
- [x] Dashboard labels are translated (buttons, sections, recent activity, nav)
- [x] Character page: Attributes heading, Titles section, Chest, streak/activity counts translated
- [x] Character page: HP/XP labels use localized abbreviations (LP/EP in German)
- [x] Quest page: page title, subtitle, "New Goal" button, section headers translated
- [x] Guild page: fully translated (Guild Hall, create guild, available guilds, empty state)
- [x] Activity logger: page title, activity types, intensity labels, note field, preview gains translated
- [x] Navigation labels translated in all languages (Held/Log/Quests/Karte/Gilde)
- [x] Dynamic values with interpolation work: Lv.{{level}}, {{amount}}g, {{count}}/9 regions
- [x] No console errors or blank screens
- [x] Mobile viewport (375px) renders correctly with translated text
- [x] i18n setup uses proper architecture: i18next + react-i18next, language detection (localStorage > browser > fallback)

### Failing

- [ ] **Hardcoded "Health" and "Experience" in character-sheet component** — The shared `CharacterSheet8bit` component (`src/components/ui/8bit/blocks/character-sheet.tsx` lines 170, 194) renders hardcoded English labels instead of using `$t()`. These appear on the Dashboard.
- [ ] **Hardcoded "Unclassed" class name** — The class name "Unclassed" is used as a raw string throughout the codebase (`classEngine.ts`, `useStdbPlayer.ts`, multiple pages) without i18n translation.
- [ ] **Quest names and descriptions are hardcoded English** — Quest titles ("Mindfulness Session", "Morning Ritual", "Social Session") and descriptions ("Complete 30 minutes of activity", "Log any activity before noon") come from `questGenerator.ts` with hardcoded English strings.
- [ ] **Quest type badge "DAILY" is hardcoded** — `QuestCard.tsx` line 31 uses `quest.type.toUpperCase()` instead of a translated string.
- [ ] **Biome names are not translated** — World map shows English biome names: "VERDANT PLAINS", "ICE CAVERN", "LAVA CORE", "PIXEL FOREST", etc. These come from biome definitions without i18n.
- [ ] **"Duration" label hardcoded in activity input configs** — `src/lib/types.ts` has `label: "Duration"` hardcoded in multiple activity type input configurations (~7 occurrences) instead of using translation keys.
- [ ] **Activity input format strings hardcoded** — `ActivityLogger.tsx` formatValue function has hardcoded "Snack", "Light meal", "Full meal", "glass"/"glasses" strings.
- [ ] **Title names not translated** — Title "Novice" and other title names in `src/lib/types.ts` are hardcoded English strings.

### Warnings

- The `character-sheet.tsx` component is in `src/components/ui/8bit/blocks/` which may be considered a shared UI component — it needs i18n awareness or accept translated labels as props.
- Quest data is generated server-side or in `questGenerator.ts` — translating quest content may require a different approach (translation keys in quest definitions rather than literal strings).
- Biome names are deeply embedded in game data structures — a lookup table approach (biome ID to translated name) would be needed.
- Player class names (Warrior, Mage, Rogue, etc.) appear translated in some contexts (home page class showcase) but not when derived from game state (dashboard "Unclassed").

---

## Screenshots

| #   | Description                        | File                                     |
| --- | ---------------------------------- | ---------------------------------------- |
| 1   | Home page — German (auto-detected) | `screenshots/01-home-en.png`             |
| 2   | Home page — English (switched)     | `screenshots/02-home-en-switched.png`    |
| 3   | Home page — Japanese               | `screenshots/03-home-ja.png`             |
| 4   | Dashboard — German                 | `screenshots/04-dashboard-de.png`        |
| 5   | Character page — German (top)      | `screenshots/05-character-de.png`        |
| 6   | Character page — German (bottom)   | `screenshots/06-character-de-bottom.png` |
| 7   | Quests page — German               | `screenshots/07-quests-de.png`           |
| 8   | World Map — German                 | `screenshots/08-worldmap-de.png`         |
| 9   | Guild page — German                | `screenshots/09-guild-de.png`            |
| 10  | Mobile dashboard (375px) — German  | `screenshots/10-mobile-dashboard-de.png` |
| 11  | Activity logger — German           | `screenshots/11-activity-de.png`         |

---

## Hardcoded Strings Inventory

| Location                                                | String(s)                                                    | Fix approach                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| `components/ui/8bit/blocks/character-sheet.tsx:170,194` | "Health", "Experience"                                       | Use `$t("common.hp")` / `$t("common.xp")` or accept as props         |
| `lib/types.ts` (activity configs)                       | "Duration", "Meal quality", "Water intake", "Sleep duration" | Use translation keys, resolve at render time                         |
| `lib/classEngine.ts`, `hooks/useStdbPlayer.ts`          | "Unclassed"                                                  | Add `classes.Unclassed` to locale files, translate at display        |
| `lib/questGenerator.ts`                                 | Quest titles & descriptions                                  | Use translation keys as quest identifiers                            |
| `components/game/QuestCard.tsx:31`                      | `quest.type.toUpperCase()` ("DAILY")                         | Use `$t("quests.typeDaily")`                                         |
| `lib/biomeThemes.ts` / world map                        | Biome names                                                  | Add `biomes.*` keys to locale files                                  |
| `components/game/ActivityLogger.tsx:63-65`              | "Snack", "Light meal", "Full meal", "glass(es)"              | Use `$t("activityInput.snack")` etc. (keys already exist in en.json) |
| `lib/types.ts:396`                                      | Title "Novice" and other title names                         | Add title name keys to locale files                                  |

---

## Verdict

**PARTIAL PASS** — The i18n infrastructure is solid and the majority of UI strings are properly translated across all 7 languages. The remaining hardcoded strings are concentrated in game data definitions (quest content, biome names, class names, titles) and one shared UI component. These are not architectural blockers but need a follow-up pass to achieve full localization coverage.
