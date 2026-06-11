import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono, Newsreader } from 'next/font/google';
import { getAdminSession } from '@/lib/auth/session';
import { countUnreadNewsletterSubscribers } from '@/lib/newsletter/repository';
import { getLocale } from '@/lib/i18n/locale';
import { siteConfig } from '@/lib/seo/site';
import { Analytics } from '@/components/analytics';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: siteConfig.author.twitter,
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, adminSession] = await Promise.all([getLocale(), getAdminSession()]);
  const isAdmin = adminSession !== null;
  const unreadNewsletterCount = isAdmin ? await countUnreadNewsletterSubscribers() : 0;

  return (
    <html
      lang={locale}
      className={`${dmSans.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh font-sans" suppressHydrationWarning>
        <SiteHeader
          locale={locale}
          isAdmin={isAdmin}
          unreadNewsletterCount={unreadNewsletterCount}
        />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          {children}
        </main>
        <SiteFooter locale={locale} />
        <Analytics />
      </body>
    </html>
  );
}
