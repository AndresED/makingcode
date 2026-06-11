'use client';

import { useEffect } from 'react';

export function CodeCopyEnhancer() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>('.post-prose pre');

    for (const pre of blocks) {
      if (pre.querySelector('.code-copy-btn')) continue;

      const code = pre.querySelector('code');
      if (!code) continue;

      pre.classList.add('code-block-wrap');
      pre.style.position = 'relative';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy-btn';
      btn.setAttribute('aria-label', 'Copy code');
      btn.textContent = 'Copy';

      btn.addEventListener('click', async () => {
        const text = code.textContent ?? '';
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Copied!';
          window.setTimeout(() => {
            btn.textContent = 'Copy';
          }, 2000);
        } catch {
          btn.textContent = 'Failed';
        }
      });

      pre.appendChild(btn);
    }
  }, []);

  return null;
}
