import type { Metadata } from 'next';
import { hasAuthSessionCookies } from '@/lib/auth/session';
import { hubotSans, jetbrainsMono, sourceSans } from '@/lib/fonts';
import { getDocumentLocale } from '@/lib/i18n/document-locale';
import { siteConfig } from '@/lib/seo/site';
import { Analytics } from '@/components/analytics';
import { SiteJsonLd } from '@/components/seo/site-json-ld';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

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
  const [locale, showAdminNav] = await Promise.all([getDocumentLocale(), hasAuthSessionCookies()]);

  return (
    <html
      lang={locale}
      className={`${hubotSans.variable} ${sourceSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh font-sans" suppressHydrationWarning>
        <SiteJsonLd />
        <SiteHeader locale={locale} isAdmin={showAdminNav} />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          {children}
        </main>
        <SiteFooter locale={locale} />
        <Analytics />
      </body>
    </html>
  );
}
