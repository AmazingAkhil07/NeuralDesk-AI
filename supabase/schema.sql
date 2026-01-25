-- NeuralDesk Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- AI News & Updates (Phase 1)
CREATE TABLE public.news (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  source TEXT NOT NULL,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

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

-- AI Tools
CREATE TABLE public.tools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'development', 'design', 'productivity', 'research', etc.
  url TEXT,
  logo_url TEXT,
  pricing_model TEXT, -- 'free', 'freemium', 'paid', 'subscription'
  pricing_details JSONB,
  features TEXT[],
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- AI Ideas Hub
CREATE TABLE public.ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'product', 'feature', 'research', 'experiment'
  status TEXT DEFAULT 'idea', -- 'idea', 'researching', 'developing', 'completed', 'archived'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  tags TEXT[],
  related_models UUID[], -- References to models table
  related_tools UUID[], -- References to tools table
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- AI Vault (Prompts & Templates)
CREATE TABLE public.vault_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL, -- 'prompt', 'template', 'snippet', 'guide'
  category TEXT, -- 'coding', 'writing', 'analysis', 'creative', etc.
  tags TEXT[],
  model_compatibility TEXT[], -- Which models work well with this
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Comments (for news, ideas, etc.)
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'news', 'idea', 'model', 'tool', 'vault_item'
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_news_user_id ON public.news(user_id);
CREATE INDEX idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX idx_news_tags ON public.news USING GIN(tags);
CREATE INDEX idx_models_user_id ON public.models(user_id);
CREATE INDEX idx_models_company ON public.models(company);
CREATE INDEX idx_models_type ON public.models(model_type);
CREATE INDEX idx_tools_user_id ON public.tools(user_id);
CREATE INDEX idx_tools_category ON public.tools(category);
CREATE INDEX idx_ideas_user_id ON public.ideas(user_id);
CREATE INDEX idx_ideas_status ON public.ideas(status);
CREATE INDEX idx_vault_items_user_id ON public.vault_items(user_id);
CREATE INDEX idx_vault_items_type ON public.vault_items(type);
CREATE INDEX idx_comments_entity ON public.comments(entity_type, entity_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- News policies
CREATE POLICY "Users can view their own news" ON public.news
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own news" ON public.news
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own news" ON public.news
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own news" ON public.news
  FOR DELETE USING (auth.uid() = user_id);

-- Models policies
CREATE POLICY "Users can view their own models" ON public.models
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own models" ON public.models
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own models" ON public.models
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own models" ON public.models
  FOR DELETE USING (auth.uid() = user_id);

-- Tools policies
CREATE POLICY "Users can view their own tools" ON public.tools
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tools" ON public.tools
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tools" ON public.tools
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tools" ON public.tools
  FOR DELETE USING (auth.uid() = user_id);

-- Ideas policies
CREATE POLICY "Users can view their own ideas" ON public.ideas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ideas" ON public.ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ideas" ON public.ideas
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ideas" ON public.ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Vault items policies
CREATE POLICY "Users can view their own vault items" ON public.vault_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vault items" ON public.vault_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vault items" ON public.vault_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vault items" ON public.vault_items
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view their own comments" ON public.comments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON public.models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON public.ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vault_items_updated_at BEFORE UPDATE ON public.vault_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
