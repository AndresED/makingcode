import { ImageResponse } from 'next/og';
import { categoryLabel } from '@/lib/i18n/category';
import { localizePost } from '@/lib/posts/localize';
import { getPublishedPostRecordBySlug } from '@/lib/posts/repository';
import { localeFromPostSlug } from '@/lib/seo/locale-from-slug';
import { siteConfig } from '@/lib/seo/site';

export const alt = 'Article';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface OgImageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostOpenGraphImage({ params }: OgImageProps) {
  const { slug } = await params;
  const record = await getPublishedPostRecordBySlug(slug);
  const locale = record ? localeFromPostSlug(record, slug) : 'en';
  const post = record ? localizePost(record, locale) : null;

  const title = post?.title ?? siteConfig.name;
  const category = post ? categoryLabel(locale, post.category) : '';
  const excerpt = post?.excerpt?.slice(0, 140) ?? siteConfig.description;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '64px 72px',
          background: 'linear-gradient(145deg, #08090b 0%, #13151a 45%, #1a1d24 100%)',
          color: '#f0f2f5',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#d4925f',
              background: 'rgba(193,122,74,0.15)',
              padding: '8px 14px',
              borderRadius: 8,
            }}
          >
            MC
          </div>
          <div style={{ fontSize: 22, color: '#8b919c' }}>{siteConfig.name}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {category ? (
            <div
              style={{
                fontSize: 20,
                color: '#7aacbf',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 600,
              }}
            >
              {category}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 26, color: '#8b919c', lineHeight: 1.45, maxWidth: 900 }}>
            {excerpt}
          </div>
        </div>
        <div style={{ fontSize: 20, color: '#5b8fa8' }}>makingcode.dev</div>
      </div>
    ),
    { ...size },
  );
}
