export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      grief_support_answers: {
        Row: {
          answer: string
          created_at: string
          id: string
          question_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grief_support_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      loved_one_access: {
        Row: {
          created_at: string
          granted_by: string
          id: string
          loved_one_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by: string
          id?: string
          loved_one_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string
          id?: string
          loved_one_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loved_one_access_loved_one_id_fkey"
            columns: ["loved_one_id"]
            isOneToOne: false
            referencedRelation: "loved_ones"
            referencedColumns: ["id"]
          },
        ]
      }
      loved_ones: {
        Row: {
          admin_user_id: string
          birth_certificate_url: string | null
          created_at: string
          date_of_birth: string | null
          date_of_death: string | null
          death_certificate_url: string | null
          first_name: string
          id: string
          last_name: string
          memorial_website_url: string | null
          obituary: string | null
          photo_url: string | null
          relationship_to_user: string | null
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          birth_certificate_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_death?: string | null
          death_certificate_url?: string | null
          first_name: string
          id?: string
          last_name: string
          memorial_website_url?: string | null
          obituary?: string | null
          photo_url?: string | null
          relationship_to_user?: string | null
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          birth_certificate_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_death?: string | null
          death_certificate_url?: string | null
          first_name?: string
          id?: string
          last_name?: string
          memorial_website_url?: string | null
          obituary?: string | null
          photo_url?: string | null
          relationship_to_user?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      memorial_favorites: {
        Row: {
          category: string
          created_at: string
          id: string
          item_description: string | null
          item_image_url: string | null
          item_name: string
          memorial_page_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          item_description?: string | null
          item_image_url?: string | null
          item_name: string
          memorial_page_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          item_description?: string | null
          item_image_url?: string | null
          item_name?: string
          memorial_page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memorial_favorites_memorial_page_id_fkey"
            columns: ["memorial_page_id"]
            isOneToOne: false
            referencedRelation: "memorial_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      memorial_memories: {
        Row: {
          caption: string | null
          created_at: string
          file_type: string
          file_url: string
          id: string
          is_approved: boolean | null
          memorial_page_id: string
          memory_date: string | null
          uploaded_by_email: string | null
          uploaded_by_name: string | null
          uploaded_by_user_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_type: string
          file_url: string
          id?: string
          is_approved?: boolean | null
          memorial_page_id: string
          memory_date?: string | null
          uploaded_by_email?: string | null
          uploaded_by_name?: string | null
          uploaded_by_user_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_type?: string
          file_url?: string
          id?: string
          is_approved?: boolean | null
          memorial_page_id?: string
          memory_date?: string | null
          uploaded_by_email?: string | null
          uploaded_by_name?: string | null
          uploaded_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memorial_memories_memorial_page_id_fkey"
            columns: ["memorial_page_id"]
            isOneToOne: false
            referencedRelation: "memorial_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_memories_uploaded_by_user_id_fkey"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      memorial_pages: {
        Row: {
          background_image_url: string | null
          charity_name: string | null
          charity_url: string | null
          created_at: string
          custom_css: string | null
          custom_message: string | null
          custom_sections: Json | null
          description: string | null
          font_family: string | null
          header_style: string | null
          id: string
          is_public: boolean | null
          layout_style: string | null
          loved_one_id: string
          memorial_music_url: string | null
          privacy_level: string | null
          show_dates: boolean | null
          show_favorites: boolean | null
          show_quotes: boolean | null
          show_timeline: boolean | null
          slug: string
          theme_color: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          charity_name?: string | null
          charity_url?: string | null
          created_at?: string
          custom_css?: string | null
          custom_message?: string | null
          custom_sections?: Json | null
          description?: string | null
          font_family?: string | null
          header_style?: string | null
          id?: string
          is_public?: boolean | null
          layout_style?: string | null
          loved_one_id: string
          memorial_music_url?: string | null
          privacy_level?: string | null
          show_dates?: boolean | null
          show_favorites?: boolean | null
          show_quotes?: boolean | null
          show_timeline?: boolean | null
          slug: string
          theme_color?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          charity_name?: string | null
          charity_url?: string | null
          created_at?: string
          custom_css?: string | null
          custom_message?: string | null
          custom_sections?: Json | null
          description?: string | null
          font_family?: string | null
          header_style?: string | null
          id?: string
          is_public?: boolean | null
          layout_style?: string | null
          loved_one_id?: string
          memorial_music_url?: string | null
          privacy_level?: string | null
          show_dates?: boolean | null
          show_favorites?: boolean | null
          show_quotes?: boolean | null
          show_timeline?: boolean | null
          slug?: string
          theme_color?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memorial_pages_loved_one_id_fkey"
            columns: ["loved_one_id"]
            isOneToOne: false
            referencedRelation: "loved_ones"
            referencedColumns: ["id"]
          },
        ]
      }
      memorial_quotes: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          id: string
          memorial_page_id: string
          quote_text: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          memorial_page_id: string
          quote_text: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          memorial_page_id?: string
          quote_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "memorial_quotes_memorial_page_id_fkey"
            columns: ["memorial_page_id"]
            isOneToOne: false
            referencedRelation: "memorial_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      memorial_timeline: {
        Row: {
          created_at: string
          display_order: number | null
          event_date: string
          event_description: string | null
          event_image_url: string | null
          event_title: string
          id: string
          memorial_page_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          event_date: string
          event_description?: string | null
          event_image_url?: string | null
          event_title: string
          id?: string
          memorial_page_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          event_date?: string
          event_description?: string | null
          event_image_url?: string | null
          event_title?: string
          id?: string
          memorial_page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memorial_timeline_memorial_page_id_fkey"
            columns: ["memorial_page_id"]
            isOneToOne: false
            referencedRelation: "memorial_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      memorial_tributes: {
        Row: {
          author_email: string | null
          author_name: string
          author_user_id: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          memorial_page_id: string
          message: string
        }
        Insert: {
          author_email?: string | null
          author_name: string
          author_user_id?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          memorial_page_id: string
          message: string
        }
        Update: {
          author_email?: string | null
          author_name?: string
          author_user_id?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          memorial_page_id?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "memorial_tributes_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "memorial_tributes_memorial_page_id_fkey"
            columns: ["memorial_page_id"]
            isOneToOne: false
            referencedRelation: "memorial_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_answers: {
        Row: {
          answers_json: Json
          completion_pct: number
          created_at: string
          id: string
          loved_one_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers_json?: Json
          completion_pct?: number
          created_at?: string
          id?: string
          loved_one_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers_json?: Json
          completion_pct?: number
          created_at?: string
          id?: string
          loved_one_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          id: string
          loved_one_id: string
          plan_json: Json
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          loved_one_id: string
          plan_json?: Json
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          loved_one_id?: string
          plan_json?: Json
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_team_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by_user_id: string
          invited_email: string
          invited_first_name: string
          invited_last_name: string
          loved_one_id: string
          relationship_to_loved_one: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by_user_id: string
          invited_email: string
          invited_first_name: string
          invited_last_name: string
          loved_one_id: string
          relationship_to_loved_one?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by_user_id?: string
          invited_email?: string
          invited_first_name?: string
          invited_last_name?: string
          loved_one_id?: string
          relationship_to_loved_one?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_team_invitations_loved_one_id_fkey"
            columns: ["loved_one_id"]
            isOneToOne: false
            referencedRelation: "loved_ones"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to_user_id: string | null
          category: string | null
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          due_date: string | null
          id: string
          is_custom: boolean
          is_personalized: boolean
          loved_one_id: string
          priority: string | null
          status: string | null
          task_key: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_custom?: boolean
          is_personalized?: boolean
          loved_one_id: string
          priority?: string | null
          status?: string | null
          task_key?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to_user_id?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_custom?: boolean
          is_personalized?: boolean
          loved_one_id?: string
          priority?: string | null
          status?: string | null
          task_key?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_loved_one_id_fkey"
            columns: ["loved_one_id"]
            isOneToOne: false
            referencedRelation: "loved_ones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          interest_reason: string | null
          last_name: string | null
          referral_source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          interest_reason?: string | null
          last_name?: string | null
          referral_source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          interest_reason?: string | null
          last_name?: string | null
          referral_source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_memorial_memories: {
        Row: {
          caption: string | null
          created_at: string | null
          file_type: string | null
          file_url: string | null
          id: string | null
          memorial_page_id: string | null
          memory_date: string | null
          uploaded_by_name: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string | null
          memorial_page_id?: string | null
          memory_date?: string | null
          uploaded_by_name?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string | null
          memorial_page_id?: string | null
          memory_date?: string | null
          uploaded_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memorial_memories_memorial_page_id_fkey"
            columns: ["memorial_page_id"]
            isOneToOne: false
            referencedRelation: "memorial_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      public_memorial_tributes: {
        Row: {
          author_name: string | null
          created_at: string | null
          id: string | null
          memorial_page_id: string | null
          message: string | null
        }
        Insert: {
          author_name?: string | null
          created_at?: string | null
          id?: string | null
          memorial_page_id?: string | null
          message?: string | null
        }
        Update: {
          author_name?: string | null
          created_at?: string | null
          id?: string | null
          memorial_page_id?: string | null
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memorial_tributes_memorial_page_id_fkey"
            columns: ["memorial_page_id"]
            isOneToOne: false
            referencedRelation: "memorial_pages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      audit_memorial_security: {
        Args: { _memorial_page_id?: string }
        Returns: {
          memorial_page_id: string
          potential_issues: string[]
          privacy_level: string
          recommendation: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_invitation_by_token: {
        Args: { invitation_token: string }
        Returns: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by_user_id: string
          invited_email: string
          invited_first_name: string
          invited_last_name: string
          loved_one_id: string
          relationship_to_loved_one: string | null
          role: string
          status: string
          updated_at: string
        }[]
      }
      get_profiles_for_users: {
        Args: { loved_one_id: string; user_ids: string[] }
        Returns: {
          avatar_url: string
          first_name: string
          last_name: string
          user_id: string
        }[]
      }
      get_public_memorial_memories: {
        Args: { _memorial_page_id: string }
        Returns: {
          caption: string
          created_at: string
          file_type: string
          file_url: string
          id: string
          memory_date: string
          uploaded_by_name: string
        }[]
      }
      get_public_memories: {
        Args: { _memorial_page_id: string }
        Returns: {
          caption: string
          created_at: string
          file_type: string
          file_url: string
          id: string
          memory_date: string
          uploaded_by_name: string
        }[]
      }
      get_public_tributes: {
        Args: { _memorial_page_id: string }
        Returns: {
          author_name: string
          created_at: string
          id: string
          message: string
        }[]
      }
      get_sanitized_memorial_content: {
        Args: { _memorial_page_id: string; _user_id?: string }
        Returns: {
          author_name: string
          content: string
          created_at: string
          id: string
          is_sensitive: boolean
        }[]
      }
      get_tribute_contacts: {
        Args: { _memorial_page_id: string }
        Returns: {
          author_email: string
          author_name: string
          created_at: string
          message: string
          tribute_id: string
        }[]
      }
      get_user_highest_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: boolean
      }
      user_can_access_memorial_details: {
        Args: { _memorial_page_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_loved_one_access: {
        Args: { _loved_one_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
