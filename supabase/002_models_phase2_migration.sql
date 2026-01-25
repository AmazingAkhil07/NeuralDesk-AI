-- Phase 2: Models Tracker Schema Update
-- This migration updates the models table to match PRD requirements

-- Drop the existing models table and recreate with updated schema
DROP TABLE IF EXISTS public.models CASCADE;

-- AI Models (Phase 2: Models Tracker)
CREATE TABLE public.models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL, -- 'OpenAI', 'Anthropic', 'Google', 'Meta', etc.
  model_type TEXT NOT NULL, -- 'text', 'multimodal', 'video', 'audio', 'image'
  model_id TEXT, -- e.g., 'gpt-4-turbo', 'claude-3-opus'
  context_length INTEGER, -- Context window size
  is_open_source BOOLEAN DEFAULT FALSE,
  strengths TEXT, -- What the model excels at
  weaknesses TEXT, -- Known limitations
  description TEXT, -- Brief description
  capabilities TEXT[], -- 'text', 'image', 'code', 'audio', etc.
  pricing JSONB, -- {input: 0.01, output: 0.03}
  last_model_update DATE, -- Last update to the actual model
  url TEXT,
  documentation_url TEXT,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 10), -- 1-10 rating
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_models_user_id ON public.models(user_id);
CREATE INDEX idx_models_company ON public.models(company);
CREATE INDEX idx_models_type ON public.models(model_type);

-- Enable Row Level Security
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own models" ON public.models
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own models" ON public.models
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own models" ON public.models
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own models" ON public.models
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON public.models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
