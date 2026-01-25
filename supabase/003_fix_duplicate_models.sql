-- Fix duplicate models migration
-- This migration adds unique constraints and removes existing duplicates

-- Step 1: Remove duplicate models, keeping only the most recent one for each company+name combination
DELETE FROM public.models
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, company, name) id
  FROM public.models
  ORDER BY user_id, company, name, created_at DESC
);

-- Step 2: Add unique constraint to prevent future duplicates
-- This ensures each user can only have one model with a specific company+name combination
ALTER TABLE public.models
ADD CONSTRAINT unique_user_model UNIQUE (user_id, company, name);

-- Step 3: Create an index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_models_user_company_name 
ON public.models(user_id, company, name);

-- Step 4: Add updated_at trigger to track when models are modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_models_updated_at ON public.models;

CREATE TRIGGER update_models_updated_at
    BEFORE UPDATE ON public.models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
