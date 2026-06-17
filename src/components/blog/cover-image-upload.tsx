'use client';

import { useRef, useState } from 'react';

interface CoverImageUploadProps {
  defaultValue?: string;
  name?: string;
  onChange?: (url: string) => void;
}

export function CoverImageUpload({
  defaultValue = '',
  name = 'cover_image_url',
  onChange,
}: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/cover', { method: 'POST', body: formData });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Upload failed');
        return;
      }

      setUrl(data.url);
      onChange?.(data.url);
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => void onFileChange(e)}
          disabled={uploading}
          className="text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent-500/15 file:px-3 file:py-1.5 file:text-sm file:text-accent-400"
        />
        {uploading ? <span className="text-xs text-ink-muted">Uploading…</span> : null}
      </div>
      <input
        type="url"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          onChange?.(e.target.value);
        }}
        placeholder="Or paste image URL"
        className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-sm text-ink"
      />
      {url ? (
        <div className="relative aspect-[2/1] max-w-xs overflow-hidden rounded-lg border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Cover preview" className="size-full object-cover" />
        </div>
      ) : null}
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
