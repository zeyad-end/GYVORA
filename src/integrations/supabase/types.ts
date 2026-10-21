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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      client_gym_links: {
        Row: {
          favorite: boolean
          gym_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          favorite?: boolean
          gym_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          favorite?: boolean
          gym_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_gym_links_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_gym_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_membership_history: {
        Row: {
          definition: Json
          gym_id: string
          gym_name: string
          id: string
          member_record_id: string
          recorded_at: string
          user_id: string
        }
        Insert: {
          definition: Json
          gym_id: string
          gym_name: string
          id?: string
          member_record_id: string
          recorded_at?: string
          user_id: string
        }
        Update: {
          definition?: Json
          gym_id?: string
          gym_name?: string
          id?: string
          member_record_id?: string
          recorded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_membership_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_programs: {
        Row: {
          completion: number[]
          created_at: string
          definition: Json
          id: string
          user_id: string
        }
        Insert: {
          completion?: number[]
          created_at?: string
          definition: Json
          id?: string
          user_id: string
        }
        Update: {
          completion?: number[]
          created_at?: string
          definition?: Json
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_programs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_owner_event_status: {
        Row: {
          dismissed_at: string | null
          event_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          dismissed_at?: string | null
          event_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          dismissed_at?: string | null
          event_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_owner_event_status_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "gym_owner_events"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_owner_events: {
        Row: {
          created_at: string
          description: string
          event_key: string | null
          gym_id: string
          id: string
          page: string
          type: string
        }
        Insert: {
          created_at?: string
          description: string
          event_key?: string | null
          gym_id: string
          id?: string
          page: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string
          event_key?: string | null
          gym_id?: string
          id?: string
          page?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_owner_events_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_records: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          data: Json
          gym_id: string
          id: string
          kind: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          data: Json
          gym_id: string
          id: string
          kind: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          data?: Json
          gym_id?: string
          id?: string
          kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_records_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gyms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      login_challenges: {
        Row: {
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          decision_by: string | null
          gym_id: string | null
          gym_name: string
          id: string
          plan: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decision_by?: string | null
          gym_id?: string | null
          gym_name: string
          id?: string
          plan: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decision_by?: string | null
          gym_id?: string | null
          gym_name?: string
          id?: string
          plan?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_requests_decision_by_fkey"
            columns: ["decision_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_requests_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_request_notifications: {
        Row: {
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          request_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          request_id: string
        }
        Update: {
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_request_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_request_notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "owner_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          email: string
          full_name: string
          id: string
          member_id: string
          phone: string
          photo: string
        }
        Insert: {
          account_type?: string
          email?: string
          full_name?: string
          id: string
          member_id?: string
          phone?: string
          photo?: string
        }
        Update: {
          account_type?: string
          email?: string
          full_name?: string
          id?: string
          member_id?: string
          phone?: string
          photo?: string
        }
        Relationships: []
      }
      staff_invitations: {
        Row: {
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          full_name: string
          gym_id: string
          id: string
          permissions: string[]
          role: string
          status: string
        }
        Insert: {
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          full_name: string
          gym_id: string
          id?: string
          permissions?: string[]
          role: string
          status?: string
        }
        Update: {
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          full_name?: string
          gym_id?: string
          id?: string
          permissions?: string[]
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_invitations_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          display_name: string
          gym_id: string | null
          id: string
          permissions: string[]
          phone: string
          role: string
          user_id: string
        }
        Insert: {
          display_name?: string
          gym_id?: string | null
          id?: string
          permissions?: string[]
          phone?: string
          role: string
          user_id: string
        }
        Update: {
          display_name?: string
          gym_id?: string | null
          id?: string
          permissions?: string[]
          phone?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      verified_sessions: {
        Row: {
          expires_at: string
          session_id: string
          user_id: string
          verified_at: string
        }
        Insert: {
          expires_at: string
          session_id: string
          user_id: string
          verified_at?: string
        }
        Update: {
          expires_at?: string
          session_id?: string
          user_id?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verified_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_read_image: { Args: { path: string }; Returns: boolean }
      client_gym_content: { Args: { g: string }; Returns: Json }
      client_gym_directory: { Args: never; Returns: Json }
      decide_owner_request: {
        Args: { approve: boolean; request_id: string }
        Returns: string
      }
      finish_login: {
        Args: {
          challenge_hash: string
          expires: string
          sid: string
          uid: string
        }
        Returns: boolean
      }
      gym_access: { Args: { area?: string; g: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      otp_verified: { Args: never; Returns: boolean }
      refresh_gym_expiration_events: {
        Args: { day: string; g: string }
        Returns: undefined
      }
      respond_invitation: {
        Args: { accept: boolean; invitation_id: string }
        Returns: undefined
      }
      save_gym_records: {
        Args: { changes: Json; g: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
