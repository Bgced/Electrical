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
  short: 'Now Playing',
  src: asset('/audio/theme.mp3'),
};

const STORAGE_KEY = 'musicEnabled';
const TARGET_VOLUME = 0.45;

type AudioCtx = {
  track: typeof TRACK;
  playing: boolean;
  /** User preference: may the background track play at all? */
  enabled: boolean;
  /** Autoplay was refused and we are waiting for the first tap/click. */
  blocked: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  /** Explicitly turn background sound on or off (persisted). */
  setSoundEnabled: (on: boolean) => void;
};

const Ctx = createContext<AudioCtx | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const gestureArmed = useRef<(() => void) | null>(null);
  const enabledRef = useRef(true);

  const [playing, setPlaying] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [blocked, setBlocked] = useState(false);

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
    const step = target > el.volume ? 0.06 : -0.08;
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

  const play = useCallback(() => {
    const el = audioRef.current;
    if (!el || !enabledRef.current) return;
    el.volume = 0;
    const started = el.play();
    if (started && typeof started.then === 'function') {
      started
        .then(() => {
          setPlaying(true);
          setBlocked(false);
          fadeTo(TARGET_VOLUME);
        })
        .catch(() => {
          setPlaying(false);
          setBlocked(true);
        });
    }
  }, [fadeTo]);

  const pause = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    fadeTo(0, () => {
      el.pause();
      setPlaying(false);
    });
  }, [fadeTo]);

  /** Browsers refuse autoplay until a real gesture happens, so listen once. */
  const armGesture = useCallback(() => {
    if (gestureArmed.current) return;
    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'touchstart'];
    const handler = (event: Event) => {
      // Let the music controls handle their own clicks so the first press
      // cannot start playback and immediately toggle it back off.
      const target = event.target as Element | null;
      if (target && typeof target.closest === 'function') {
        if (target.closest('.music-btn, .now-playing-btn')) return;
      }
      events.forEach((e) => document.removeEventListener(e, handler, true));
      gestureArmed.current = null;
      if (enabledRef.current) play();
    };
    events.forEach((e) =>
      document.addEventListener(e, handler, { capture: true, passive: true })
    );
    gestureArmed.current = () => events.forEach((e) => document.removeEventListener(e, handler, true));
  }, [play]);

  // Hydrate the stored preference and wire media events.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const pref = localStorage.getItem(STORAGE_KEY);
    const on = pref !== 'off';
    enabledRef.current = on;
    setEnabled(on);
    el.volume = 0;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);

    if (on) {
      // Give the intro overlay a moment to claim the first gesture itself.
      const id = window.setTimeout(() => play(), 350);
      return () => {
        window.clearTimeout(id);
        el.removeEventListener('play', onPlay);
        el.removeEventListener('pause', onPause);
      };
    }

    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
    };
  }, [play]);

  // If autoplay was refused, start on the first interaction anywhere.
  useEffect(() => {
    if (blocked && enabled) armGesture();
  }, [blocked, enabled, armGesture]);

  useEffect(() => {
    return () => {
      stopFade();
      gestureArmed.current?.();
    };
  }, []);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    gestureArmed.current?.();
    gestureArmed.current = null;
    if (el.paused) {
      enabledRef.current = true;
      setEnabled(true);
      localStorage.setItem(STORAGE_KEY, 'on');
      play();
    } else {
      enabledRef.current = false;
      setEnabled(false);
      localStorage.setItem(STORAGE_KEY, 'off');
      setBlocked(false);
      pause();
    }
  }, [pause, play]);

  const setSoundEnabled = useCallback(
    (on: boolean) => {
      enabledRef.current = on;
      setEnabled(on);
      localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
      if (on) {
        setBlocked(false);
        play();
      } else {
        setBlocked(false);
        pause();
      }
    },
    [pause, play]
  );

  const value = useMemo<AudioCtx>(
    () => ({ track: TRACK, playing, enabled, blocked, play, pause, toggle, setSoundEnabled }),
    [playing, enabled, blocked, play, pause, toggle, setSoundEnabled]
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
