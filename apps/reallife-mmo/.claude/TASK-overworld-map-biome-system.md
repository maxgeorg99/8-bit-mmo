# TASK: Overworld Map & Biome System

**Branch:** `feature/overworld-map`
**Version target:** v1.1
**Complexity:** Large
**Depends on:** Core player table, activity_log, guild/raid tables (MVP complete)

---

## Decision Log

These are finalised — do not re-open them.

| Decision                 | Choice                                                                           |
| ------------------------ | -------------------------------------------------------------------------------- |
| Map visual style         | Illustrated world (JRPG terrain) with clickable regions (Risk-style territories) |
| Map placement            | Separate `/map` route — dashboard remains primary UI                             |
| Travel mechanic          | Free travel — unlock a region once, visit anytime                                |
| Theme system             | 8bitcn/ui built-in themes via `data-theme` attribute swap — zero custom CSS      |
| Region-exclusive content | Raid bosses + item/gear drops only (quests and PvP arena = out of scope)         |

---

## Biome → 8bitcn Theme Mapping

Each region maps directly to an existing 8bitcn theme. Switching biomes = setting `document.documentElement.setAttribute('data-theme', themeId)`. No custom palette work needed.

| Biome ID    | Display Name   | 8bitcn Theme                    | Unlock Condition                 | Raid Boss            |
| ----------- | -------------- | ------------------------------- | -------------------------------- | -------------------- |
| `plains`    | Verdant Plains | `pixel-forest`                  | Default — all players            | Thornback the Elder  |
| `tundra`    | Ice Cavern     | `ice-cavern`                    | 30 cardio sessions logged        | The Frostlord        |
| `volcano`   | Lava Core      | `lava-core`                     | 50 strength sessions logged      | Ignisfury            |
| `forest`    | Pixel Forest   | `pixel-forest` (darker variant) | 20 mindfulness sessions          | Rootwarden           |
| `dungeon`   | Dungeon Torch  | `dungeon-torch`                 | Complete 5 daily quests in a row | Shadow Baron         |
| `desert`    | Dwarven Vault  | `dwarven-vault`                 | 15 HIIT sessions logged          | King Stonefist       |
| `spire`     | Ancient Runes  | `ancient-runes`                 | 50 learning sessions logged      | The Archivist        |
| `ruins`     | Dragon Hoard   | `dragon-hoard`                  | Win 10 raid victories            | Skarveth the Undying |
| `celestial` | Space Station  | `space-station`                 | 365-day streak                   | The Architect        |

> Note: `plains` and `forest` share a theme base — differentiate with a CSS class modifier on the root if needed, or accept the overlap for MVP. The Celestial biome's "Space Station" theme is intentionally surreal for a 365-day achievement reward.

---

## SpacetimeDB Changes

### 1. New table: `biome_unlock`

```rust
#[spacetimedb::table(name = biome_unlock, public)]
pub struct BiomeUnlock {
    #[primary_key]
    #[auto_inc]
    pub id: u64,
    pub player_identity: Identity,
    pub biome_id: String,
    pub unlocked_at: Timestamp,
}
```

### 2. Modify `player` table

Add one field:

```rust
pub current_biome: String,   // default: "plains"
```

### 3. New reducer: `travel_to_biome`

```rust
#[spacetimedb::reducer]
pub fn travel_to_biome(ctx: &ReducerContext, biome_id: String) -> Result<(), String> {
    let identity = ctx.sender;
    let valid_biomes = ["plains","tundra","volcano","forest","dungeon","desert","spire","ruins","celestial"];
    if !valid_biomes.contains(&biome_id.as_str()) {
        return Err(format!("Unknown biome: {}", biome_id));
    }
    // "plains" is always accessible — skip unlock check
    if biome_id != "plains" {
        let unlocked = BiomeUnlock::iter()
            .any(|u| u.player_identity == identity && u.biome_id == biome_id);
        if !unlocked {
            return Err(format!("Biome {} not unlocked", biome_id));
        }
    }
    let mut player = Player::filter_by_identity(&identity).ok_or("Player not found")?;
    player.current_biome = biome_id;
    Player::update_by_identity(&identity, player);
    Ok(())
}
```

### 4. New logic file: `server/src/logic/biome_unlock.rs`

