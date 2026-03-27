import { useReducer } from "spacetimedb/react";
import { reducers } from "@/generated";
import { useMyPlayer } from "@/hooks/useStdbPlayer";
import type { BiomeId } from "@/lib/biomeThemes";

export function useBiome() {
  const { player } = useMyPlayer();
  const travelReducer = useReducer(reducers.travelToBiome);

  const currentBiome = (player?.currentBiome || "plains") as BiomeId;
  const unlockedBiomes = (player?.unlockedBiomes ?? ["plains"]) as BiomeId[];

  const travelTo = (biomeId: string) => {
    void travelReducer({ biomeId });
  };

  return {
    currentBiome,
    unlockedBiomes,
    travelTo,
    isUnlocked: (id: BiomeId) => id === "plains" || unlockedBiomes.includes(id),
  };
}
