'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { asset } from '@/lib/assets';

export const TRACK = {
  title: 'DJ Sudah Terbiasa — Tante Teman',
  short: 'Background music',
  src: asset('/audio/theme.mp3'),
};

const STORAGE_KEY = 'musicEnabled';
const TARGET_VOLUME = 0.45;

/** Fired by the footer link that re-opens the welcome screen. */
export const OPEN_INTRO_EVENT = 'ee:open-intro';

type AudioCtx = {
  track: typeof TRACK;
  /** The visitor's stored answer to the welcome question. */
  enabled: boolean;
  /** Record the answer once, at the welcome screen. */
  setSoundEnabled: (on: boolean) => void;
};

const Ctx = createContext<AudioCtx | null>(null);

/**
 * The soundtrack is decided exactly once, on the welcome screen, and then left
 * alone: there is deliberately no player UI anywhere in the page. Everything
 * here exists to make that single decision hold for the whole visit.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const gestureArmed = useRef<(() => void) | null>(null);
  const enabledRef = useRef(false);

  const [enabled, setEnabled] = useState(false);

  const stopFade = () => {
    if (fadeRef.current !== null) {
      window.clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  };

  const fadeTo = useCallback((target: number, done?: () => void) => {
    const el = audioRef.current;
    if (!el) return;
    stopFade();
    const step = target > el.volume ? 0.05 : -0.08;
    fadeRef.current = window.setInterval(() => {
      const next = el.volume + step;
      if ((step > 0 && next >= target) || (step < 0 && next <= target)) {
        el.volume = Math.max(0, Math.min(1, target));
        stopFade();
        done?.();
        return;
      }
      el.volume = Math.max(0, Math.min(1, next));
    }, 40);
  }, []);

  /** Browsers refuse autoplay until a real gesture happens, so listen once. */
  const armGesture = useCallback(() => {
    if (gestureArmed.current) return;
    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'touchstart'];
    const handler = (event: Event) => {
      // The welcome screen records the answer itself; never let the global
      // fallback start playback behind it (or right after "tanpa musik").
      const target = event.target as Element | null;
      if (target && typeof target.closest === 'function' && target.closest('.intro-overlay')) {
        return;
      }
      events.forEach((e) => document.removeEventListener(e, handler, true));
      gestureArmed.current = null;
      const el = audioRef.current;
      if (!el || !enabledRef.current) return;
      el.play().catch(() => armGesture());
    };
    events.forEach((e) => document.addEventListener(e, handler, { capture: true, passive: true }));
    gestureArmed.current = () => events.forEach((e) => document.removeEventListener(e, handler, true));
  }, []);

  const play = useCallback(() => {
    const el = audioRef.current;
    if (!el || !enabledRef.current) return;
    el.volume = 0;
    const started = el.play();
    if (started && typeof started.then === 'function') {
      started.then(() => fadeTo(TARGET_VOLUME)).catch(() => armGesture());
    }
  }, [fadeTo, armGesture]);

  const pause = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    fadeTo(0, () => el.pause());
  }, [fadeTo]);

  // Hydrate the stored answer. Without one we stay silent until the welcome
  // screen is answered: music must never start before that choice.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    el.volume = 0;
    const on = localStorage.getItem(STORAGE_KEY) === 'on';
    enabledRef.current = on;
    setEnabled(on);

    if (!on) return;

    // Returning visitor who already opted in: start as soon as we can.
    const id = window.setTimeout(() => play(), 350);
    return () => window.clearTimeout(id);
  }, [play]);

  const setSoundEnabled = useCallback(
    (on: boolean) => {
      enabledRef.current = on;
      setEnabled(on);
      localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
      gestureArmed.current?.();
      gestureArmed.current = null;
      if (on) play();
      else pause();
    },
    [pause, play]
  );

  useEffect(() => {
    return () => {
      stopFade();
      gestureArmed.current?.();
    };
  }, []);

  const value = useMemo<AudioCtx>(
    () => ({ track: TRACK, enabled, setSoundEnabled }),
    [enabled, setSoundEnabled]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <audio ref={audioRef} src={TRACK.src} loop preload="auto" aria-hidden="true" />
    </Ctx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAudio must be used inside AudioProvider');
  return ctx;
}
