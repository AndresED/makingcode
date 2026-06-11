export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      posts: {
        Row: {
          author_id: string;
          body_html_en: string;
          body_html_es: string;
          body_md_en: string;
          body_md_es: string;
          category: string;
          cover_image_url: string | null;
          series_slug: string | null;
          series_order: number | null;
          created_at: string;
          excerpt_en: string;
          excerpt_es: string;
          id: string;
          published_at: string | null;
          reading_time_minutes: number;
          slug_en: string;
          slug_es: string;
          status: string;
          title_en: string;
          title_es: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body_html_en?: string;
          body_html_es?: string;
          body_md_en: string;
          body_md_es: string;
          category: string;
          cover_image_url?: string | null;
          series_slug?: string | null;
          series_order?: number | null;
          created_at?: string;
          excerpt_en: string;
          excerpt_es: string;
          id?: string;
          published_at?: string | null;
          reading_time_minutes?: number;
          slug_en: string;
          slug_es: string;
          status?: string;
          title_en: string;
          title_es: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          body_html_en?: string;
          body_html_es?: string;
          body_md_en?: string;
          body_md_es?: string;
          category?: string;
          cover_image_url?: string | null;
          series_slug?: string | null;
          series_order?: number | null;
          created_at?: string;
          excerpt_en?: string;
          excerpt_es?: string;
          id?: string;
          published_at?: string | null;
          reading_time_minutes?: number;
          slug_en?: string;
          slug_es?: string;
          status?: string;
          title_en?: string;
          title_es?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
