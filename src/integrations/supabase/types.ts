export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      quote_requests: {
        Row: {
          appetizers: Json | null
          chafers_requested: boolean | null
          contact_name: string
          created_at: string | null
          custom_menu_requests: string | null
          desserts: Json | null
          dietary_restrictions: Json | null
          drinks: Json | null
          email: string
          event_date: string
          event_name: string
          event_type: Database["public"]["Enums"]["event_type"]
          extras: Json | null
          guest_count: number
          id: string
          linens_requested: boolean | null
          location: string
          phone: string
          primary_protein: string | null
          referral_source: string | null
          secondary_protein: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          serving_start_time: string | null
          sides: Json | null
          special_requests: string | null
          start_time: string
          status: Database["public"]["Enums"]["quote_status"] | null
          tables_chairs_requested: boolean | null
          updated_at: string | null
          utensils: Json | null
          wait_staff_requested: boolean | null
          wait_staff_requirements: string | null
          wait_staff_setup_areas: string | null
        }
        Insert: {
          appetizers?: Json | null
          chafers_requested?: boolean | null
          contact_name: string
          created_at?: string | null
          custom_menu_requests?: string | null
          desserts?: Json | null
          dietary_restrictions?: Json | null
          drinks?: Json | null
          email: string
          event_date: string
          event_name: string
          event_type: Database["public"]["Enums"]["event_type"]
          extras?: Json | null
          guest_count: number
          id?: string
          linens_requested?: boolean | null
          location: string
          phone: string
          primary_protein?: string | null
          referral_source?: string | null
          secondary_protein?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          serving_start_time?: string | null
          sides?: Json | null
          special_requests?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["quote_status"] | null
          tables_chairs_requested?: boolean | null
          updated_at?: string | null
          utensils?: Json | null
          wait_staff_requested?: boolean | null
          wait_staff_requirements?: string | null
          wait_staff_setup_areas?: string | null
        }
        Update: {
          appetizers?: Json | null
          chafers_requested?: boolean | null
          contact_name?: string
          created_at?: string | null
          custom_menu_requests?: string | null
          desserts?: Json | null
          dietary_restrictions?: Json | null
          drinks?: Json | null
          email?: string
          event_date?: string
          event_name?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          extras?: Json | null
          guest_count?: number
          id?: string
          linens_requested?: boolean | null
          location?: string
          phone?: string
          primary_protein?: string | null
          referral_source?: string | null
          secondary_protein?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          serving_start_time?: string | null
          sides?: Json | null
          special_requests?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["quote_status"] | null
          tables_chairs_requested?: boolean | null
          updated_at?: string | null
          utensils?: Json | null
          wait_staff_requested?: boolean | null
          wait_staff_requirements?: string | null
          wait_staff_setup_areas?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_type:
        | "corporate"
        | "private-party"
        | "birthday"
        | "anniversary"
        | "graduation"
        | "holiday-party"
        | "other"
      quote_status:
        | "pending"
        | "reviewed"
        | "quoted"
        | "confirmed"
        | "completed"
        | "cancelled"
      service_type: "drop-off" | "full-service"
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
      event_type: [
        "corporate",
        "private-party",
        "birthday",
        "anniversary",
        "graduation",
        "holiday-party",
        "other",
      ],
      quote_status: [
        "pending",
        "reviewed",
        "quoted",
        "confirmed",
        "completed",
        "cancelled",
      ],
      service_type: ["drop-off", "full-service"],
    },
  },
} as const
