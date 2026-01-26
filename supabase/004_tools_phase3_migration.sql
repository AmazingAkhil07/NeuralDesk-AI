-- Migration: Phase 3 Tools Radar Updates
-- Adds status, replacement tracking, and updates rating scale to 1-10

ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Testing',
ADD COLUMN IF NOT EXISTS replaced_by_id UUID REFERENCES public.tools(id) ON DELETE SET NULL;

-- Update the rating constraint to be 1-10 instead of 1-5
ALTER TABLE public.tools DROP CONSTRAINT IF EXISTS tools_rating_check;
ALTER TABLE public.tools ADD CONSTRAINT tools_rating_check CHECK (rating >= 1 AND rating <= 10);

-- Add comment explaining the status values
COMMENT ON COLUMN public.tools.status IS 'Status of the tool: Active, Replaced, Testing';
