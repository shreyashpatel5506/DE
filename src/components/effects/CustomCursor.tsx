'use client';

import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.classList.add('custom-cursor-enabled');

    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;
    let targetX = ringX;
    let targetY = ringY;
    let rafId = 0;

    const render = () => {
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;

      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

      rafId = window.requestAnimationFrame(render);
    };

    const setHoverState = (hovered: boolean) => {
      ring.classList.toggle('cursor-hover', hovered);
      dot.classList.toggle('cursor-hover', hovered);
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
    const onMouseUp = () => setHoverState(false);

    rafId = window.requestAnimationFrame(render);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('custom-cursor-enabled');
    };
  }, []);

  return (
    <>
      <div ref={ringRef} aria-hidden="true" className="custom-cursor custom-cursor-ring" />
      <div ref={dotRef} aria-hidden="true" className="custom-cursor custom-cursor-dot" />
    </>
  );
}
