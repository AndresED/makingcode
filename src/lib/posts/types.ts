import type { PostCategory } from './categories';

export type PostStatus = 'draft' | 'published';

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  body_html: string;
  status: PostStatus;
  category: PostCategory;
  locale: string;
  cover_image_url: string | null;
  reading_time_minutes: number;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
