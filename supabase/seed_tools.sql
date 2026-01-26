-- Seed data for AI Tools Radar (50+ Tools)
-- Sync profiles first to ensure we have user IDs to link to
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tools (name, description, category, url, pricing_model, rating, status, user_id, logo_url)
SELECT name, description, category, url, pricing_model, rating, status, id as user_id, logo_url
FROM (
  -- Coding & Dev
  SELECT 'Cursor' as name, 'The AI-first code editor. Built on VS Code, optimized for pair-programming.' as description, 'Coding & Dev' as category, 'https://cursor.com' as url, 'freemium' as pricing_model, 10 as rating, 'Active' as status, 'https://cursor.com/favicon.ico' as logo_url
  UNION ALL SELECT 'Windsurf', 'A new agentic IDE by Codeium that understands your entire codebase.', 'Coding & Dev', 'https://codeium.com/windsurf', 'freemium', 9, 'Testing', 'https://codeium.com/favicon.ico'
  UNION ALL SELECT 'GitHub Copilot', 'The O.G. AI coding assistant. Still powerful, integrated everywhere.', 'Coding & Dev', 'https://github.com/features/copilot', 'paid', 8, 'Active', 'https://github.githubassets.com/favicons/favicon.svg'
  UNION ALL SELECT 'v0.dev', 'Generative UI by Vercel. Turn text into accessible React components.', 'Coding & Dev', 'https://v0.dev', 'freemium', 9, 'Active', 'https://v0.dev/favicon.ico'
  UNION ALL SELECT 'Replit Agent', 'Build and deploy full applications just by describing them.', 'Coding & Dev', 'https://replit.com', 'subscription', 8, 'Testing', 'https://replit.com/favicon.ico'
  UNION ALL SELECT 'Claude Dev', 'Open-source autonomous agent that lives in your VS Code.', 'Coding & Dev', 'https://github.com/saoudrizwan/claude-dev', 'free', 9, 'Active', 'https://github.com/favicon.ico'
  UNION ALL SELECT 'Burt', 'AI-powered terminal and developer workspace.', 'Coding & Dev', 'https://burt.ai', 'freemium', 7, 'Testing', 'https://burt.ai/favicon.ico'
  
  -- Image Generation
  UNION ALL SELECT 'Midjourney', 'Highest quality image generation. Now with a web UI.', 'Image Generation', 'https://midjourney.com', 'paid', 10, 'Active', 'https://midjourney.com/favicon.ico'
  UNION ALL SELECT 'DALL-E 3', 'Great prompt adherence, built into ChatGPT.', 'Image Generation', 'https://openai.com/dall-e-3', 'paid', 8, 'Active', 'https://openai.com/favicon.ico'
  UNION ALL SELECT 'Leonardo.ai', 'Powerful web-based image generation suite with fine-tuning.', 'Image Generation', 'https://leonardo.ai', 'freemium', 9, 'Active', 'https://leonardo.ai/favicon.ico'
  UNION ALL SELECT 'Flux.1', 'The new king of open weights image generation.', 'Image Generation', 'https://blackforestlabs.ai', 'free', 10, 'Testing', 'https://blackforestlabs.ai/favicon.ico'
  UNION ALL SELECT 'Recraft.ai', 'Vector and raster generation for designers.', 'Image Generation', 'https://recraft.ai', 'freemium', 9, 'Active', 'https://recraft.ai/favicon.ico'
  UNION ALL SELECT 'Krea.ai', 'Real-time image enhancement and generation.', 'Image Generation', 'https://krea.ai', 'freemium', 8, 'Active', 'https://krea.ai/favicon.ico'
  
  -- Video Generation
  UNION ALL SELECT 'Luma Dream Machine', 'Highly realistic video generation from text and images.', 'Video Generation', 'https://lumalabs.ai/dream-machine', 'freemium', 9, 'Active', 'https://lumalabs.ai/favicon.ico'
  UNION ALL SELECT 'Runway Gen-3 Alpha', 'The industry standard for professional AI video.', 'Video Generation', 'https://runwayml.com', 'subscription', 9, 'Active', 'https://runwayml.com/favicon.ico'
  UNION ALL SELECT 'Kling AI', 'Next-gen video generation with impressive physics.', 'Video Generation', 'https://klingai.com', 'freemium', 9, 'Testing', 'https://klingai.com/favicon.ico'
  UNION ALL SELECT 'HeyGen', 'AI avatars for business and marketing videos.', 'Video Generation', 'https://heygen.com', 'subscription', 8, 'Active', 'https://heygen.com/favicon.ico'
  UNION ALL SELECT 'Sora', 'OpenAI''s highly anticipated video model.', 'Video Generation', 'https://openai.com/sora', 'paid', 10, 'Testing', 'https://openai.com/favicon.ico'
  
  -- Audio & Music
  UNION ALL SELECT 'Suno', 'Generate full songs with lyrics and vocals.', 'Audio & Music', 'https://suno.com', 'freemium', 10, 'Active', 'https://suno.com/favicon.ico'
  UNION ALL SELECT 'Udio', 'Professional grade music generation.', 'Audio & Music', 'https://udio.com', 'freemium', 9, 'Active', 'https://udio.com/favicon.ico'
  UNION ALL SELECT 'ElevenLabs', 'The best AI text-to-speech and voice cloning.', 'Audio & Music', 'https://elevenlabs.io', 'freemium', 10, 'Active', 'https://elevenlabs.io/favicon.ico'
  UNION ALL SELECT 'Audiobox', 'Meta''s research model for audio generation.', 'Audio & Music', 'https://audiobox.metademolab.com', 'free', 7, 'Testing', 'https://metademolab.com/favicon.ico'
  
  -- Writing & Research
  UNION ALL SELECT 'Perplexity', 'The search engine of the future. Answer-first.', 'Writing & Research', 'https://perplexity.ai', 'freemium', 10, 'Active', 'https://perplexity.ai/favicon.ico'
  UNION ALL SELECT 'Lex', 'AI-powered word processor for writers.', 'Writing & Research', 'https://lex.page', 'subscription', 8, 'Active', 'https://lex.page/favicon.ico'
  UNION ALL SELECT 'NotebookLM', 'Google''s personal research assistant based on your documents.', 'Writing & Research', 'https://notebooklm.google.com', 'free', 10, 'Active', 'https://www.gstatic.com/lamda/images/favicon_v2_f805f63683f12440fb22b.png'
  UNION ALL SELECT 'Jasper', 'Brand-aware AI content platform for teams.', 'Writing & Research', 'https://jasper.ai', 'paid', 7, 'Replaced', 'https://jasper.ai/favicon.ico'
  UNION ALL SELECT 'Copy.ai', 'Workflows and content generation for go-to-market teams.', 'Writing & Research', 'https://copy.ai', 'freemium', 7, 'Active', 'https://copy.ai/favicon.ico'
  
  -- Creative/Vibe
  UNION ALL SELECT 'Gamma', 'Beautiful presentations generated from a prompt.', 'Creative/Vibe', 'https://gamma.app', 'freemium', 9, 'Active', 'https://gamma.app/favicon.ico'
  UNION ALL SELECT 'Canva Magic Studio', 'AI design tools integrated into the Canva ecosystem.', 'Creative/Vibe', 'https://canva.com', 'freemium', 8, 'Active', 'https://canva.com/favicon.ico'
  UNION ALL SELECT 'Spline AI', 'Generate 3D objects and scenes with text.', 'Creative/Vibe', 'https://spline.design', 'freemium', 8, 'Testing', 'https://spline.design/favicon.ico'
  UNION ALL SELECT 'Rosebud AI', 'AI powered world building and avatars for games.', 'Creative/Vibe', 'https://rosebud.ai', 'freemium', 7, 'Testing', 'https://rosebud.ai/favicon.ico'
  
  -- Experimental/Agents
  UNION ALL SELECT 'AutoGPT', 'One of the first autonomous agent experiments.', 'Experimental/Agents', 'https://github.com/Significant-Gravitas/AutoGPT', 'free', 6, 'Replaced', 'https://github.com/favicon.ico'
  UNION ALL SELECT 'HuggingFace Agents', 'Open source agents that can use tools.', 'Experimental/Agents', 'https://huggingface.co', 'free', 8, 'Testing', 'https://huggingface.co/favicon.ico'
  UNION ALL SELECT 'Devin', 'The first AI software engineer.', 'Experimental/Agents', 'https://cognition-labs.com', 'paid', 9, 'Testing', 'https://cognition.ai/favicon.ico'
  UNION ALL SELECT 'MultiOn', 'Automate anything on the web using an agent.', 'Experimental/Agents', 'https://multion.ai', 'freemium', 8, 'Active', 'https://multion.ai/favicon.ico'
  UNION ALL SELECT 'Operator', 'OpenAI''s browser agent for task automation.', 'Experimental/Agents', 'https://openai.com', 'paid', 9, 'Testing', 'https://openai.com/favicon.ico'

) t
CROSS JOIN (SELECT id FROM public.profiles) u;
