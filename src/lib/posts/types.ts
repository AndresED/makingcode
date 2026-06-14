import type { PostCategory } from './categories';

export type PostStatus = 'draft' | 'published';

/** Row shape from Supabase (bilingual storage). */
export interface PostRecord {
  id: string;
  title_en: string;
  title_es: string;
  slug_en: string;
  slug_es: string;
  excerpt_en: string;
  excerpt_es: string;
  body_md_en: string;
  body_md_es: string;
  body_html_en: string;
  body_html_es: string;
  category: PostCategory;
  cover_image_url: string | null;
  series_slug?: string | null;
  series_order?: number | null;
  reading_time_minutes: number;
  status: PostStatus;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Public/admin view after applying UI locale. */
export interface LocalizedPost {
  id: string;
  slug: string;
  alternateSlug: string;
  title: string;
  excerpt: string;
  body_md: string;
  body_html: string;
  category: PostCategory;
  cover_image_url: string | null;
  series_slug: string | null;
  series_order: number | null;
  reading_time_minutes: number;
  published_at: string;
  status: PostStatus;
  author_id: string;
  created_at: string;
  updated_at: string;
  title_en: string;
  title_es: string;
  slug_en: string;
  slug_es: string;
}

export type PostSummary = Pick<
  LocalizedPost,
  | 'id'
  | 'slug'
  | 'alternateSlug'
  | 'title'
  | 'excerpt'
  | 'category'
  | 'cover_image_url'
  | 'reading_time_minutes'
  | 'published_at'
  | 'series_order'
>;

export type PostDetail = LocalizedPost;

export type SeriesPostSummary = Pick<LocalizedPost, 'id' | 'slug' | 'title'>;
