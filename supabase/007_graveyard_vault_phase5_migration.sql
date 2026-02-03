-- Phase 5: Idea Graveyard & Knowledge Vault Migration
-- Adds support for archiving failed ideas and bookmarking content

-- Idea Graveyard Table: Archive failed/killed ideas with learnings
CREATE TABLE IF NOT EXISTS public.idea_graveyard (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  idea_id UUID REFERENCES public.ideas ON DELETE SET NULL,
  
  -- Preserved idea data
  idea_name TEXT NOT NULL,
  idea_one_liner TEXT,
  idea_problem TEXT,
  idea_solution TEXT,
  idea_target_user TEXT,
  
  -- Evaluation results at time of kill
  final_score INTEGER,
  recommendation TEXT,
  brutal_summary TEXT,
  
  -- Learning & reflection
  why_failed TEXT, -- Why the idea didn't work or was killed
  lessons_learned TEXT, -- Key takeaways and insights
  future_pivots TEXT, -- Potential direction if revisited
  learnings_tags TEXT[] DEFAULT '{}', -- Tags like 'market-gap', 'timing', 'differentiation'
  
  -- Metadata
  killed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_idea_graveyard_user_id ON public.idea_graveyard(user_id);
CREATE INDEX idx_idea_graveyard_killed_at ON public.idea_graveyard(killed_at DESC);
CREATE INDEX idx_idea_graveyard_tags ON public.idea_graveyard USING GIN(learnings_tags);

-- Enable RLS for idea_graveyard
ALTER TABLE public.idea_graveyard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own graveyard"
  ON public.idea_graveyard FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own graveyard entries"
  ON public.idea_graveyard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own graveyard entries"
  ON public.idea_graveyard FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own graveyard entries"
  ON public.idea_graveyard FOR DELETE
  USING (auth.uid() = user_id);

-- Knowledge Vault Table: Bookmarks, notes, and saved content
CREATE TABLE IF NOT EXISTS public.vault (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Content metadata
  title TEXT NOT NULL,
  url TEXT,
  content_excerpt TEXT, -- Short excerpt or preview
  full_content TEXT, -- Optional full saved content
  
  -- Classification
  source_type TEXT NOT NULL, -- 'news', 'model', 'tool', 'idea', 'external', 'research'
  source_id UUID, -- Reference to original item (news.id, model.id, etc.)
  
  -- Personal annotations
  personal_notes TEXT, -- User's own notes and thoughts
  tags TEXT[] DEFAULT '{}', -- Custom tags for organization
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)), -- Quick 5-star rating
  
  -- Metadata for semantic search (future enhancement)
  embedding_id TEXT, -- Reference to vector embedding (if implemented)
  is_archived BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_vault_user_id ON public.vault(user_id);
CREATE INDEX idx_vault_source ON public.vault(source_type, source_id);
CREATE INDEX idx_vault_tags ON public.vault USING GIN(tags);
CREATE INDEX idx_vault_created_at ON public.vault(created_at DESC);
CREATE INDEX idx_vault_is_archived ON public.vault(is_archived);

-- Enable RLS for vault
ALTER TABLE public.vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vault"
  ON public.vault FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vault items"
  ON public.vault FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault items"
  ON public.vault FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault items"
  ON public.vault FOR DELETE
  USING (auth.uid() = user_id);

-- Vault Tags Table: Predefined and custom tags for organization
CREATE TABLE IF NOT EXISTS public.vault_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  tag_name TEXT NOT NULL,
  tag_color TEXT DEFAULT 'blue', -- For UI: blue, purple, green, yellow, red, pink, orange, etc.
  tag_description TEXT,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  
  UNIQUE(user_id, tag_name)
);

CREATE INDEX idx_vault_tags_user_id ON public.vault_tags(user_id);

-- Enable RLS for vault_tags
ALTER TABLE public.vault_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vault tags"
  ON public.vault_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vault tags"
  ON public.vault_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault tags"
  ON public.vault_tags FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault tags"
  ON public.vault_tags FOR DELETE
  USING (auth.uid() = user_id);
