-- Migration: Add extra info to tools (pros and cons)
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS pros TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cons TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.tools.pros IS 'Advantages or strengths of the tool';
COMMENT ON COLUMN public.tools.cons IS 'Disadvantages or weaknesses of the tool';
