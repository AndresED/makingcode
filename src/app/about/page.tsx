import type { Metadata } from 'next';
import { siteConfig } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${siteConfig.name} and ${siteConfig.author.name}.`,
};

export default function AboutPage() {
  return (
    <article className="prose prose-invert max-w-none space-y-4">
      <h1 className="text-3xl font-semibold text-ink">About</h1>
      <p className="text-ink-body">
        {siteConfig.name} is the technical blog of{' '}
        <a
          href={siteConfig.author.url}
          className="text-accent-500 hover:text-ink"
          target="_blank"
          rel="noopener noreferrer"
        >
          {siteConfig.author.name}
        </a>
        — Senior Backend Engineer writing about distributed systems, cloud architecture,
        and pragmatic software craft.
      </p>
      <p className="text-ink-muted">
        Articles are published in English. Site chrome supports English and Spanish.
      </p>
    </article>
  );
}
