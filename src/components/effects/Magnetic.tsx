'use client';

import { ReactNode, useEffect, useRef } from 'react';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({ children, className = '', strength = 20 }: MagneticProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
      return;
    }

    let rafId = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let active = false;

    const animate = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;

      wrapper.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      const isSettled = Math.abs(targetX - currentX) < 0.05 && Math.abs(targetY - currentY) < 0.05;
      if (!active && isSettled) {
        rafId = 0;
        return;
      }

      rafId = window.requestAnimationFrame(animate);
    };

    const startLoop = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(animate);
    };

    const onMouseMove = (event: MouseEvent) => {
      const bounds = wrapper.getBoundingClientRect();
      const relX = event.clientX - bounds.left - bounds.width / 2;
      const relY = event.clientY - bounds.top - bounds.height / 2;

      targetX = (relX / bounds.width) * strength;
      targetY = (relY / bounds.height) * strength;
      active = true;
      wrapper.classList.add('is-active');
      startLoop();
    };

    const reset = () => {
      targetX = 0;
      targetY = 0;
      active = false;
      wrapper.classList.remove('is-active');
      startLoop();
    };

    const onMouseEnter = () => {
      active = true;
      startLoop();
    };

    wrapper.addEventListener('mouseenter', onMouseEnter);
    wrapper.addEventListener('mousemove', onMouseMove);
    wrapper.addEventListener('mouseleave', reset);

    return () => {
      window.cancelAnimationFrame(rafId);
      wrapper.removeEventListener('mouseenter', onMouseEnter);
      wrapper.removeEventListener('mousemove', onMouseMove);
      wrapper.removeEventListener('mouseleave', reset);
    };
  }, [strength]);

  return (
    <div ref={wrapperRef} className={`magnetic cursor-hit ${className}`.trim()}>
      {children}
    </div>
  );
}
