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
          body_html: string;
          body_md: string;
          category: string;
          cover_image_url: string | null;
          created_at: string;
          excerpt: string;
          id: string;
          locale: string;
          published_at: string | null;
          reading_time_minutes: number;
          slug: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body_html?: string;
          body_md: string;
          category: string;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt: string;
          id?: string;
          locale?: string;
          published_at?: string | null;
          reading_time_minutes?: number;
          slug: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          body_html?: string;
          body_md?: string;
          category?: string;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string;
          id?: string;
          locale?: string;
          published_at?: string | null;
          reading_time_minutes?: number;
          slug?: string;
          status?: string;
          title?: string;
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
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