Implement `check_and_grant_biome_unlocks(ctx, identity)`. Call this function:

- At the end of every `log_activity` reducer
- Inside `idle_tick` for any player with activity in the last 24h

Unlock thresholds — count cumulative rows in `activity_log` per player:

```rust
pub fn check_and_grant_biome_unlocks(ctx: &ReducerContext, identity: &Identity) {
    let logs = ActivityLog::filter_by_player_identity(identity);

    let cardio_count  = logs.iter().filter(|l| l.activity_type == ActivityType::Cardio).count();
    let strength_count = logs.iter().filter(|l| l.activity_type == ActivityType::StrengthTraining).count();
    let mindful_count  = logs.iter().filter(|l| l.activity_type == ActivityType::Mindfulness).count();
    let hiit_count     = logs.iter().filter(|l| l.activity_type == ActivityType::Hiit).count();
    let learning_count = logs.iter().filter(|l| l.activity_type == ActivityType::MindLearning).count();

    let daily_quest_streak = compute_daily_quest_streak(identity); // from quest logic
    let raid_wins          = compute_raid_wins(identity);           // from raid logic
    let streak_days        = Player::filter_by_identity(identity).map(|p| p.streak_days).unwrap_or(0);

    let candidates = vec![
        ("tundra",   cardio_count >= 30),
        ("volcano",  strength_count >= 50),
        ("forest",   mindful_count >= 20),
        ("dungeon",  daily_quest_streak >= 5),
        ("desert",   hiit_count >= 15),
        ("spire",    learning_count >= 50),
        ("ruins",    raid_wins >= 10),
        ("celestial",streak_days >= 365),
    ];

    for (biome_id, condition) in candidates {
        if condition && !already_unlocked(identity, biome_id) {
            BiomeUnlock::insert(BiomeUnlock {
                id: 0,
                player_identity: identity.clone(),
                biome_id: biome_id.to_string(),
                unlocked_at: ctx.timestamp,
            });
            // TODO: trigger push notification event here
        }
    }
}

fn already_unlocked(identity: &Identity, biome_id: &str) -> bool {
    BiomeUnlock::iter().any(|u| &u.player_identity == identity && u.biome_id == biome_id)
}
```

### 5. Modify raid/item tables — add biome affinity

Add `biome_id: String` to both `RaidBoss` (or however raids are seeded) and `Item`. Each raid boss and item drop is tagged to a biome. Guild raids that take place while the guild leader is in a specific biome face that biome's boss and receive that biome's loot pool.

```rust
// Extend existing raid table
pub biome_id: String,  // which biome this raid belongs to

// Extend existing item table
pub biome_id: String,  // which biome this item drops from
```

Seed data for raid bosses (insert on module init or via a seeder reducer):

```rust
// biome_id → boss_name, power_threshold multiplier, loot_table_id
("plains",    "Thornback the Elder",  1.0,  "plains_loot"),
("tundra",    "The Frostlord",        1.2,  "tundra_loot"),
("volcano",   "Ignisfury",            1.4,  "volcano_loot"),
("forest",    "Rootwarden",           1.1,  "forest_loot"),
("dungeon",   "Shadow Baron",         1.3,  "dungeon_loot"),
("desert",    "King Stonefist",       1.2,  "desert_loot"),
("spire",     "The Archivist",        1.3,  "spire_loot"),
("ruins",     "Skarveth the Undying", 1.6,  "ruins_loot"),
("celestial", "The Architect",        2.0,  "celestial_loot"),
```

Higher multiplier = harder boss = rarer loot. The guild leader's current biome determines which boss is summoned when starting a raid.

---

## Frontend

### Theme switching — `lib/biomeThemes.ts`

