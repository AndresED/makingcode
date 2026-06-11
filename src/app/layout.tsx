import type { Metadata } from 'next';
import { getLocale } from '@/lib/i18n/locale';
import { siteConfig } from '@/lib/seo/site';
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
  },
  twitter: {
    card: 'summary_large_image',
    creator: siteConfig.author.twitter,
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="min-h-screen">
        <SiteHeader locale={locale} />
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
