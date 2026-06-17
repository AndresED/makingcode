'use client';

import { useEffect, useState } from 'react';
import { MermaidRenderer } from '@/components/blog/mermaid-renderer';

interface MarkdownPreviewProps {
  markdown: string;
  label: string;
}

export function MarkdownPreview({ markdown, label }: MarkdownPreviewProps) {
  const [html, setHtml] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || markdown.trim().length === 0) {
      setHtml('');
      return;
    }

    const timer = window.setTimeout(() => {
      setLoading(true);
      void fetch('/api/markdown/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown }),
      })
        .then((res) => res.json())
        .then((data: { html?: string }) => setHtml(data.html ?? ''))
        .finally(() => setLoading(false));
    }, 400);

    return () => window.clearTimeout(timer);
  }, [markdown, open]);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-meta-400 transition-colors duration-150 ease-out hover:text-ink"
      >
        {open ? `Hide ${label} preview` : `Preview ${label}`}
      </button>
      {open ? (
        <div className="rounded-xl border border-white/10 bg-dark-900/60 p-4">
          {loading ? (
            <p className="text-sm text-ink-muted">Rendering…</p>
          ) : (
            <>
              <div
                className="post-prose max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <MermaidRenderer renderKey={html} />
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
