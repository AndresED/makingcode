'use client';

import { useState } from 'react';
import { MarkdownPreview } from '@/components/blog/markdown-preview';

interface MarkdownFieldProps {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  rows?: number;
}

export function MarkdownField({
  name,
  label,
  defaultValue = '',
  required,
  rows = 14,
}: MarkdownFieldProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="space-y-2">
      <label className="mb-1 block text-sm text-ink-muted">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={required}
        rows={rows}
        className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 font-mono text-sm leading-relaxed text-ink"
      />
      <MarkdownPreview markdown={value} label={label} />
    </div>
  );
}
