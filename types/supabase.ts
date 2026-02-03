export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      news: {
        Row: {
          id: string
          user_id: string
          title: string
          url: string
          source: string
          summary: string | null
          tags: string[]
          published_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          url: string
          source: string
          summary?: string | null
          tags?: string[]
          published_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          url?: string
          source?: string
          summary?: string | null
          tags?: string[]
          published_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      models: {
        Row: {
          id: string
          user_id: string
          name: string
          company: string
          model_type: string
          model_id: string | null
          context_length: number | null
          is_open_source: boolean
          strengths: string | null
          weaknesses: string | null
          description: string | null
          capabilities: string[] | null
          pricing: Json | null
          last_model_update: string | null
          url: string | null
          documentation_url: string | null
          personal_rating: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          company: string
          model_type: string
          model_id?: string | null
          context_length?: number | null
          is_open_source?: boolean
          strengths?: string | null
          weaknesses?: string | null
          description?: string | null
          capabilities?: string[] | null
          pricing?: Json | null
          last_model_update?: string | null
          url?: string | null
          documentation_url?: string | null
          personal_rating?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          company?: string
          model_type?: string
          model_id?: string | null
          context_length?: number | null
          is_open_source?: boolean
          strengths?: string | null
          weaknesses?: string | null
          description?: string | null
          capabilities?: string[] | null
          pricing?: Json | null
          last_model_update?: string | null
          url?: string | null
          documentation_url?: string | null
          personal_rating?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tools: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          url: string | null
          description: string | null
          status: string
          pricing_model: string | null
          pricing_details: Json | null
          features: string[] | null
          pros: string[] | null
          cons: string[] | null
          is_favorite: boolean
          rating: number | null
          notes: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          url?: string | null
          description?: string | null
          status?: string
          pricing_model?: string | null
          pricing_details?: Json | null
          features?: string[] | null
          pros?: string[] | null
          cons?: string[] | null
          is_favorite?: boolean
          rating?: number | null
          notes?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          url?: string | null
          description?: string | null
          status?: string
          pricing_model?: string | null
          pricing_details?: Json | null
          features?: string[] | null
          pros?: string[] | null
          cons?: string[] | null
          is_favorite?: boolean
          rating?: number | null
          notes?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          user_id: string
          name: string
          one_liner: string
          problem: string
          target_user: string
          solution: string
          why_ai: string
          score: number | null
          recommendation: string | null
          brutal_summary: string | null
          analysis_json: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          one_liner: string
          problem: string
          target_user: string
          solution: string
          why_ai: string
          score?: number | null
          recommendation?: string | null
          brutal_summary?: string | null
          analysis_json?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          one_liner?: string
          problem?: string
          target_user?: string
          solution?: string
          why_ai?: string
          score?: number | null
          recommendation?: string | null
          brutal_summary?: string | null
          analysis_json?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      vault_items: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          item_type: string
          tags: string[]
          embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          item_type: string
          tags?: string[]
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          item_type?: string
          tags?: string[]
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          item_id: string
          item_type: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          item_type: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          item_type?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
