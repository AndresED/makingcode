'use client';

import { useEffect } from 'react';

let mermaidReady: Promise<typeof import('mermaid').default> | null = null;

function loadMermaid() {
  if (!mermaidReady) {
    mermaidReady = import('mermaid').then((mod) => {
      mod.default.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'strict',
        fontFamily: 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
      });
      return mod.default;
    });
  }
  return mermaidReady;
}

interface MermaidRendererProps {
  /** Change when post HTML updates (e.g. markdown preview). */
  renderKey?: string;
}

export function MermaidRenderer({ renderKey = 'static' }: MermaidRendererProps) {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(
      '.post-prose .mermaid-diagram:not([data-rendered])',
    );
    if (nodes.length === 0) return;

    let cancelled = false;

    void (async () => {
      const mermaid = await loadMermaid();
      if (cancelled) return;

      for (const node of nodes) {
        if (cancelled) return;

        const source = node.textContent?.trim() ?? '';
        if (!source) continue;

        const id = `mermaid-${crypto.randomUUID()}`;
        try {
          const { svg } = await mermaid.render(id, source);
          if (cancelled) return;
          node.innerHTML = svg;
          node.dataset.rendered = 'true';
        } catch {
          node.dataset.rendered = 'error';
          node.classList.add('mermaid-error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [renderKey]);

  return null;
}
