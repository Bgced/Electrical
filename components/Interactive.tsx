'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/app-context';
import type { I18nKey } from '@/lib/i18n';

function BlockHead({ label }: { label: I18nKey }) {
  const { t } = useApp();
  return (
    <div className="block-head">
      <span className="block-label">{t(label)}</span>
      <span className="block-line" />
    </div>
  );
}

/* ---------------- 3D Core ---------------- */
export function ThreeD() {
  const { t } = useApp();
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const [fast, setFast] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene) return;

    let rotX = 62;
    let rotZ = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let velocity = 0;

    const apply = () => {
      scene.style.transform = `rotateX(${rotX}deg) rotateZ(${rotZ}deg)`;
    };

    const start = (e: MouseEvent | TouchEvent) => {
      dragging = true;
      const p = 'touches' in e ? e.touches[0] : e;
      lastX = p.clientX;
      lastY = p.clientY;
      velocity = 0;
      coreRef.current?.classList.add('paused');
      scene.style.transition = 'none';
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const p = 'touches' in e ? e.touches[0] : e;
      const dx = p.clientX - lastX;
      const dy = p.clientY - lastY;
      lastX = p.clientX;
      lastY = p.clientY;

      rotZ += dx * 0.5;
      rotX = Math.max(20, Math.min(85, rotX - dy * 0.35));
      velocity = dx * 0.5;
      apply();
      if ('cancelable' in e && e.cancelable) e.preventDefault();
    };

    const end = () => {
      if (!dragging) return;
      dragging = false;
      scene.style.transition = 'transform 0.15s linear';

      let v = velocity;
      const glide = () => {
        if (dragging || Math.abs(v) < 0.4) {
          coreRef.current?.classList.remove('paused');
          return;
        }
        rotZ += v;
        v *= 0.94;
        apply();
        requestAnimationFrame(glide);
      };
      glide();
    };

    stage.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    stage.addEventListener('touchstart', start, { passive: true });
    stage.addEventListener('touchmove', move, { passive: false });
    stage.addEventListener('touchend', end);

    return () => {
      stage.removeEventListener('mousedown', start);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
      stage.removeEventListener('touchstart', start);
      stage.removeEventListener('touchmove', move);
      stage.removeEventListener('touchend', end);
    };
  }, []);

  return (
    <section id="visual3d" className="block">
      <div className="container">
        <BlockHead label="three.label" />
        <div className="three-layout">
          <div className="three-stage" ref={stageRef}>
            <div className="scene" ref={sceneRef}>
              <div className={`core${fast ? ' fast' : ''}`} ref={coreRef}>
                <div className="ring ring-1" />
                <div className="ring ring-2" />
                <div className="ring ring-3" />
                <div className="ring ring-4" />
                <div className="core-center">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14H11L11 22L21 10H13V2Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="orbit orbit-1">
                  <span />
                </div>
                <div className="orbit orbit-2">
                  <span />
                </div>
                <div className="orbit orbit-3">
                  <span />
                </div>
              </div>
            </div>
            <span className="three-hint">{t('three.hint')}</span>
          </div>

          <div className="three-info">
            <h2 className="three-title">{t('three.title')}</h2>
            <p className="three-desc">{t('three.desc')}</p>

            <div className="three-facts">
              <div className="three-fact">
                <span className="three-fact-label">{t('three.f1')}</span>
                <span className="three-fact-val">0°</span>
              </div>
              <div className="three-fact">
                <span className="three-fact-label">{t('three.f2')}</span>
                <span className="three-fact-val">120°</span>
              </div>
              <div className="three-fact">
                <span className="three-fact-label">{t('three.f3')}</span>
                <span className="three-fact-val">240°</span>
              </div>
            </div>

            <div className="three-actions">
              <button
                className="sim-btn-run"
                onClick={() => setFast((v) => !v)}
              >
                {fast ? t('three.spin') + ' ✓' : t('three.spin')}
              </button>
              <button
                className="sim-btn-reset"
                onClick={() => {
                  setFast(false);
                  if (sceneRef.current) {
                    sceneRef.current.style.transition = 'transform 0.5s ease';
                    sceneRef.current.style.transform = 'rotateX(62deg) rotateZ(0deg)';
                  }
                }}
              >
                {t('three.reset')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
