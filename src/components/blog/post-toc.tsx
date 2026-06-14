'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/markdown/toc';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';

interface PostTocProps {
  items: TocItem[];
  locale: Locale;
}

function useActiveHeadingId(items: TocItem[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    for (const heading of headings) {
      observer.observe(heading);
    }

    return () => observer.disconnect();
  }, [items]);

  return activeId;
}

function TocList({
  items,
  activeId,
  onNavigate,
}: {
  items: TocItem[];
  activeId: string | null;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1 border-l border-white/[0.08]">
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={onNavigate}
              className={`block border-l-2 py-1 text-sm leading-snug transition-[color,border-color] duration-150 ease-out hover:border-accent-500 hover:text-ink ${
                item.level === 3 ? 'pl-5' : 'pl-4 font-medium'
              } ${
                active
                  ? 'border-accent-500 text-accent-400'
                  : '-ml-px border-transparent text-ink-muted'
              }`}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function PostTocMobile({ items, locale }: PostTocProps) {
  const activeId = useActiveHeadingId(items);
  if (items.length === 0) return null;

  return (
    <details className="group mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 xl:hidden">
      <summary className="cursor-pointer list-none text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          {t(locale, 'article.toc')}
          <span className="text-xs font-normal text-ink-muted group-open:hidden">
            {t(locale, 'article.tocExpand')}
          </span>
        </span>
      </summary>
      <div className="mt-4 max-h-64 overflow-y-auto">
        <TocList items={items} activeId={activeId} />
      </div>
    </details>
  );
}

export function PostToc({ items, locale }: PostTocProps) {
  const activeId = useActiveHeadingId(items);
  if (items.length === 0) return null;

  return (
    <nav aria-label={t(locale, 'article.toc')} className="hidden xl:block">
      <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-8">
        <p className="label-caps mb-4">{t(locale, 'article.toc')}</p>
        <TocList items={items} activeId={activeId} />
      </div>
    </nav>
  );
}
