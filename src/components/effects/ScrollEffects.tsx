'use client';

import { useEffect } from 'react';

export function ScrollEffects() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document
        .querySelectorAll<HTMLElement>('main .scroll-reveal, main .motion-item, main .motion-section')
        .forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const assigned = new Set<HTMLElement>();
    const stagedSections = Array.from(
      document.querySelectorAll<HTMLElement>('main .motion-section')
    );

    stagedSections.forEach((section, sectionIndex) => {
      const items = Array.from(
        section.querySelectorAll<HTMLElement>(':scope > .motion-item')
      ).filter((element) => element.offsetHeight > 18);

      if (items.length > 0) {
        items.forEach((element, itemIndex) => {
          element.classList.add('scroll-reveal');
          const delay = Math.min(sectionIndex * 95 + itemIndex * 85, 760);
          element.style.setProperty('--reveal-delay', `${delay}ms`);
          element.style.setProperty('--reveal-distance', `${Math.max(20 - itemIndex * 2, 10)}px`);
          assigned.add(element);
        });
        return;
      }

      section.classList.add('scroll-reveal');
      section.style.setProperty('--reveal-delay', `${Math.min(sectionIndex * 95, 560)}ms`);
      section.style.setProperty('--reveal-distance', '22px');
      assigned.add(section);
    });

    const fallbackCandidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        'main > *, main section, main article, main .card, main .grid > *, main .space-y-4 > *, main .space-y-6 > *'
      )
    )
      .filter((element) => element.offsetHeight > 36)
      .filter((element) => !assigned.has(element));

    fallbackCandidates.forEach((element, index) => {
      element.classList.add('scroll-reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(index * 45, 300)}ms`);
      element.style.setProperty('--reveal-distance', '18px');
      assigned.add(element);
    });

    const candidates = Array.from(assigned);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    candidates.forEach((element) => observer.observe(element));

    const parallaxLayers = Array.from(
      document.querySelectorAll<HTMLElement>('[data-parallax-speed]')
    );

    const updateParallax = () => {
      const scrollY = window.scrollY;
      parallaxLayers.forEach((layer) => {
        const speed = Number(layer.dataset.parallaxSpeed || '0');
        const movement = scrollY * speed;
        layer.style.transform = `translate3d(0, ${movement.toFixed(2)}px, 0)`;
      });
    };

    const progressBar = document.getElementById('scroll-progress-bar');
    const updateProgress = () => {
      if (!progressBar) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    };

    updateProgress();
    updateParallax();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('scroll', updateParallax);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div id="scroll-progress-bar" className="scroll-progress-bar" />
    </div>
  );
}
