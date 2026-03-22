import { useEffect, useRef, useState } from "react";

/**
 * Smoothly animates a numeric value from its previous to its current value.
 * Returns the animated display value and whether it's currently animating.
 */
export function useAnimatedValue(
  target: number,
  duration = 600,
): {
  value: number;
  isAnimating: boolean;
} {
  const [display, setDisplay] = useState(target);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevRef = useRef(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    prevRef.current = target;

    if (from === to) return;

    setIsAnimating(true);
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;

      setDisplay(Math.round(current * 10) / 10);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(to);
        setIsAnimating(false);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return { value: display, isAnimating };
}
