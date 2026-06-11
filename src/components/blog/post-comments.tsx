'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';
import { getGiscusConfig } from '@/lib/giscus/config';

interface PostCommentsProps {
  locale: Locale;
}

export function PostComments({ locale }: PostCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const config = useMemo(() => getGiscusConfig(locale), [locale]);

  useEffect(() => {
    if (!config || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', config.repo);
    script.setAttribute('data-repo-id', config.repoId);
    script.setAttribute('data-category', config.category);
    script.setAttribute('data-category-id', config.categoryId);
    script.setAttribute('data-mapping', config.mapping);
    script.setAttribute('data-strict', String(config.strict));
    script.setAttribute('data-reactions-enabled', String(config.reactionsEnabled));
    script.setAttribute('data-emit-metadata', String(config.emitMetadata));
    script.setAttribute('data-input-position', config.inputPosition);
    script.setAttribute('data-theme', config.theme);
    script.setAttribute('data-lang', config.lang);
    script.setAttribute('data-loading', 'lazy');

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [config, locale]);

  if (!config) return null;

  return (
    <section className="mt-12 space-y-4" aria-label={t(locale, 'article.comments')}>
      <h2 className="font-display text-xl text-ink">{t(locale, 'article.comments')}</h2>
      <div ref={containerRef} className="giscus min-h-[12rem]" />
    </section>
  );
}
