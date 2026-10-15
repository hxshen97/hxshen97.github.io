import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { SceneControls } from './GPUScene';
import type { Lang } from '../../i18n/ui';
import { t } from '../../i18n/ui';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './motion.css';

const GPUScene = lazy(() => import('./GPUScene'));
class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export default function MotionExperience({ lang }: { lang: Lang }) {
  const root = useRef<HTMLDivElement>(null);
  const controls = useRef<SceneControls>({ mode: 0, pulse: 0, scroll: 0, pointer: { x: 0, y: 0 }, frames: 0 });
  const [available, setAvailable] = useState(false);
  const [ready, setReady] = useState(false);
  const [lost, setLost] = useState(false);
  const [mode, setMode] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const [compact, setCompact] = useState(false);
  const active = available && ready && !lost && !paused && !reduced && visible && foreground;
  const onReady = useCallback(() => setReady(true), []);
  const onLost = useCallback(() => setLost(true), []);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    const timer = setInterval(update, 500);
    setCompact(matchMedia('(max-width: 768px)').matches || (navigator.hardwareConcurrency || 8) <= 4);
    const canvas = document.createElement('canvas');
    let context: WebGL2RenderingContext | null = null;
    try { context = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false }); } catch { /* readable fallback */ }
    setAvailable(!!context);
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    const visibility = () => setForeground(!document.hidden);
    visibility(); document.addEventListener('visibilitychange', visibility);
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { rootMargin: '80px' });
    if (root.current) observer.observe(root.current);
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom top', onUpdate: self => { controls.current.scroll = self.progress; } });
    return () => { clearInterval(timer); observer.disconnect(); trigger.kill(); media.removeEventListener('change', update); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  const names = ['motion.knot', 'motion.orbit', 'motion.wave'];
  const fallback = <div className="motion-static" aria-hidden="true"><i /><i /><i /></div>;
  return <div ref={root} className="motion-experience" data-motion-state={active ? 'running' : 'still'}>
    <div className="motion-viewport" onPointerMove={event => {
      if (!active || event.pointerType === 'touch') return;
      const bounds = event.currentTarget.getBoundingClientRect();
      controls.current.pointer = { x: (event.clientX - bounds.left) / bounds.width * 2 - 1, y: (event.clientY - bounds.top) / bounds.height * 2 - 1 };
    }} onPointerLeave={() => { controls.current.pointer = { x: 0, y: 0 }; }} onClick={() => { if (active) controls.current.pulse++; }} aria-hidden="true">
      {available && !lost ? <SceneBoundary fallback={fallback} onError={onLost}><Suspense fallback={fallback}><GPUScene active={active} compact={compact} mode={mode} controls={controls} onReady={onReady} onLost={onLost} /></Suspense></SceneBoundary> : fallback}
      <span className="scene-axis">x / y / z</span>
    </div>
    <div className="motion-toolbar">
      <div className="motion-modes" role="group" aria-label={t(lang, 'motion.choose')}>
        {names.map((key, index) => <button key={key} type="button" aria-pressed={mode === index} onClick={() => { controls.current.mode = index; setMode(index); }}>{t(lang, key)}</button>)}
      </div>
      <div className="motion-actions">
        <button type="button" disabled={!active} onClick={() => { controls.current.pulse++; }}>{t(lang, 'motion.pulse')}</button>
        <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{t(lang, paused ? 'motion.resume' : 'motion.pause')}</button>
      </div>
    </div>
    <p className="motion-hint">{t(lang, !available || lost ? 'motion.fallback' : reduced ? 'motion.reduced' : paused ? 'motion.paused' : 'motion.hint')}</p>
  </div>;
}
