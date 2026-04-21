'use client';

import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sparks = Array.from(document.querySelectorAll<HTMLSpanElement>('.cursor-spark'));
    if (sparks.length === 0) return;

    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    let sparkIndex = 0;
    let lastSparkAt = 0;

    const emitSpark = (x: number, y: number, intensity: number) => {
      const now = performance.now();
      if (now - lastSparkAt < 28) return;
      lastSparkAt = now;

      const spark = sparks[sparkIndex % sparks.length];
      sparkIndex += 1;
      if (!spark) return;

      const angle = Math.random() * Math.PI * 2;
      const travel = (18 + Math.random() * 34) * Math.max(0.85, intensity);
      const dx = Math.cos(angle) * travel;
      const dy = Math.sin(angle) * travel;
      const duration = 320 + Math.random() * 180;

      spark.style.setProperty('--spark-x', `${x}px`);
      spark.style.setProperty('--spark-y', `${y}px`);
      spark.style.setProperty('--spark-dx', `${dx.toFixed(2)}px`);
      spark.style.setProperty('--spark-dy', `${dy.toFixed(2)}px`);
      spark.style.setProperty('--spark-r', `${angle.toFixed(4)}rad`);
      spark.style.setProperty('--spark-duration', `${duration.toFixed(0)}ms`);
      spark.classList.remove('spark-active');
      void spark.offsetWidth;
      spark.classList.add('spark-active');
    };

    const emitSparkBurst = (x: number, y: number, count: number, intensity: number) => {
      for (let i = 0; i < count; i += 1) {
        emitSpark(x, y, intensity * (0.9 + Math.random() * 0.35));
      }
    };

    if (!isFinePointer) {
      const onTouchStart = (event: TouchEvent) => {
        const touch = event.changedTouches[0] || event.touches[0];
        if (!touch) return;
        emitSparkBurst(touch.clientX, touch.clientY, 3, 1.15);
      };

      const onTouchMove = (event: TouchEvent) => {
        const touch = event.touches[0] || event.changedTouches[0];
        if (!touch) return;
        emitSpark(touch.clientX, touch.clientY, 1.02);
      };

      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });

      return () => {
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
      };
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    const glow = glowRef.current;
    if (!dot || !ring || !glow) return;

    document.body.classList.add('custom-cursor-enabled');

    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;
    let glowX = ringX;
    let glowY = ringY;
    let targetX = ringX;
    let targetY = ringY;
    let scale = 1;
    let targetScale = 1;
    let velocityX = 0;
    let velocityY = 0;
    let previousX = targetX;
    let previousY = targetY;
    let rafId = 0;

    const render = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      glowX += (targetX - glowX) * 0.1;
      glowY += (targetY - glowY) * 0.1;
      scale += (targetScale - scale) * 0.22;

      velocityX = (targetX - ringX) * 0.12;
      velocityY = (targetY - ringY) * 0.12;
      const stretch = Math.min(Math.max(Math.hypot(velocityX, velocityY) * 0.025, 1), 1.35);

      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${scale})`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${Math.min(scale * stretch, 1.5)})`;
      glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) scale(${Math.max(scale * 0.95, 0.92)})`;

      rafId = window.requestAnimationFrame(render);
    };

    const setHoverState = (hovered: boolean) => {
      ring.classList.toggle('cursor-hover', hovered);
      dot.classList.toggle('cursor-hover', hovered);
      glow.classList.toggle('cursor-hover', hovered);
      targetScale = hovered ? 1.12 : 1;
    };

    const onMouseMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      const deltaX = targetX - previousX;
      const deltaY = targetY - previousY;
      const speed = Math.hypot(deltaX, deltaY);
      if (speed > 2) {
        emitSpark(targetX, targetY, Math.min(speed / 18, 1.45));
      }

      previousX = targetX;
      previousY = targetY;
    };

    const onMouseOver = (event: MouseEvent) => {
      const element = event.target as HTMLElement | null;
      const isInteractive = !!element?.closest(
        'a, button, [role="button"], input, select, textarea, summary, .cursor-hit'
      );
      setHoverState(isInteractive);
    };

    const onMouseDown = () => setHoverState(true);
    const onMouseUp = () => {
      targetScale = 1;
      ring.classList.remove('cursor-pressed');
      dot.classList.remove('cursor-pressed');
      glow.classList.remove('cursor-pressed');
    };

    const onMousePress = () => {
      targetScale = 0.92;
      ring.classList.add('cursor-pressed');
      dot.classList.add('cursor-pressed');
      glow.classList.add('cursor-pressed');
    };

    const onWindowLeave = () => {
      dot.classList.add('cursor-hidden');
      ring.classList.add('cursor-hidden');
      glow.classList.add('cursor-hidden');
    };

    const onWindowEnter = () => {
      dot.classList.remove('cursor-hidden');
      ring.classList.remove('cursor-hidden');
      glow.classList.remove('cursor-hidden');
    };

    rafId = window.requestAnimationFrame(render);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMousePress);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseleave', onWindowLeave);
    window.addEventListener('mouseenter', onWindowEnter);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMousePress);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseleave', onWindowLeave);
      window.removeEventListener('mouseenter', onWindowEnter);
      document.body.classList.remove('custom-cursor-enabled');
    };
  }, []);

  return (
    <>
      {Array.from({ length: 18 }).map((_, index) => (
        <span key={index} aria-hidden="true" className="cursor-spark" />
      ))}
      <div ref={glowRef} aria-hidden="true" className="custom-cursor custom-cursor-glow" />
      <div ref={ringRef} aria-hidden="true" className="custom-cursor custom-cursor-ring" />
      <div ref={dotRef} aria-hidden="true" className="custom-cursor custom-cursor-dot" />
    </>
  );
}