```typescript
export type BiomeId =
  | "plains"
  | "tundra"
  | "volcano"
  | "forest"
  | "dungeon"
  | "desert"
  | "spire"
  | "ruins"
  | "celestial";

export const BIOME_TO_8BITCN_THEME: Record<BiomeId, string> = {
  plains: "pixel-forest",
  tundra: "ice-cavern",
  volcano: "lava-core",
  forest: "pixel-forest",
  dungeon: "dungeon-torch",
  desert: "dwarven-vault",
  spire: "ancient-runes",
  ruins: "dragon-hoard",
  celestial: "space-station",
};

export const BIOME_META: Record<
  BiomeId,
  {
    name: string;
    description: string;
    unlockHint: string;
    raidBoss: string;
  }
> = {
  plains: {
    name: "Verdant Plains",
    description: "Where all journeys begin.",
    unlockHint: "Starting zone — always unlocked.",
    raidBoss: "Thornback the Elder",
  },
  tundra: {
    name: "Ice Cavern",
    description: "Forged by a thousand cold mornings.",
    unlockHint: "Log 30 cardio sessions.",
    raidBoss: "The Frostlord",
  },
  volcano: {
    name: "Lava Core",
    description: "Only the strongest reach the peak.",
    unlockHint: "Log 50 strength training sessions.",
    raidBoss: "Ignisfury",
  },
  forest: {
    name: "Pixel Forest",
    description: "Peace earned through discipline.",
    unlockHint: "Log 20 mindfulness sessions.",
    raidBoss: "Rootwarden",
  },
  dungeon: {
    name: "Dungeon Torch",
    description: "Darkness hides what gold cannot buy.",
    unlockHint: "Complete 5 daily quests in a row.",
    raidBoss: "Shadow Baron",
  },
  desert: {
    name: "Dwarven Vault",
    description: "No shortcuts. No shade.",
    unlockHint: "Log 15 HIIT sessions.",
    raidBoss: "King Stonefist",
  },
  spire: {
    name: "Ancient Runes",
    description: "Knowledge is the rarest power.",
    unlockHint: "Log 50 learning sessions.",
    raidBoss: "The Archivist",
  },
  ruins: {
    name: "Dragon Hoard",
    description: "Ten victories. A legacy begins.",
    unlockHint: "Win 10 guild raids.",
    raidBoss: "Skarveth the Undying",
  },
  celestial: {
    name: "Space Station",
    description: "365 days. You never stopped.",
    unlockHint: "Maintain a 365-day activity streak.",
    raidBoss: "The Architect",
  },
};
```

### Theme provider — `providers/BiomeProvider.tsx`

```typescript
import { useEffect } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { BIOME_TO_8BITCN_THEME, BiomeId } from "@/lib/biomeThemes";

export function BiomeProvider({ children }: { children: React.ReactNode }) {
  const player = usePlayer();
  const biomeId = (player?.current_biome ?? "plains") as BiomeId;

  useEffect(() => {
    const theme = BIOME_TO_8BITCN_THEME[biomeId] ?? "pixel-forest";
    document.documentElement.setAttribute("data-theme", theme);
  }, [biomeId]);

  return <>{children}</>;
}
```

Wrap `<App />` with `<BiomeProvider>` in `main.tsx`. That's the entire theming system — 8bitcn does the rest.

### New hook: `hooks/useBiome.ts`

```typescript
import { usePlayer } from "./usePlayer";
import { useSpacetimeDB } from "./useSpacetimeDB";
import { BiomeId } from "@/lib/biomeThemes";
import { BiomeUnlock } from "@/types/stdb-generated";

export function useBiome() {
  const player = usePlayer();
  const client = useSpacetimeDB();
  const [unlockedBiomes, setUnlockedBiomes] = useState<BiomeId[]>(["plains"]);

  useEffect(() => {
    BiomeUnlock.onInsert((unlock) => {
      if (unlock.player_identity === player?.identity) {
        setUnlockedBiomes((prev) => [...prev, unlock.biome_id as BiomeId]);
      }
    });
    client.subscribe(["SELECT * FROM biome_unlock WHERE player_identity = ?"]);
  }, [player]);

  const travelTo = (biomeId: BiomeId) => {
    client.call("travel_to_biome", [biomeId]);
  };

  return {
    currentBiome: (player?.current_biome ?? "plains") as BiomeId,
    unlockedBiomes,
    travelTo,
    isUnlocked: (id: BiomeId) => unlockedBiomes.includes(id) || id === "plains",
  };
}
```

---

## World Map Screen — `pages/WorldMap.tsx`

### Layout

