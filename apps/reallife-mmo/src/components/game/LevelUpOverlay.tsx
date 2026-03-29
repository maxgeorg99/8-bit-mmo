import { useEffect, useRef, useState } from "react";
import { useMyPlayer } from "@/hooks/useStdbPlayer";

/**
 * Full-screen overlay that flashes briefly when the player levels up.
 * Watches the player's level and triggers on increase.
 */
export function LevelUpOverlay() {
  const { player } = useMyPlayer();
  const level = player?.level ?? 0;
  const hasPlayer = player !== null && player !== undefined;
  const [show, setShow] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(level);
  // null means "not yet initialized with real player data"
  const prevLevelRef = useRef<number | null>(null);

  useEffect(() => {
    // Don't do anything until we have real player data from SpacetimeDB
    if (!hasPlayer) return;

    // First time we see real player data — store level without animating
    if (prevLevelRef.current === null) {
      prevLevelRef.current = level;
      return;
    }

    if (level > prevLevelRef.current) {
      setDisplayLevel(level);
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2500);
      prevLevelRef.current = level;
      return () => clearTimeout(timer);
    }
    prevLevelRef.current = level;
  }, [level, hasPlayer]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Flash background */}
      <div className="absolute inset-0 bg-yellow-500/20 animate-pulse" />

      {/* Level up text */}
      <div className="relative flex flex-col items-center gap-2 animate-bounce">
        <div className="retro text-3xl text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]">
          LEVEL UP!
        </div>
        <div className="retro text-lg text-foreground">Level {displayLevel}</div>
      </div>
    </div>
  );
}
