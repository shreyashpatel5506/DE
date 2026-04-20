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

    const applyTransform = (x: number, y: number) => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }

      rafId = window.requestAnimationFrame(() => {
        wrapper.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };

    const onMouseMove = (event: MouseEvent) => {
      const bounds = wrapper.getBoundingClientRect();
      const relX = event.clientX - bounds.left - bounds.width / 2;
      const relY = event.clientY - bounds.top - bounds.height / 2;

      const x = (relX / bounds.width) * strength;
      const y = (relY / bounds.height) * strength;
      applyTransform(x, y);
      wrapper.classList.add('is-active');
    };

    const reset = () => {
      applyTransform(0, 0);
      wrapper.classList.remove('is-active');
    };

    wrapper.addEventListener('mousemove', onMouseMove);
    wrapper.addEventListener('mouseleave', reset);

    return () => {
      window.cancelAnimationFrame(rafId);
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
