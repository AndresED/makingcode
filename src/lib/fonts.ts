import localFont from 'next/font/local';

/** Self-hosted — no Google Fonts at build/runtime (design-system + offline-friendly). */
export const hubotSans = localFont({
  src: [
    { path: '../fonts/hubot-sans-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/hubot-sans-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/hubot-sans-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-hubot',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const sourceSans = localFont({
  src: [
    { path: '../fonts/source-sans-3-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/source-sans-3-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/source-sans-3-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-source-sans',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const jetbrainsMono = localFont({
  src: [
    { path: '../fonts/jetbrains-mono-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/jetbrains-mono-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-jetbrains',
  display: 'swap',
  fallback: ['Consolas', 'monospace'],
});