```
┌─────────────────────────────────────────────┐
│  [← Back]           WORLD MAP               │
├─────────────────────────────────────────────┤
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │                                     │   │
│   │   [Illustrated SVG World Map]       │   │
│   │   Regions are clickable polygons    │   │
│   │   Player marker on current region   │   │
│   │   Locked regions are desaturated    │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─ SELECTED REGION INFO ──────────────┐   │
│   │  Ice Cavern          [TRAVEL →]     │   │
│   │  Raid Boss: The Frostlord           │   │
│   │  "Forged by cold mornings."         │   │
│   │  Unlock: 30 cardio sessions         │   │
│   │  Progress: ████████░░ 24/30         │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### SVG Map — implementation notes

The map SVG is a **single file** at `public/map/world.svg`. It contains the illustrated terrain layer (background image/shapes) plus named `<polygon>` overlay regions with `data-biome` attributes.

**Recommended build approach:**

1. Create a hand-crafted base SVG with rough fantasy continent shapes using `<path>` and `<polygon>` — pure code, no image editor required for MVP
2. Each region is a `<polygon>` or `<path>` element with `data-biome="plains"` etc.
3. Apply fill, stroke, and opacity in React based on unlock/selection state — do not hardcode colours in the SVG (they're controlled by the theme)
4. Add terrain flavour with simple shape primitives: mountain triangles, wave lines for ocean, small circle clusters for forests — all SVG, no raster images

**React component structure:**

```tsx
// pages/WorldMap.tsx
export default function WorldMap() {
  const { currentBiome, unlockedBiomes, travelTo, isUnlocked } = useBiome();
  const [selectedBiome, setSelectedBiome] = useState<BiomeId | null>(null);
  const [confirmTravel, setConfirmTravel] = useState(false);

  const handleRegionClick = (biomeId: BiomeId) => {
    setSelectedBiome(biomeId);
  };

  const handleTravel = () => {
    if (!selectedBiome) return;
    travelTo(selectedBiome);
    setConfirmTravel(false);
    // Theme switches immediately via BiomeProvider watching player.current_biome
  };

  return (
    <div className="flex flex-col h-screen">
      <MapHeader />

      <div className="flex-1 relative overflow-hidden">
        <WorldMapSVG
          currentBiome={currentBiome}
          unlockedBiomes={unlockedBiomes}
          selectedBiome={selectedBiome}
          onRegionClick={handleRegionClick}
        />
      </div>

      {selectedBiome && (
        <RegionInfoPanel
          biomeId={selectedBiome}
          isUnlocked={isUnlocked(selectedBiome)}
          isCurrent={selectedBiome === currentBiome}
          onTravel={() => setConfirmTravel(true)}
        />
      )}

      {confirmTravel && selectedBiome && (
        <TravelConfirmDialog
          biomeId={selectedBiome}
          onConfirm={handleTravel}
          onCancel={() => setConfirmTravel(false)}
        />
      )}
    </div>
  );
}
```

### `WorldMapSVG` component

```tsx
// components/game/WorldMapSVG.tsx

// Region polygon coordinates — these define the clickable hit areas
// Adjust after designing the actual SVG terrain layer
const REGION_POLYGONS: Record<BiomeId, string> = {
  plains: "160,200 230,160 310,170 320,260 240,290 160,265",
  tundra: "40,50 160,50 160,200 80,200 40,150",
  volcano: "350,50 640,50 640,200 480,220 440,160 310,170",
  forest: "40,150 80,200 160,265 100,340 40,300",
  dungeon: "240,290 320,260 390,340 390,380 100,380 100,340",
  desert: "320,260 440,160 480,220 490,330 390,340",
  spire: "160,50 350,50 310,170 230,160",
  ruins: "390,340 490,330 640,200 640,380 390,380",
  celestial: "565,44 640,44 640,95 565,95", // floating island top-right
};

// Approximate centres for player marker and labels
const REGION_CENTERS: Record<BiomeId, { x: number; y: number }> = {
  plains: { x: 240, y: 225 },
  tundra: { x: 98, y: 120 },
  volcano: { x: 490, y: 130 },
  forest: { x: 82, y: 262 },
  dungeon: { x: 248, y: 356 },
  desert: { x: 405, y: 278 },
  spire: { x: 262, y: 108 },
  ruins: { x: 530, y: 315 },
  celestial: { x: 602, y: 68 },
};

