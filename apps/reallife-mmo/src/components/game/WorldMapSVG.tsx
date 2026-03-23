import { BIOME_META, type BiomeId, ALL_BIOMES } from "@/lib/biomeThemes";
import { asset } from "@/lib/utils";

interface WorldMapSVGProps {
  currentBiome: BiomeId;
  unlockedBiomes: BiomeId[];
  selectedBiome: BiomeId | null;
  onRegionClick: (biomeId: BiomeId) => void;
}

/**
 * Clickable hotspot regions as percentage-based coordinates over the map image (1024x637).
 * Traced to follow the actual terrain boundaries on map.png.
 *
 * Key landmarks (approximate % positions):
 * - Parchment border: ~4% inset on all sides
 * - River between tundra/forest: x≈22, runs y 30→48
 * - Mountain ridge tundra→spire→volcano: y≈28-35
 * - Plains village cluster: x≈42, y≈52
 * - Lake: x≈52, y≈60
 * - Purple cave entrance: x≈32, y≈68
 * - Desert/plains border: x≈58
 * - Compass rose: x≈12, y≈82 (avoid)
 */
const REGION_HOTSPOTS: Record<BiomeId, Array<[number, number]>> = {
  // Snow mountains top-left — bounded by river on left, mountain ridge bottom
  tundra: [
    [8, 7],
    [37, 7],
    [37, 14],
    [32, 23],
    [27, 30],
    [22, 33],
    [17, 30],
    [12, 33],
    [8, 27],
  ],
  // Castle/tower area top-center between tundra and volcano
  spire: [
    [37, 7],
    [57, 7],
    [57, 15],
    [53, 25],
    [48, 30],
    [42, 32],
    [37, 28],
    [32, 23],
    [37, 14],
  ],
  // Lava/fire mountains top-right — brown/red area
  volcano: [
    [57, 7],
    [78, 7],
    [78, 14],
    [76, 24],
    [70, 32],
    [62, 33],
    [57, 28],
    [53, 25],
    [57, 15],
  ],
  // Cosmic crystal area far top-right corner — small floating island
  celestial: [
    [78, 7],
    [96, 7],
    [96, 24],
    [88, 30],
    [80, 28],
    [76, 24],
    [78, 14],
  ],
  // Dense forest left side — green trees, bounded by river left and coast
  forest: [
    [8, 27],
    [12, 33],
    [17, 30],
    [22, 33],
    [24, 40],
    [22, 48],
    [20, 52],
    [14, 53],
    [6, 50],
    [4, 42],
  ],
  // Green meadow center — village, lake, the big green area
  plains: [
    [22, 33],
    [27, 30],
    [37, 28],
    [42, 32],
    [48, 30],
    [53, 25],
    [57, 28],
    [58, 35],
    [58, 46],
    [55, 54],
    [48, 58],
    [40, 58],
    [32, 56],
    [24, 52],
    [22, 48],
    [24, 40],
  ],
  // Sandy area right side — tan/brown terrain
  desert: [
    [58, 35],
    [62, 33],
    [70, 32],
    [76, 24],
    [80, 28],
    [88, 30],
    [96, 24],
    [96, 56],
    [92, 60],
    [84, 60],
    [72, 56],
    [62, 52],
    [58, 46],
  ],
  // Dark cave bottom-left — purple mist, dark mountains, avoid compass
  dungeon: [
    [4, 42],
    [6, 50],
    [14, 53],
    [20, 52],
    [24, 52],
    [32, 56],
    [40, 58],
    [40, 66],
    [36, 74],
    [30, 80],
    [22, 82],
    [16, 80],
    [10, 76],
    [6, 68],
    [4, 58],
  ],
  // Crumbling temples bottom-right — dragon bones, skulls
  ruins: [
    [40, 58],
    [48, 58],
    [55, 54],
    [58, 46],
    [62, 52],
    [72, 56],
    [84, 60],
    [92, 60],
    [96, 66],
    [96, 84],
    [90, 90],
    [78, 92],
    [64, 90],
    [50, 84],
    [42, 76],
    [40, 66],
  ],
};

