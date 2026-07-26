'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export function useCountUp(target: number, duration = 2000, decimals = 0) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let startTime: number | null = null;
    let frame: number;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration]);

  const display = decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString('en-US');
  return { ref, display };
}
