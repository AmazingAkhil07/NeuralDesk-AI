-- Phase 2: Seed data for AI Models Tracker
-- This file contains initial data for popular AI models
-- Run this after applying the migration

-- Note: Replace {user_id} with your actual user ID from auth.users table
-- You can get your user ID by running: SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- OpenAI Models
INSERT INTO public.models (name, company, model_type, model_id, context_length, is_open_source, strengths, weaknesses, description, capabilities, last_model_update, url, documentation_url, personal_rating, user_id) VALUES
('GPT-4 Turbo', 'OpenAI', 'multimodal', 'gpt-4-turbo', 128000, false, 
'Exceptional reasoning, strong at complex tasks, large context window, multimodal vision capabilities',
'Expensive, slower than GPT-3.5, can be verbose',
'OpenAI''s most capable multimodal model with vision and text understanding',
ARRAY['text', 'code', 'reasoning', 'vision', 'function-calling'],
'2024-04-09',
'https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4',
'https://platform.openai.com/docs/guides/vision',
9,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2'),

('GPT-4o', 'OpenAI', 'multimodal', 'gpt-4o', 128000, false,
'Faster than GPT-4 Turbo, excellent multimodal capabilities, strong reasoning',
'Still expensive, occasional hallucinations on edge cases',
'Optimized GPT-4 with better speed and efficiency',
ARRAY['text', 'code', 'reasoning', 'vision', 'audio'],
'2024-05-13',
'https://openai.com/index/hello-gpt-4o/',
'https://platform.openai.com/docs/models/gpt-4o',
10,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2'),

('GPT-3.5 Turbo', 'OpenAI', 'text', 'gpt-3.5-turbo', 16385, false,
'Fast, cost-effective, good for simple tasks',
'Limited reasoning compared to GPT-4, smaller context window',
'Balanced model for everyday tasks with good speed-to-quality ratio',
ARRAY['text', 'code', 'chat'],
'2023-11-06',
'https://platform.openai.com/docs/models/gpt-3-5-turbo',
'https://platform.openai.com/docs/guides/text-generation',
7,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2');

-- Anthropic Models
INSERT INTO public.models (name, company, model_type, model_id, context_length, is_open_source, strengths, weaknesses, description, capabilities, last_model_update, url, documentation_url, personal_rating, user_id) VALUES
('Claude 3.5 Sonnet', 'Anthropic', 'multimodal', 'claude-3-5-sonnet-20241022', 200000, false,
'Exceptional coding ability, strong reasoning, large context, excellent at following instructions, great for analysis',
'Can be overly cautious, slower than some competitors',
'Anthropic''s most intelligent model with superior coding and analysis capabilities',
ARRAY['text', 'code', 'reasoning', 'vision', 'analysis'],
'2024-10-22',
'https://www.anthropic.com/claude',
'https://docs.anthropic.com/en/docs/about-claude/models',
10,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2'),

('Claude 3 Opus', 'Anthropic', 'multimodal', 'claude-3-opus-20240229', 200000, false,
'Top-tier intelligence, nuanced understanding, excellent at complex tasks',
'Most expensive Claude model, slower response times',
'Anthropic''s most capable model for highly complex tasks',
ARRAY['text', 'code', 'reasoning', 'vision', 'analysis'],
'2024-02-29',
'https://www.anthropic.com/claude',
'https://docs.anthropic.com/en/docs/about-claude/models',
9,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2'),

('Claude 3 Haiku', 'Anthropic', 'multimodal', 'claude-3-haiku-20240307', 200000, false,
'Fastest Claude model, cost-effective, still intelligent',
'Less capable than Sonnet/Opus for complex reasoning',
'Fast and affordable Claude model for everyday tasks',
ARRAY['text', 'code', 'chat', 'vision'],
'2024-03-07',
'https://www.anthropic.com/claude',
'https://docs.anthropic.com/en/docs/about-claude/models',
7,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2');

-- Google Models
INSERT INTO public.models (name, company, model_type, model_id, context_length, is_open_source, strengths, weaknesses, description, capabilities, last_model_update, url, documentation_url, personal_rating, user_id) VALUES
('Gemini 2.0 Flash', 'Google', 'multimodal', 'gemini-2.0-flash-exp', 1000000, false,
'Massive 1M token context, multimodal native, fast inference, strong reasoning',
'Experimental status, potential quality variations',
'Google''s next-gen model with breakthrough context length and native multimodality',
ARRAY['text', 'code', 'vision', 'audio', 'reasoning'],
'2024-12-11',
'https://deepmind.google/technologies/gemini/',
'https://ai.google.dev/gemini-api/docs',
9,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2'),

('Gemini 1.5 Pro', 'Google', 'multimodal', 'gemini-1.5-pro', 2000000, false,
'Huge 2M token context window, excellent for long documents, strong multimodal understanding',
'Can be slow with very long contexts, hallucinations on complex reasoning',
'Google''s most capable model with record-breaking context length',
ARRAY['text', 'code', 'vision', 'audio', 'video'],
'2024-05-14',
'https://deepmind.google/technologies/gemini/',
'https://ai.google.dev/gemini-api/docs',
8,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2'),

('Gemini 1.5 Flash', 'Google', 'multimodal', 'gemini-1.5-flash', 1000000, false,
'Fast, cost-effective, large context, good multimodal performance',
'Less capable than Pro for complex reasoning',
'Faster version of Gemini 1.5 optimized for speed',
ARRAY['text', 'code', 'vision', 'audio'],
'2024-05-14',
'https://deepmind.google/technologies/gemini/',
'https://ai.google.dev/gemini-api/docs',
7,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2');

-- Meta Models (Open Source)
INSERT INTO public.models (name, company, model_type, model_id, context_length, is_open_source, strengths, weaknesses, description, capabilities, last_model_update, url, documentation_url, personal_rating, user_id) VALUES
('Llama 3.3 70B', 'Meta', 'text', 'llama-3.3-70b', 128000, true,
'Strong open-source alternative, good reasoning, large context, can run locally',
'Requires significant hardware for inference, not as capable as frontier closed models',
'Meta''s latest open-source model with impressive capabilities',
ARRAY['text', 'code', 'reasoning'],
'2024-12-06',
'https://www.llama.com/',
'https://github.com/meta-llama/llama3',
8,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2'),

('Llama 3.1 405B', 'Meta', 'text', 'llama-3.1-405b', 128000, true,
'Largest open model, competitive with closed models, excellent for research',
'Extremely resource-intensive, requires distributed inference',
'Meta''s largest and most capable open-source model',
ARRAY['text', 'code', 'reasoning', 'multilingual'],
'2024-07-23',
'https://www.llama.com/',
'https://github.com/meta-llama/llama3',
9,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2'),

('Llama 3.2 Vision', 'Meta', 'multimodal', 'llama-3.2-vision', 128000, true,
'Open-source multimodal, lightweight, can run on edge devices',
'Vision capabilities still developing, less accurate than GPT-4V',
'Meta''s first open-source multimodal model with vision',
ARRAY['text', 'vision', 'code'],
'2024-09-25',
'https://www.llama.com/',
'https://github.com/meta-llama/llama3',
7,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2');

-- Mistral AI Models
INSERT INTO public.models (name, company, model_type, model_id, context_length, is_open_source, strengths, weaknesses, description, capabilities, last_model_update, url, documentation_url, personal_rating, user_id) VALUES
('Mistral Large 2', 'Mistral AI', 'text', 'mistral-large-2', 128000, false,
'Strong multilingual capabilities, excellent code generation, cost-effective',
'Less known than OpenAI/Anthropic, smaller context than competitors',
'Mistral''s most capable model with strong European language support',
ARRAY['text', 'code', 'reasoning', 'multilingual'],
'2024-07-24',
'https://mistral.ai/',
'https://docs.mistral.ai/',
8,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2'),

('Mistral Nemo', 'Mistral AI', 'text', 'mistral-nemo', 128000, true,
'Open-source, efficient, good for local deployment, multilingual',
'Smaller capacity than flagship models',
'Open-source model optimized for efficiency and local deployment',
ARRAY['text', 'code', 'multilingual'],
'2024-07-18',
'https://mistral.ai/',
'https://docs.mistral.ai/',
7,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2');

-- DeepSeek Models
INSERT INTO public.models (name, company, model_type, model_id, context_length, is_open_source, strengths, weaknesses, description, capabilities, last_model_update, url, documentation_url, personal_rating, user_id) VALUES
('DeepSeek-V2.5', 'DeepSeek', 'text', 'deepseek-v2.5', 128000, true,
'Excellent code generation, cost-effective, strong reasoning, open-source',
'Less general knowledge than GPT-4, Chinese company concerns for some users',
'Chinese open-source model with exceptional coding capabilities',
ARRAY['text', 'code', 'reasoning', 'math'],
'2024-09-05',
'https://www.deepseek.com/',
'https://github.com/deepseek-ai/DeepSeek-V2',
8,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2');

-- Cohere Models
INSERT INTO public.models (name, company, model_type, model_id, context_length, is_open_source, strengths, weaknesses, description, capabilities, last_model_update, url, documentation_url, personal_rating, user_id) VALUES
('Command R+', 'Cohere', 'text', 'command-r-plus', 128000, false,
'Excellent at retrieval-augmented generation (RAG), strong multilingual, good for enterprise',
'Less general capability than GPT-4, focused on specific use cases',
'Cohere''s flagship model optimized for RAG and enterprise applications',
ARRAY['text', 'rag', 'multilingual', 'reasoning'],
'2024-04-04',
'https://cohere.com/',
'https://docs.cohere.com/',
7,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2');

-- xAI Models
INSERT INTO public.models (name, company, model_type, model_id, context_length, is_open_source, strengths, weaknesses, description, capabilities, last_model_update, url, documentation_url, personal_rating, user_id) VALUES
('Grok-2', 'xAI', 'text', 'grok-2', 128000, false,
'Real-time information access, conversational, humorous personality',
'Limited availability, less tested than established models',
'Elon Musk''s xAI model with real-time information access',
ARRAY['text', 'reasoning', 'real-time-data'],
'2024-08-13',
'https://x.ai/',
'https://docs.x.ai/',
6,
'8aafc180-28b6-4bd8-9d10-7e0813b687d2');

-- Instructions for use:
-- 1. Find your user_id: SELECT id FROM auth.users WHERE email = 'your-email@example.com';
-- 2. Replace all instances of {user_id} with your actual UUID
-- 3. Run this file in the Supabase SQL editor or via psql
--
-- Alternative: Use the "Add Model" button in the NeuralDesk UI to add models manually
