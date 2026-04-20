'use client';

import { useEffect } from 'react';

export function ScrollEffects() {
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document
        .querySelectorAll<HTMLElement>('main *')
        .forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const assigned = new Set<HTMLElement>();
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

    const isMeaningfulElement = (element: HTMLElement) => {
      const tag = element.tagName.toLowerCase();
      if (['svg', 'path', 'br', 'hr', 'script', 'style', 'defs'].includes(tag)) return false;
      if (element.classList.contains('custom-cursor') || element.classList.contains('cursor-spark')) return false;

      const rect = element.getBoundingClientRect();
      const hasRenderableSize = rect.width > 18 && rect.height > 14;
      if (!hasRenderableSize) return false;

      const computed = window.getComputedStyle(element);
      if (computed.display === 'inline' && element.children.length === 0 && (element.textContent || '').trim().length < 8) {
        return false;
      }

      return true;
    };

    const registerReveal = (element: HTMLElement, delayMs: number, distance = '20px') => {
      if (assigned.has(element) || !isMeaningfulElement(element)) return;
      element.classList.add('scroll-reveal');
      element.style.setProperty('--reveal-delay', `${Math.max(delayMs, 0)}ms`);
      element.style.setProperty('--reveal-distance', distance);
      observer.observe(element);
      assigned.add(element);
    };

    const assignStagedSections = () => {
      const stagedSections = Array.from(main.querySelectorAll<HTMLElement>('.motion-section'));

      stagedSections.forEach((section, sectionIndex) => {
        const items = Array.from(
          section.querySelectorAll<HTMLElement>(':scope > .motion-item')
        ).filter((element) => element.offsetHeight > 18);

        if (items.length > 0) {
          items.forEach((element, itemIndex) => {
            const delay = Math.min(sectionIndex * 95 + itemIndex * 85, 760);
            registerReveal(element, delay, `${Math.max(20 - itemIndex * 2, 10)}px`);
          });
          return;
        }

        registerReveal(section, Math.min(sectionIndex * 95, 560), '22px');
      });
    };

    const assignFallback = () => {
      const fallbackCandidates = Array.from(
        main.querySelectorAll<HTMLElement>(
          [
            'section',
            'article',
            'form',
            '[data-slot="card"]',
            '.card',
            '.grid > *',
            '.space-y-2 > *',
            '.space-y-3 > *',
            '.space-y-4 > *',
            '.space-y-6 > *',
            '.space-y-8 > *',
            'h1, h2, h3, h4, p, li, img, button, input, textarea',
            'main > *',
          ].join(', ')
        )
      ).filter((element) => !assigned.has(element));

      fallbackCandidates.forEach((element, index) => {
        registerReveal(element, Math.min(index * 45, 380), '18px');
      });
    };

    const applyRevealCoverage = () => {
      assignStagedSections();
      assignFallback();
    };

    applyRevealCoverage();

    let parallaxLayers = Array.from(
      document.querySelectorAll<HTMLElement>('[data-parallax-speed]')
    );

    const refreshParallaxLayers = () => {
      parallaxLayers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax-speed]'));
    };

    const refreshCoverage = () => {
      applyRevealCoverage();
      refreshParallaxLayers();
    };

    const coverageTick = window.setInterval(refreshCoverage, 900);

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
    window.addEventListener('load', refreshCoverage);

    return () => {
      observer.disconnect();
      window.clearInterval(coverageTick);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('scroll', updateParallax);
      window.removeEventListener('resize', updateProgress);
      window.removeEventListener('load', refreshCoverage);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div id="scroll-progress-bar" className="scroll-progress-bar" />
    </div>
  );
}
