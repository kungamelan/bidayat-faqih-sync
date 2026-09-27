import { useState, useEffect, useRef, useCallback } from 'react';
import { SELF_SCROLL_SPEEDS, SelfScrollSpeedLevel } from '../data/themeConfig';

interface UseSelfScrollOptions {
  initialSpeedLevel?: SelfScrollSpeedLevel;
  onReachEnd?: () => void;
  onUserManualInterference?: () => void;
}

export function useSelfScroll(options: UseSelfScrollOptions = {}) {
  const [speedLevel, setSpeedLevelState] = useState<SelfScrollSpeedLevel>(
    options.initialSpeedLevel || 3
  );
  const [isScrolling, setIsScrolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const speedLevelRef = useRef<SelfScrollSpeedLevel>(speedLevel);
  speedLevelRef.current = speedLevel;

  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const scrollAccumulatorRef = useRef<number>(0);

  // Speed level helper
  const currentSpeedConfig =
    SELF_SCROLL_SPEEDS.find((s) => s.level === speedLevel) || SELF_SCROLL_SPEEDS[2];

  // Stop scrolling completely
  const stopScroll = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    lastTimestampRef.current = null;
    scrollAccumulatorRef.current = 0;
    setIsScrolling(false);
    setIsPaused(false);
  }, []);

  // Pause scrolling while preserving exact scroll position
  const pauseScroll = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    lastTimestampRef.current = null;
    setIsPaused(true);
  }, []);

  // Animation loop step
  const step = useCallback(
    (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaMs = Math.min(timestamp - lastTimestampRef.current, 100); // Guard against huge jumps
      lastTimestampRef.current = timestamp;

      const speedObj =
        SELF_SCROLL_SPEEDS.find((s) => s.level === speedLevelRef.current) || SELF_SCROLL_SPEEDS[2];
      const pxPerMs = speedObj.pixelsPerSecond / 1000;
      scrollAccumulatorRef.current += pxPerMs * deltaMs;

      if (scrollAccumulatorRef.current >= 1) {
        const toScroll = Math.floor(scrollAccumulatorRef.current);
        scrollAccumulatorRef.current -= toScroll;

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY || document.documentElement.scrollTop;

        if (currentScroll + toScroll >= maxScroll - 2) {
          // Reached end of document
          window.scrollTo({ top: maxScroll, behavior: 'auto' });
          stopScroll();
          options.onReachEnd?.();
          return;
        }

        window.scrollBy({ top: toScroll, behavior: 'auto' });
      }

      animationFrameRef.current = requestAnimationFrame(step);
    },
    [options, stopScroll]
  );

  // Resume scrolling from current position
  const resumeScroll = useCallback(() => {
    setIsScrolling(true);
    setIsPaused(false);
    lastTimestampRef.current = null;
    scrollAccumulatorRef.current = 0;
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(step);
    }
  }, [step]);

  // Start scrolling
  const startScroll = useCallback(() => {
    resumeScroll();
  }, [resumeScroll]);

  // Toggle play/pause
  const toggleScroll = useCallback(() => {
    if (!isScrolling || isPaused) {
      resumeScroll();
    } else {
      pauseScroll();
    }
  }, [isScrolling, isPaused, resumeScroll, pauseScroll]);

  // Speed controls
  const setSpeedLevel = useCallback((lvl: SelfScrollSpeedLevel) => {
    setSpeedLevelState(lvl);
    speedLevelRef.current = lvl;
  }, []);

  const increaseSpeed = useCallback(() => {
    setSpeedLevelState((prev) => {
      const next = Math.min(5, prev + 1) as SelfScrollSpeedLevel;
      speedLevelRef.current = next;
      return next;
    });
  }, []);

  const decreaseSpeed = useCallback(() => {
    setSpeedLevelState((prev) => {
      const next = Math.max(1, prev - 1) as SelfScrollSpeedLevel;
      speedLevelRef.current = next;
      return next;
    });
  }, []);

  // Listen for user manual interference (touch or mouse wheel)
  // When user manually scrolls, we gracefully pause instead of fighting the user!
  useEffect(() => {
    if (!isScrolling || isPaused) return;

    const handleUserInteraction = () => {
      pauseScroll();
      options.onUserManualInterference?.();
    };

    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('touchmove', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('touchmove', handleUserInteraction);
    };
  }, [isScrolling, isPaused, pauseScroll, options]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    isScrolling,
    isPaused,
    speedLevel,
    currentSpeedConfig,
    startScroll,
    pauseScroll,
    resumeScroll,
    stopScroll,
    toggleScroll,
    setSpeedLevel,
    increaseSpeed,
    decreaseSpeed,
  };
}
