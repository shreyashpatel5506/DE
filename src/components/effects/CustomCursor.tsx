'use client';

import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
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
      <div ref={glowRef} aria-hidden="true" className="custom-cursor custom-cursor-glow" />
      <div ref={ringRef} aria-hidden="true" className="custom-cursor custom-cursor-ring" />
      <div ref={dotRef} aria-hidden="true" className="custom-cursor custom-cursor-dot" />
    </>
  );
}