export function WorldMapSVG({ currentBiome, unlockedBiomes, selectedBiome, onRegionClick }) {
  return (
    <svg viewBox="0 0 680 420" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Ocean / background layer */}
      <rect x="0" y="0" width="680" height="420" fill="hsl(var(--background))" />
      {/* TODO: add terrain illustration shapes here (mountains, waves, etc.) */}

      {(Object.entries(REGION_POLYGONS) as [BiomeId, string][]).map(([biomeId, points]) => {
        const unlocked = isUnlocked(biomeId);
        const isCurrent = biomeId === currentBiome;
        const isSelected = biomeId === selectedBiome;
        const center = REGION_CENTERS[biomeId];

        return (
          <g key={biomeId} onClick={() => onRegionClick(biomeId)} className="cursor-pointer">
            <polygon
              points={points}
              fill={
                unlocked
                  ? `hsl(var(--primary) / ${isCurrent ? 0.5 : 0.3})`
                  : "hsl(var(--muted) / 0.2)"
              }
              stroke={
                isSelected
                  ? "hsl(var(--primary))"
                  : isCurrent
                    ? "hsl(var(--primary) / 0.8)"
                    : "hsl(var(--border))"
              }
              strokeWidth={isSelected || isCurrent ? 2.5 : 1}
              strokeDasharray={unlocked ? "none" : "6 4"}
              opacity={unlocked ? 1 : 0.5}
              className="transition-all duration-200 hover:opacity-80"
            />
            {/* Region label */}
            <text
              x={center.x}
              y={center.y}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill={unlocked ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))"}
              pointerEvents="none"
            >
              {BIOME_META[biomeId].name.toUpperCase()}
            </text>
            {/* Player marker */}
            {isCurrent && (
              <g>
                <circle
                  cx={center.x}
                  cy={center.y + 16}
                  r="6"
                  fill="white"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                />
                <circle cx={center.x} cy={center.y + 16} r="3" fill="hsl(var(--primary))" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
```

### `RegionInfoPanel` component

```tsx
// components/game/RegionInfoPanel.tsx
// Slides up from bottom on mobile, appears as sidebar on desktop
// Shows: biome name, boss name, flavour text, unlock progress bar, travel button

export function RegionInfoPanel({ biomeId, isUnlocked, isCurrent, onTravel }) {
  const meta = BIOME_META[biomeId];
  const progress = useBiomeProgress(biomeId); // hook that returns { current, required }

  return (
    <div className="border-t border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg text-primary">{meta.name}</h3>
          <p className="text-sm text-muted-foreground italic">{meta.description}</p>
        </div>
        {isUnlocked && !isCurrent && (
          <Button onClick={onTravel} size="sm" className="shrink-0">
            Travel →
          </Button>
        )}
        {isCurrent && (
          <Badge variant="outline" className="text-primary border-primary shrink-0">
            Current Region
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Raid Boss:</span>
        <span className="font-medium text-foreground">{meta.raidBoss}</span>
      </div>

      {!isUnlocked && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Unlock: {meta.unlockHint}</span>
            <span>
              {progress.current}/{progress.required}
            </span>
          </div>
          <Progress value={(progress.current / progress.required) * 100} className="h-2" />
        </div>
      )}
    </div>
  );
}
```

### `TravelConfirmDialog` component

Use `shadcn/ui` `AlertDialog`. Keep copy punchy — the theme switch is the ceremony:

```
"Travel to Ice Cavern?
Your world shifts to match. The UI, the colours, everything.
You carry your stats — but the boss changes."

[Cancel]  [Travel]
```

---

## Raid System Update

When a guild leader starts a raid, the `start_raid` reducer must now:

1. Read `guild_leader.current_biome`
2. Look up the `RaidBoss` row for that `biome_id`
3. Apply the boss's `power_threshold_multiplier` to the base difficulty
4. Tag the raid row with `biome_id` so loot resolves correctly on completion

Item drops on raid completion:

- Query the `Item` seed table filtered by the winning raid's `biome_id`
- Roll against loot table weights
- Insert won items into player's inventory

Each biome should have 4–6 unique item definitions at minimum (cosmetic gear: aura skin, title frame, weapon cosmetic, armour cosmetic). Define these as seed data in a `server/src/data/loot_tables.rs` file. Items are **cosmetic only** — no stat items, ever.

---

## New Files to Create

| File                                                   | Purpose                                 |
| ------------------------------------------------------ | --------------------------------------- |
| `server/src/tables/biome_unlock.rs`                    | New table                               |
| `server/src/reducers/biome.rs`                         | `travel_to_biome` reducer               |
| `server/src/logic/biome_unlock.rs`                     | `check_and_grant_biome_unlocks`         |
| `server/src/data/loot_tables.rs`                       | Seed data: bosses, item drops per biome |
| `apps/web/src/lib/biomeThemes.ts`                      | Theme map + metadata                    |
| `apps/web/src/hooks/useBiome.ts`                       | Biome state + travel action             |
| `apps/web/src/hooks/useBiomeProgress.ts`               | Per-biome unlock progress counters      |
| `apps/web/src/providers/BiomeProvider.tsx`             | `data-theme` switcher                   |
| `apps/web/src/pages/WorldMap.tsx`                      | Map screen                              |
| `apps/web/src/components/game/WorldMapSVG.tsx`         | SVG map + region polygons               |
| `apps/web/src/components/game/RegionInfoPanel.tsx`     | Bottom info panel                       |
| `apps/web/src/components/game/TravelConfirmDialog.tsx` | Travel confirmation                     |

## Files to Modify

| File                                        | Change                                                  |
| ------------------------------------------- | ------------------------------------------------------- |
| `server/src/tables/player.rs`               | Add `current_biome: String` (default `"plains"`)        |
| `server/src/reducers/activity.rs`           | Call `check_and_grant_biome_unlocks` after stat write   |
| `server/src/reducers/idle_tick.rs`          | Call `check_and_grant_biome_unlocks` for active players |
| `server/src/reducers/guild.rs`              | Read leader biome when starting a raid                  |
| `server/src/reducers/quest.rs`              | Resolve item drops using raid's `biome_id`              |
| `apps/web/src/main.tsx`                     | Wrap app with `<BiomeProvider>`                         |
| `apps/web/src/App.tsx`                      | Add `/map` route                                        |
| `apps/web/src/components/layout/Navbar.tsx` | Add Map nav item (globe icon)                           |
| `CLAUDE.md`                                 | Add biome system section to Section 4 domain models     |

---

## Acceptance Criteria

- [ ] `plains` biome is always unlocked for every player — no unlock check needed
- [ ] `travel_to_biome` returns an error if the biome is not in the player's `biome_unlock` table
- [ ] Theme switches within one render frame on travel — no flash, no delay
- [ ] All 9 region polygons are clickable on both mobile (375px) and desktop (1440px)
- [ ] Locked regions show dashed border + desaturated fill + unlock progress on click
- [ ] Current region shows solid border + player marker (white circle, primary fill)
- [ ] Raid boss name shown in `RegionInfoPanel` reflects the currently selected region
- [ ] Starting a guild raid seeds the correct boss based on guild leader's `current_biome`
- [ ] Item drops from completed raids match the raid's `biome_id` loot table
- [ ] `check_and_grant_biome_unlocks` is idempotent — running it twice never creates duplicate unlock rows
- [ ] `BiomeProvider` reads from live SpacetimeDB subscription — theme persists after page refresh

---

## Out of Scope for This Task

- Region-exclusive daily quest types (later)
- Region-exclusive PvP arena rules (later)
- Animated terrain (particle effects, moving elements on the map)
- Procedurally generated map artwork — use geometric SVG shapes for now
- Sound / ambient audio per biome
- Guild biome voting (what if guild members are in different regions?)

---

## Open Questions (flag, don't solve)

- **Forest vs Plains theme clash:** both currently map to `pixel-forest` theme. Either accept the overlap or propose a CSS modifier approach before implementing.
- **Biome unlock notifications:** where do new unlock events surface in the UI? Toast? Activity feed? In-game notification centre? To be designed separately.
- **Map artwork quality:** the geometric SVG approach is sufficient for launch. Flag for a design pass post-launch — a commissioned illustrated map would significantly raise the production value.
- **Guild leader biome as raid biome:** is it better to let the whole guild vote on which biome to raid? Noted for future consideration — leader biome is simpler for now.
