import type { PostCategory } from './categories';

export type PostStatus = 'draft' | 'published';

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: PostCategory;
  cover_image_url: string | null;
  reading_time_minutes: number;
  published_at: string;
}

export interface PostDetail extends PostSummary {
  body_md: string;
  body_html: string;
  status: PostStatus;
  locale: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}
