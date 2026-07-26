'use client';

import { useEffect, useRef } from 'react';

/**
 * Spotlight — a radial gradient that follows the mouse on grid backgrounds.
 * Disabled on touch devices (no mousemove events fire).
 * No external dependencies, pure DOM + CSS variables.
 */
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip on touch/coarse pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let raf = 0;

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty('--spotlight-x', `${x}px`);
        el.style.setProperty('--spotlight-y', `${y}px`);
        el.style.setProperty('--spotlight-opacity', '1');
      });
    };

    const onLeave = () => {
      el.style.setProperty('--spotlight-opacity', '0');
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        opacity: 'var(--spotlight-opacity, 0)',
        transition: 'opacity 0.4s ease',
        background:
          'radial-gradient(600px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), hsl(var(--primary) / 0.07), transparent 70%)',
      }}
    />
  );
}
