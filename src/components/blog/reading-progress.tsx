'use client';

import { useEffect, useState } from 'react';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const article = document.querySelector<HTMLElement>('article[data-article]');
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = article.offsetHeight;
      const viewportBottom = window.scrollY + window.innerHeight;
      const read = viewportBottom - articleTop;
      const pct = Math.min(100, Math.max(0, (read / articleHeight) * 100));
      setProgress(pct);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-14 z-40 h-0.5 bg-white/[0.04]"
      aria-hidden="true"
    >
      <div
        className="h-full bg-accent-500 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
