import { BIOME_META, type BiomeId, ALL_BIOMES } from "@/lib/biomeThemes";

interface WorldMapSVGProps {
  currentBiome: BiomeId;
  unlockedBiomes: BiomeId[];
  selectedBiome: BiomeId | null;
  onRegionClick: (biomeId: BiomeId) => void;
}

// Region polygon coordinates — clickable hit areas
const REGION_POLYGONS: Record<BiomeId, string> = {
  plains: "160,200 230,160 310,170 320,260 240,290 160,265",
  tundra: "40,50 160,50 160,200 80,200 40,150",
  volcano: "350,50 640,50 640,200 480,220 440,160 310,170",
  forest: "40,150 80,200 160,265 100,340 40,300",
  dungeon: "240,290 320,260 390,340 390,380 100,380 100,340",
  desert: "320,260 440,160 480,220 490,330 390,340",
  spire: "160,50 350,50 310,170 230,160",
  ruins: "390,340 490,330 640,200 640,380 390,380",
  celestial: "565,44 640,44 640,95 565,95",
};

// Approximate centres for labels and markers
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

export function WorldMapSVG({
  currentBiome,
  unlockedBiomes,
  selectedBiome,
  onRegionClick,
}: WorldMapSVGProps) {
  const isUnlocked = (id: BiomeId) => id === "plains" || unlockedBiomes.includes(id);

  return (
    <svg viewBox="0 0 680 420" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Ocean background */}
      <rect x="0" y="0" width="680" height="420" className="fill-background" />

      {/* Water/ocean waves */}
      <g
        opacity="0.15"
        className="stroke-primary"
        fill="none"
        strokeWidth="1.5"
        pointerEvents="none"
      >
        <path d="M 0,400 Q 80,385 170,400 T 340,400 T 510,400 T 680,400" />
        <path d="M 0,410 Q 100,395 200,410 T 400,410 T 600,410 T 680,410" />
        <path d="M 0,390 Q 60,378 120,390 T 240,390 T 360,390 T 480,390 T 600,390 T 680,390" />
      </g>

      {/* Terrain decorations */}
      {/* Mountains for volcano region */}
      <g opacity="0.12" className="fill-destructive" pointerEvents="none">
        <polygon points="460,80 480,50 500,80" />
        <polygon points="520,70 545,35 570,70" />
        <polygon points="580,90 600,60 620,90" />
      </g>

      {/* Trees for forest region */}
      <g opacity="0.15" className="fill-primary" pointerEvents="none">
        <polygon points="55,180 60,160 65,180" />
        <polygon points="70,200 75,175 80,200" />
        <polygon points="90,220 95,195 100,220" />
        <polygon points="45,250 50,230 55,250" />
      </g>

      {/* Snow caps for tundra */}
      <g opacity="0.12" className="fill-muted-foreground" pointerEvents="none">
        <polygon points="60,70 75,50 90,70" />
        <polygon points="110,80 125,55 140,80" />
        <circle cx="80" cy="100" r="3" />
        <circle cx="120" cy="95" r="2" />
      </g>

      {/* Stars for celestial */}
      <g opacity="0.2" className="fill-primary" pointerEvents="none">
        <circle cx="575" cy="55" r="1.5" />
        <circle cx="595" cy="48" r="1" />
        <circle cx="610" cy="62" r="1.5" />
        <circle cx="625" cy="50" r="1" />
        <circle cx="630" cy="75" r="1.5" />
      </g>

      {/* Region polygons */}
      {ALL_BIOMES.map((biomeId) => {
        const points = REGION_POLYGONS[biomeId];
        const center = REGION_CENTERS[biomeId];
        const unlocked = isUnlocked(biomeId);
        const isCurrent = biomeId === currentBiome;
        const isSelected = biomeId === selectedBiome;
        const meta = BIOME_META[biomeId];

        return (
          <g key={biomeId} onClick={() => onRegionClick(biomeId)} className="cursor-pointer">
            {/* Region fill */}
            <polygon
              points={points}
              fill={
                unlocked ? `${meta.mapColor}${isCurrent ? "40" : "25"}` : "rgba(128,128,128,0.1)"
              }
              stroke={
                isSelected
                  ? meta.mapColor
                  : isCurrent
                    ? `${meta.mapColor}cc`
                    : "rgba(128,128,128,0.3)"
              }
              strokeWidth={isSelected || isCurrent ? 2.5 : 1}
              strokeDasharray={unlocked ? "none" : "6 4"}
              opacity={unlocked ? 1 : 0.5}
              className="transition-all duration-200 hover:opacity-80"
            />

            {/* Region icon + name */}
            <text
              x={center.x}
              y={center.y - 6}
              textAnchor="middle"
              fontSize="12"
              className="retro pointer-events-none select-none"
              fill={unlocked ? meta.mapColor : "rgba(128,128,128,0.5)"}
            >
              {meta.icon}
            </text>
            <text
              x={center.x}
              y={center.y + 10}
              textAnchor="middle"
              fontSize="7"
              fontFamily="'Press Start 2P', monospace"
              fill={unlocked ? "rgba(255,255,255,0.9)" : "rgba(128,128,128,0.4)"}
              className="pointer-events-none select-none"
            >
              {meta.name.toUpperCase()}
            </text>

            {/* Lock icon for locked regions */}
            {!unlocked && (
              <text
                x={center.x}
                y={center.y + 24}
                textAnchor="middle"
                fontSize="10"
                className="pointer-events-none"
              >
                🔒
              </text>
            )}

            {/* Player marker for current region */}
            {isCurrent && (
              <g>
                <circle
                  cx={center.x}
                  cy={center.y + 24}
                  r="6"
                  fill="white"
                  stroke={meta.mapColor}
                  strokeWidth="1.5"
                />
                <circle cx={center.x} cy={center.y + 24} r="3" fill={meta.mapColor} />
                {/* Pulse ring */}
                <circle
                  cx={center.x}
                  cy={center.y + 24}
                  r="8"
                  fill="none"
                  stroke={meta.mapColor}
                  strokeWidth="0.5"
                  opacity="0.4"
                >
                  <animate attributeName="r" from="6" to="14" dur="2s" repeatCount="indefinite" />
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
  );
}
