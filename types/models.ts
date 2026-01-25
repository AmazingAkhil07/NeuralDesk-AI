// TypeScript types for AI Models (Phase 2: Models Tracker)

export type ModelType = 'text' | 'multimodal' | 'video' | 'audio' | 'image';

export interface Model {
  id: string;
  user_id: string;
  name: string;
  company: string;
  model_type: ModelType;
  model_id?: string | null;
  context_length?: number | null;
  is_open_source: boolean;
  strengths?: string | null;
  weaknesses?: string | null;
  description?: string | null;
  capabilities?: string[] | null;
  pricing?: {
    input?: number;
    output?: number;
    currency?: string;
  } | null;
  last_model_update?: string | null; // ISO date string
  url?: string | null;
  documentation_url?: string | null;
  personal_rating?: number | null; // 1-10
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateModelInput {
  name: string;
  company: string;
  model_type: ModelType;
  model_id?: string;
  context_length?: number;
  is_open_source: boolean;
  strengths?: string;
  weaknesses?: string;
  description?: string;
  capabilities?: string[];
  pricing?: {
    input?: number;
    output?: number;
    currency?: string;
  };
  last_model_update?: string;
  url?: string;
  documentation_url?: string;
  personal_rating?: number;
  notes?: string;
}

export interface UpdateModelInput extends Partial<CreateModelInput> {
  id: string;
}

export interface ModelsFilters {
  search?: string;
  company?: string;
  model_type?: ModelType;
  is_open_source?: boolean;
  min_rating?: number;
}
