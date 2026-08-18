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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          birth_year: number | null
          created_at: string
          display_name: string | null
          id: string
          stage: Database["public"]["Enums"]["life_stage"]
          updated_at: string
        }
        Insert: {
          birth_year?: number | null
          created_at?: string
          display_name?: string | null
          id: string
          stage?: Database["public"]["Enums"]["life_stage"]
          updated_at?: string
        }
        Update: {
          birth_year?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          stage?: Database["public"]["Enums"]["life_stage"]
          updated_at?: string
        }
        Relationships: []
      }
      symptom_entries: {
        Row: {
          anxiety: number | null
          brain_fog: number | null
          cramps: number | null
          created_at: string
          cycle_note: string | null
          energy_level: number | null
          entry_date: string
          fatigue: number | null
          flow_intensity: number | null
          hot_flashes: number | null
          id: string
          irritability: number | null
          joint_aches: number | null
          logged_at: string
          mental_note: string | null
          missed_period: boolean
          mood: number | null
          mood_swings: number | null
          night_sweats: number | null
          night_wakings: number | null
          period_day: boolean
          period_start: boolean
          physical_note: string | null
          rest_note: string | null
          sleep_quality: number | null
          spotting: boolean
          updated_at: string
          user_id: string
          weight_change: number | null
        }
        Insert: {
          anxiety?: number | null
          brain_fog?: number | null
          cramps?: number | null
          created_at?: string
          cycle_note?: string | null
          energy_level?: number | null
          entry_date?: string
          fatigue?: number | null
          flow_intensity?: number | null
          hot_flashes?: number | null
          id?: string
          irritability?: number | null
          joint_aches?: number | null
          logged_at?: string
          mental_note?: string | null
          missed_period?: boolean
          mood?: number | null
          mood_swings?: number | null
          night_sweats?: number | null
          night_wakings?: number | null
          period_day?: boolean
          period_start?: boolean
          physical_note?: string | null
          rest_note?: string | null
          sleep_quality?: number | null
          spotting?: boolean
          updated_at?: string
          user_id: string
          weight_change?: number | null
        }
        Update: {
          anxiety?: number | null
          brain_fog?: number | null
          cramps?: number | null
          created_at?: string
          cycle_note?: string | null
          energy_level?: number | null
          entry_date?: string
          fatigue?: number | null
          flow_intensity?: number | null
          hot_flashes?: number | null
          id?: string
          irritability?: number | null
          joint_aches?: number | null
          logged_at?: string
          mental_note?: string | null
          missed_period?: boolean
          mood?: number | null
          mood_swings?: number | null
          night_sweats?: number | null
          night_wakings?: number | null
          period_day?: boolean
          period_start?: boolean
          physical_note?: string | null
          rest_note?: string | null
          sleep_quality?: number | null
          spotting?: boolean
          updated_at?: string
          user_id?: string
          weight_change?: number | null
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
      life_stage:
        | "premenopause"
        | "perimenopause"
        | "menopause"
        | "postmenopause"
        | "unsure"
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
      life_stage: [
        "premenopause",
        "perimenopause",
        "menopause",
        "postmenopause",
        "unsure",
      ],
    },
  },
} as const
