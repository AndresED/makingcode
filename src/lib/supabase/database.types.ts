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
      post_series: {
        Row: {
          id: string;
          slug: string;
          title_en: string;
          title_es: string;
          description_en: string | null;
          description_es: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_en: string;
          title_es: string;
          description_en?: string | null;
          description_es?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title_en?: string;
          title_es?: string;
          description_en?: string | null;
          description_es?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      post_series_members: {
        Row: {
          id: string;
          series_id: string;
          post_id: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          series_id: string;
          post_id: string;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          series_id?: string;
          post_id?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'post_series_members_series_id_fkey';
            columns: ['series_id'];
            isOneToOne: false;
            referencedRelation: 'post_series';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_series_members_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: true;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      posts: {
        Row: {
          author_id: string;
          body_html_en: string;
          body_html_es: string;
          body_md_en: string;
          body_md_es: string;
          category: string;
          cover_image_url: string | null;
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
      newsletter_subscribers: {
        Row: {
          admin_seen_at: string | null;
          email: string;
          id: string;
          locale: string;
          status: string;
          subscribed_at: string;
          unsubscribe_token: string;
        };
        Insert: {
          admin_seen_at?: string | null;
          email: string;
          id?: string;
          locale?: string;
          status?: string;
          subscribed_at?: string;
          unsubscribe_token?: string;
        };
        Update: {
          admin_seen_at?: string | null;
          email?: string;
          id?: string;
          locale?: string;
          status?: string;
          subscribed_at?: string;
          unsubscribe_token?: string;
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
      search_published_content: {
        Args: {
          search_query: string;
          search_locale?: string;
          result_limit?: number;
        };
        Returns: Array<{
          result_type: string;
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          category: string | null;
          cover_image_url: string | null;
          reading_time_minutes: number | null;
          published_at: string | null;
          rank: number;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
