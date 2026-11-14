'use client';

import { useState } from 'react';

type Props = {
  /** Hovering or tapping the engineer lifts the multimeter. */
  active?: boolean;
  className?: string;
};

/**
 * Flat-line editorial character: yellow hard hat, safety glasses, hi-vis
 * coverall, multimeter in the left hand, right hand waving.
 *
 * Everything is static markup + CSS keyframes (see scene.css), so there is
 * nothing time- or random-dependent in render and no hydration mismatch.
 * `transform-box: fill-box` on the animated groups keeps the pivots correct.
 */
export default function EngineerCharacter2D({ active = false, className = '' }: Props) {
  const [waved, setWaved] = useState(false);

  return (
    <svg
      className={`eng${active ? ' is-active' : ''}${waved ? ' has-waved' : ''} ${className}`}
      viewBox="0 0 360 640"
      role="img"
      aria-label="Teknisi listrik melambai sambil memegang multimeter"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="engVest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0bd68" />
          <stop offset="1" stopColor="#d99f45" />
        </linearGradient>
        <linearGradient id="engSuit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#31414f" />
          <stop offset="1" stopColor="#22303c" />
        </linearGradient>
        <linearGradient id="engSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5d0b2" />
          <stop offset="1" stopColor="#e7ba96" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="184" cy="612" rx="104" ry="16" fill="#05070a" opacity="0.45" />

      <g className="eng-body">
        {/* ---- waving arm (behind torso) ---- */}
        <g className="eng-arm-wave">
          <path
            d="M236 268 C268 244 286 208 300 168"
            fill="none"
            stroke="url(#engSuit)"
            strokeWidth="34"
            strokeLinecap="round"
          />
          <path
            d="M236 268 C268 244 286 208 300 168"
            fill="none"
            stroke="#14161a"
            strokeWidth="34"
            strokeLinecap="round"
            strokeOpacity="0.001"
          />
          <circle cx="303" cy="158" r="19" fill="url(#engSkin)" stroke="#14161a" strokeWidth="5.5" />
          {/* fingers */}
          <path
            d="M296 141 l-1 -15 M307 141 l0 -16 M317 146 l5 -13"
            stroke="#14161a"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>

        {/* ---- legs (mostly hidden behind the console) ---- */}
        <path d="M148 470 L142 632 L180 632 L184 470 Z" fill="#263441" stroke="#14161a" strokeWidth="5" />
        <path d="M190 470 L198 632 L236 632 L226 470 Z" fill="#1f2b36" stroke="#14161a" strokeWidth="5" />

        {/* ---- torso / coverall ---- */}
        <path
          d="M132 262 C132 238 150 224 180 224 C210 224 230 238 230 262 L238 424 C238 452 220 466 184 466 C148 466 130 452 130 424 Z"
          fill="url(#engSuit)"
          stroke="#14161a"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* hi-vis vest */}
        <path
          d="M140 268 C140 248 156 236 180 236 C204 236 222 248 222 268 L227 400 C227 424 212 436 184 436 C156 436 139 424 139 400 Z"
          fill="url(#engVest)"
          stroke="#14161a"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />

        {/* reflective bands */}
        <path d="M138 330 L226 330" stroke="#f7fbfd" strokeWidth="13" strokeOpacity="0.92" />
        <path d="M138 330 L226 330" stroke="#9fb2bf" strokeWidth="3" strokeOpacity="0.7" />
        <path d="M137 366 L228 366" stroke="#f7fbfd" strokeWidth="7" strokeOpacity="0.85" />
        {/* zipper + collar */}
        <path d="M180 240 L180 434" stroke="#14161a" strokeWidth="4" strokeOpacity="0.55" />
        <path
          d="M160 232 L180 262 L200 232"
          fill="none"
          stroke="#14161a"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* chest badge */}
        <g transform="translate(198 286)">
          <rect x="0" y="0" width="34" height="22" rx="4" fill="#f7fbfd" stroke="#14161a" strokeWidth="4" />
          <path d="M8 15 v-5 h4 v5 M16 15 v-9 h4 v9 M24 15 v-6 h4 v6" stroke="#14161a" strokeWidth="2.6" />
        </g>

        {/* ---- tool arm (front) ---- */}
        <g className="eng-arm-tool">
          <path
            d="M130 272 C112 296 104 326 100 352"
            fill="none"
            stroke="url(#engSuit)"
            strokeWidth="32"
            strokeLinecap="round"
          />
          <circle cx="98" cy="360" r="17" fill="url(#engSkin)" stroke="#14161a" strokeWidth="5.5" />

          {/* multimeter */}
          <g transform="translate(56 352) rotate(-12)">
            <rect x="0" y="0" width="62" height="86" rx="9" fill="#f5b83c" stroke="#14161a" strokeWidth="5.5" />
            <rect x="9" y="10" width="44" height="30" rx="4" fill="#0f1a18" stroke="#14161a" strokeWidth="3.5" />
            <text
              x="31"
              y="31"
              textAnchor="middle"
              fill="#7df0c0"
              fontSize="16"
              fontFamily="'JetBrains Mono', monospace"
            >
              380
            </text>
            <circle cx="31" cy="58" r="10" fill="#14161a" />
            <path d="M31 51 l0 14 M24 58 l14 0" stroke="#f5b83c" strokeWidth="3" strokeLinecap="round" />
            <path d="M14 72 h34" stroke="#14161a" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          </g>
          {/* probes */}
          <path
            d="M104 374 C120 392 132 404 148 410"
            fill="none"
            stroke="#c8402f"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M104 380 C118 400 128 412 142 420"
            fill="none"
            stroke="#14161a"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        {/* ---- head ---- */}
        <g className="eng-head">
          <path d="M166 222 h30 v22 h-30 z" fill="url(#engSkin)" stroke="#14161a" strokeWidth="5" />
          <circle cx="181" cy="164" r="54" fill="url(#engSkin)" stroke="#14161a" strokeWidth="6" />

          {/* ear */}
          <circle cx="129" cy="168" r="9" fill="url(#engSkin)" stroke="#14161a" strokeWidth="4.5" />

          {/* hair tuft */}
          <path
            d="M136 130 C142 108 162 100 182 104"
            fill="none"
            stroke="#3a2b22"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* hard hat */}
          <path
            d="M126 134 C126 92 150 70 181 70 C212 70 236 92 236 134 Z"
            fill="#f5c451"
            stroke="#14161a"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path d="M181 70 L181 134" stroke="#14161a" strokeWidth="4" strokeOpacity="0.5" />
          <path d="M144 84 C154 76 166 73 181 73" stroke="#fff3d1" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
          <rect
            x="116"
            y="128"
            width="132"
            height="17"
            rx="8.5"
            fill="#e8b247"
            stroke="#14161a"
            strokeWidth="5.5"
          />
          <rect x="168" y="132" width="26" height="9" rx="4" fill="#14161a" opacity="0.35" />

          {/* safety glasses */}
          <g>
            <rect x="136" y="150" width="40" height="28" rx="9" fill="#bfe6f7" fillOpacity="0.4" stroke="#14161a" strokeWidth="5" />
            <rect x="186" y="150" width="40" height="28" rx="9" fill="#bfe6f7" fillOpacity="0.4" stroke="#14161a" strokeWidth="5" />
            <path d="M176 160 h10" stroke="#14161a" strokeWidth="5" />
            <path d="M136 158 l-12 -3 M226 158 l12 -3" stroke="#14161a" strokeWidth="4.5" strokeLinecap="round" />
            {/* blinking eyes */}
            <g className="eng-eyes">
              <path d="M150 163 q6 -5 12 0" stroke="#14161a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M200 163 q6 -5 12 0" stroke="#14161a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </g>
            <path d="M143 154 q12 -6 24 0" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.55" fill="none" />
          </g>

          {/* smile + cheek */}
          <path d="M166 194 q14 12 30 0" fill="none" stroke="#14161a" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="154" cy="189" r="6" fill="#e98a72" opacity="0.45" />
          <circle cx="210" cy="189" r="6" fill="#e98a72" opacity="0.45" />
        </g>
      </g>
    </svg>
  );
}
