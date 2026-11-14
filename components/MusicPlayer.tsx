'use client';

import { useApp } from '@/lib/app-context';
import { useAudio } from '@/lib/audio';

function Equalizer({ active }: { active: boolean }) {
  return (
    <span className={`eq${active ? ' on' : ''}`} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

/** Header button: the one obvious, always-reachable way to control sound. */
export function MusicButton() {
  const { playing, blocked, toggle, track } = useAudio();
  const { lang } = useApp();

  const label = playing
    ? lang === 'id'
      ? 'Matikan musik latar'
      : 'Turn off background music'
    : lang === 'id'
      ? 'Nyalakan musik latar'
      : 'Turn on background music';

  return (
    <button
      type="button"
      className={`btn-icon music-btn${playing ? ' is-playing' : ''}${blocked ? ' is-blocked' : ''}`}
      aria-label={label}
      aria-pressed={playing}
      title={`${label} · ${track.title}`}
      onClick={toggle}
    >
      <Equalizer active={playing} />
      <span className="sr-only">{label}</span>
    </button>
  );
}

/** Small floating indicator so visitors can see (and stop) what they hear. */
export function NowPlaying() {
  const { playing, toggle, track } = useAudio();
  const { lang } = useApp();

  return (
    <div className={`now-playing${playing ? ' show' : ''}`} aria-hidden={!playing}>
      <span className="now-playing-eq">
        <Equalizer active={playing} />
      </span>
      <span className="now-playing-text">
        <span className="now-playing-kicker">{lang === 'id' ? 'Musik Latar' : 'Now Playing'}</span>
        <span className="now-playing-title">{track.title}</span>
      </span>
      <button
        type="button"
        className="now-playing-btn"
        aria-label={lang === 'id' ? 'Jeda musik' : 'Pause music'}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      </button>
    </div>
  );
}
