'use client';

import { useEffect, useRef } from 'react';

export function AnimatedBackdrop() {
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      backdrop.style.setProperty('--mx', x.toFixed(3));
      backdrop.style.setProperty('--my', y.toFixed(3));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={backdropRef} aria-hidden="true" className="animated-backdrop">
      <div className="backdrop-grid" data-parallax-speed="-0.015" />
      <div className="backdrop-orb orb-1" data-parallax-speed="-0.045" />
      <div className="backdrop-orb orb-2" data-parallax-speed="0.03" />
      <div className="backdrop-orb orb-3" data-parallax-speed="-0.02" />
      <div className="backdrop-noise" />
    </div>
  );
}
