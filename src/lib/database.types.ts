export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          event_id: string
          id: string
          present: boolean
          recruit_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          event_id: string
          id?: string
          present?: boolean
          recruit_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          event_id?: string
          id?: string
          present?: boolean
          recruit_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          chef_id: string | null
          created_at: string
          created_by: string | null
          event_date: string
          event_time: string
          id: string
          title: string
        }
        Insert: {
          chef_id?: string | null
          created_at?: string
          created_by?: string | null
          event_date: string
          event_time: string
          id?: string
          title: string
        }
        Update: {
          chef_id?: string | null
          created_at?: string
          created_by?: string | null
          event_date?: string
          event_time?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          bemerkungen: string | null
          created_at: string
          evaluator_id: string
          event_id: string
          id: string
          recruit_id: string
          score: number | null
          updated_at: string
        }
        Insert: {
          bemerkungen?: string | null
          created_at?: string
          evaluator_id: string
          event_id: string
          id?: string
          recruit_id: string
          score?: number | null
          updated_at?: string
        }
        Update: {
          bemerkungen?: string | null
          created_at?: string
          evaluator_id?: string
          event_id?: string
          id?: string
          recruit_id?: string
          score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      sidequests: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          done: boolean
          due_date: string
          due_time: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          done?: boolean
          due_date: string
          due_time: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          done?: boolean
          due_date?: string
          due_time?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      recruits: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          language: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          language: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          language?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]