/** Center points for labels (percentage-based) — placed at visual centers of each biome */
const REGION_CENTERS: Record<BiomeId, { x: number; y: number }> = {
  tundra: { x: 22, y: 16 },
  spire: { x: 47, y: 16 },
  volcano: { x: 67, y: 18 },
  celestial: { x: 88, y: 14 },
  forest: { x: 13, y: 40 },
  plains: { x: 40, y: 42 },
  desert: { x: 78, y: 44 },
  dungeon: { x: 22, y: 68 },
  ruins: { x: 68, y: 72 },
};

function toSvgPoints(pts: Array<[number, number]>, w: number, h: number): string {
  return pts.map(([px, py]) => `${(px / 100) * w},${(py / 100) * h}`).join(" ");
}

export function WorldMapSVG({
  currentBiome,
  unlockedBiomes,
  selectedBiome,
  onRegionClick,
}: WorldMapSVGProps) {
  const isUnlocked = (id: BiomeId) => id === "plains" || unlockedBiomes.includes(id);

  const W = 1000;
  const H = 640;

  return (
    <div className="relative w-full">
      {/* Map image */}
      <img
        src={asset("map.png")}
        alt="World Map"
        className="w-full h-auto block pixelated"
        draggable={false}
      />

      {/* Clickable SVG overlay */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {ALL_BIOMES.map((biomeId) => {
          const pts = REGION_HOTSPOTS[biomeId];
          const center = REGION_CENTERS[biomeId];
          const unlocked = isUnlocked(biomeId);
          const isCurrent = biomeId === currentBiome;
          const isSelected = biomeId === selectedBiome;
          const meta = BIOME_META[biomeId];

          const cx = (center.x / 100) * W;
          const cy = (center.y / 100) * H;

          return (
            <g key={biomeId} onClick={() => onRegionClick(biomeId)} className="cursor-pointer">
              {/* Invisible hit area with hover highlight */}
              <polygon
                points={toSvgPoints(pts, W, H)}
                fill={
                  isSelected
                    ? `${meta.mapColor}35`
                    : isCurrent
                      ? `${meta.mapColor}20`
                      : "transparent"
                }
                stroke={
                  isSelected ? meta.mapColor : isCurrent ? `${meta.mapColor}aa` : "transparent"
                }
                strokeWidth={isSelected ? 3 : isCurrent ? 2 : 0}
                className="transition-all duration-200 hover:fill-[rgba(255,255,255,0.08)]"
              />

              {/* Lock overlay for locked regions */}
              {!unlocked && (
                <polygon
                  points={toSvgPoints(pts, W, H)}
                  fill="rgba(0,0,0,0.55)"
                  className="pointer-events-none"
                />
              )}

              {/* Region label */}
              <text
                x={cx}
                y={cy - 12}
                textAnchor="middle"
                fontSize="24"
                className="pointer-events-none select-none"
              >
                {meta.icon}
              </text>
              <text
                x={cx}
                y={cy + 12}
                textAnchor="middle"
                fontSize="11"
                fontFamily="'Press Start 2P', monospace"
                fill={unlocked ? "rgba(255,255,255,0.95)" : "rgba(128,128,128,0.5)"}
                stroke="rgba(0,0,0,0.7)"
                strokeWidth="3"
                paintOrder="stroke"
                className="pointer-events-none select-none"
              >
                {meta.name.toUpperCase()}
              </text>

              {/* Lock icon */}
              {!unlocked && (
                <text
                  x={cx}
                  y={cy + 30}
                  textAnchor="middle"
                  fontSize="18"
                  className="pointer-events-none"
                >
                  🔒
                </text>
              )}

              {/* Player marker */}
              {isCurrent && (
                <g>
                  <circle
                    cx={cx}
                    cy={cy + 30}
                    r="8"
                    fill="white"
                    stroke={meta.mapColor}
                    strokeWidth="2"
                  />
                  <circle cx={cx} cy={cy + 30} r="4" fill={meta.mapColor} />
                  <circle
                    cx={cx}
                    cy={cy + 30}
                    r="12"
                    fill="none"
                    stroke={meta.mapColor}
                    strokeWidth="1"
                    opacity="0.4"
                  >
                    <animate attributeName="r" from="8" to="18" dur="2s" repeatCount="indefinite" />
                    <animate
                      attributeName="opacity"
                      from="0.4"
                      to="0"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
