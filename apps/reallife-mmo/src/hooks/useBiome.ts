import { useGameStore } from "@/lib/gameStore";
import type { BiomeId } from "@/lib/biomeThemes";

export function useBiome() {
  const currentBiome = useGameStore((s) => (s.player.currentBiome ?? "plains") as BiomeId);
  const unlockedBiomes = useGameStore((s) => (s.player.unlockedBiomes ?? ["plains"]) as BiomeId[]);
  const travelTo = useGameStore((s) => s.travelToBiome);

  return {
    currentBiome,
    unlockedBiomes,
    travelTo,
    isUnlocked: (id: BiomeId) => id === "plains" || unlockedBiomes.includes(id),
  };
}
