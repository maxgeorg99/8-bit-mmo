import { useTranslation } from "react-i18next";
import { BIOME_META, type BiomeId, ALL_BIOMES } from "@/lib/biomeThemes";
import { asset } from "@/lib/utils";

interface WorldMapSVGProps {
  currentBiome: BiomeId;
  unlockedBiomes: BiomeId[];
  selectedBiome: BiomeId | null;
  onRegionClick: (biomeId: BiomeId) => void;
}

/**
 * Clickable hotspot regions as percentage-based coordinates over the map image.
 * Traced from the actual map.png using the debug coordinate picker (?debug-map).
 */
const REGION_HOTSPOTS: Record<BiomeId, Array<[number, number]>> = {
  // Snow mountains top-left
  tundra: [
    [17, 34],
    [36, 40],
    [41, 35],
    [40, 17],
    [26, 6],
    [9, 21],
  ],
  // Castle/tower area top-center
  spire: [
    [41, 33],
    [40, 8],
    [60, 7],
    [59, 29],
    [54, 35],
  ],
  // Lava/fire mountains top-right
  volcano: [
    [60, 29],
    [59, 25],
    [60, 20],
    [66, 15],
    [77, 17],
    [86, 30],
    [85, 36],
    [65, 42],
    [58, 33],
  ],
  // Cosmic crystal area far top-right corner
  celestial: [
    [81, 6],
    [83, 24],
    [88, 29],
    [96, 23],
    [96, 6],
  ],
  // Dense forest left side
  forest: [
    [21, 71],
    [41, 58],
    [38, 40],
    [16, 34],
    [8, 45],
    [11, 66],
  ],
  // Green meadow center — derived from surrounding biome borders
  plains: [
    [38, 40],
    [41, 35],
    [54, 35],
    [58, 33],
    [65, 42],
    [62, 47],
    [63, 63],
    [53, 68],
    [47, 67],
    [36, 60],
    [41, 58],
  ],
  // Sandy area right side (Dwarven Vault)
  desert: [
    [62, 47],
    [66, 42],
    [71, 41],
    [77, 40],
    [85, 36],
    [90, 39],
    [91, 43],
    [88, 49],
    [91, 52],
    [92, 67],
    [85, 70],
    [75, 66],
    [64, 63],
    [62, 61],
  ],
  // Dark cave bottom-left (Dungeon Torch)
  dungeon: [
    [53, 81],
    [47, 90],
    [26, 89],
    [19, 82],
    [19, 71],
    [36, 60],
    [47, 67],
    [53, 69],
  ],
  // Crumbling temples bottom-right (Dragon Hoard)
  ruins: [
    [85, 70],
    [86, 80],
    [85, 89],
    [75, 90],
    [63, 90],
    [53, 79],
    [53, 68],
    [63, 63],
    [75, 65],
  ],
};

/** Center points for labels (percentage-based) — placed at visual centers of each biome */
const REGION_CENTERS: Record<BiomeId, { x: number; y: number }> = {
  tundra: { x: 25, y: 22 },
  spire: { x: 50, y: 20 },
  volcano: { x: 70, y: 28 },
  celestial: { x: 89, y: 14 },
  forest: { x: 22, y: 50 },
  plains: { x: 50, y: 50 },
  desert: { x: 80, y: 52 },
  dungeon: { x: 37, y: 78 },
  ruins: { x: 70, y: 78 },
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
  const { t } = useTranslation();
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
                {t(`biomes.${biomeId}`).toUpperCase()}
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
