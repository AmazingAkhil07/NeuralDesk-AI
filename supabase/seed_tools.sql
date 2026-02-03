-- Seed data for AI Tools Radar (50+ Tools)
-- IMPORTANT: This seed depends on public.profiles having at least one row.
-- Profiles are synced from auth.users first, and tools are inserted with ON CONFLICT to ensure idempotency.

-- Step 1: Sync profiles from auth.users (ensure we have user IDs to link to)
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Step 2: Truncate tools to ensure idempotency (optional - uncomment to wipe existing tools on each seed)
-- TRUNCATE public.tools RESTART IDENTITY CASCADE;

-- Step 3: Insert tools with ON CONFLICT for upsert behavior
-- This CROSS JOIN ensures each tool row is paired with each profile.
-- If no profiles exist after step 1, this insert will produce zero rows and tools table remains empty.
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
  
  -- Code Review & Analysis
  UNION ALL SELECT 'CodeRabbit', 'AI code reviews directly in your pull requests.', 'Coding & Dev', 'https://coderabbit.ai', 'paid', 9, 'Active', 'https://coderabbit.ai/favicon.ico'
  UNION ALL SELECT 'Swimm', 'AI documentation that lives with your code.', 'Coding & Dev', 'https://swimm.io', 'freemium', 8, 'Active', 'https://swimm.io/favicon.ico'
  UNION ALL SELECT 'SolidCode', 'AI-powered code quality and security scanning.', 'Coding & Dev', 'https://solidcode.ai', 'freemium', 8, 'Testing', 'https://solidcode.ai/favicon.ico'
  UNION ALL SELECT 'Tabnine', 'AI code completions for any language.', 'Coding & Dev', 'https://tabnine.com', 'freemium', 8, 'Active', 'https://tabnine.com/favicon.ico'
  UNION ALL SELECT 'Continue', 'Open source copilot that lives in your IDE.', 'Coding & Dev', 'https://continue.dev', 'free', 9, 'Active', 'https://continue.dev/favicon.ico'
  
  -- Design & UI
  UNION ALL SELECT 'Figma AI', 'Design copilot powered by AI inside Figma.', 'Creative/Vibe', 'https://figma.com', 'freemium', 9, 'Active', 'https://figma.com/favicon.ico'
  UNION ALL SELECT 'Galileo AI', 'Generate UI designs from text descriptions instantly.', 'Creative/Vibe', 'https://www.galileo.ai', 'freemium', 9, 'Active', 'https://www.galileo.ai/favicon.ico'
  UNION ALL SELECT 'Relume', 'AI website builder with design system.', 'Creative/Vibe', 'https://relume.io', 'freemium', 9, 'Active', 'https://relume.io/favicon.ico'
  
  -- Data & Analytics
  UNION ALL SELECT 'ChatWithData', 'Ask questions about your data with natural language.', 'Writing & Research', 'https://chatwithdataio.com', 'freemium', 8, 'Testing', 'https://chatwithdataio.com/favicon.ico'
  UNION ALL SELECT 'Mindomo', 'AI-powered mind mapping and concept visualization.', 'Writing & Research', 'https://mindomo.com', 'freemium', 7, 'Active', 'https://mindomo.com/favicon.ico'
  UNION ALL SELECT 'Synthesia', 'Create AI video presenters from text scripts.', 'Video Generation', 'https://synthesia.io', 'paid', 8, 'Active', 'https://synthesia.io/favicon.ico'
  UNION ALL SELECT 'D-ID', 'Create personalized videos with digital humans.', 'Video Generation', 'https://www.d-id.com', 'freemium', 8, 'Active', 'https://www.d-id.com/favicon.ico'
  
  -- Productivity & Workflow
  UNION ALL SELECT 'Zapier AI', 'Build AI-powered automations without code.', 'Experimental/Agents', 'https://zapier.com', 'freemium', 8, 'Active', 'https://zapier.com/favicon.ico'
  UNION ALL SELECT 'Make.com AI', 'Visual automation platform with AI capabilities.', 'Experimental/Agents', 'https://make.com', 'freemium', 8, 'Active', 'https://make.com/favicon.ico'
  UNION ALL SELECT 'n8n', 'Open-source workflow automation with AI nodes.', 'Experimental/Agents', 'https://n8n.io', 'freemium', 9, 'Active', 'https://n8n.io/favicon.ico'
  UNION ALL SELECT 'Retool', 'Build internal tools fast with AI assist.', 'Coding & Dev', 'https://retool.com', 'freemium', 8, 'Active', 'https://retool.com/favicon.ico'
  
  -- Marketing & Content
  UNION ALL SELECT 'Brandmark', 'AI logo and branding design generator.', 'Creative/Vibe', 'https://brandmark.io', 'paid', 8, 'Active', 'https://brandmark.io/favicon.ico'
  UNION ALL SELECT 'MunchEye', 'Viral marketing content analyzer powered by AI.', 'Writing & Research', 'https://muncheye.com', 'freemium', 7, 'Active', 'https://muncheye.com/favicon.ico'
  UNION ALL SELECT 'Opus Clip', 'Auto-generate viral short clips from long videos.', 'Video Generation', 'https://www.opus.pro', 'freemium', 9, 'Active', 'https://www.opus.pro/favicon.ico'
  UNION ALL SELECT 'Adobe Firefly', 'Generative AI powered by Adobe inside Creative Suite.', 'Image Generation', 'https://www.adobe.com/firefly', 'freemium', 9, 'Active', 'https://www.adobe.com/favicon.ico'
  
  -- Research & Knowledge
  UNION ALL SELECT 'Elicit', 'AI research assistant for systematic literature review.', 'Writing & Research', 'https://elicit.org', 'freemium', 9, 'Active', 'https://elicit.org/favicon.ico'
  UNION ALL SELECT 'ResearchRabbit', 'AI-powered academic paper discovery and organization.', 'Writing & Research', 'https://researchrabbitapp.com', 'freemium', 9, 'Active', 'https://researchrabbitapp.com/favicon.ico'
  UNION ALL SELECT 'Consensus', 'Find evidence-based insights from research papers.', 'Writing & Research', 'https://consensus.app', 'freemium', 8, 'Active', 'https://consensus.app/favicon.ico'
  UNION ALL SELECT 'Semantic Scholar', 'AI-powered research paper search and discovery.', 'Writing & Research', 'https://semanticscholar.org', 'free', 8, 'Active', 'https://semanticscholar.org/favicon.ico'
  
  -- Voice & Conversation
  UNION ALL SELECT 'Descript', 'AI-powered podcast and video editing with transcription.', 'Audio & Music', 'https://descript.com', 'freemium', 9, 'Active', 'https://descript.com/favicon.ico'
  UNION ALL SELECT 'Podium', 'Automated podcast guest screening and booking.', 'Audio & Music', 'https://podium.co', 'paid', 7, 'Testing', 'https://podium.co/favicon.ico'
  UNION ALL SELECT 'AssemblyAI', 'Best-in-class speech-to-text and understanding API.', 'Audio & Music', 'https://assemblyai.com', 'paid', 10, 'Active', 'https://assemblyai.com/favicon.ico'
  UNION ALL SELECT 'Fireflies.ai', 'AI meeting transcription and note-taking.', 'Audio & Music', 'https://fireflies.ai', 'freemium', 9, 'Active', 'https://fireflies.ai/favicon.ico'
  UNION ALL SELECT 'Riverside.fm', 'AI-powered podcast and video interview platform.', 'Audio & Music', 'https://riverside.fm', 'paid', 9, 'Active', 'https://riverside.fm/favicon.ico'
  
  -- Security & Compliance
  UNION ALL SELECT 'GitGuardian', 'AI-powered secrets detection in code repositories.', 'Coding & Dev', 'https://www.gitguardian.com', 'freemium', 9, 'Active', 'https://www.gitguardian.com/favicon.ico'
  UNION ALL SELECT 'Snyk', 'AI vulnerability scanner for open-source dependencies.', 'Coding & Dev', 'https://snyk.io', 'freemium', 9, 'Active', 'https://snyk.io/favicon.ico'
  
  -- SEO & Analytics
  UNION ALL SELECT 'Surfer SEO', 'AI content optimization for SEO.', 'Writing & Research', 'https://surferseo.com', 'paid', 8, 'Active', 'https://surferseo.com/favicon.ico'
  UNION ALL SELECT 'Clearscope', 'AI-powered content optimization for search.', 'Writing & Research', 'https://www.clearscope.io', 'paid', 8, 'Active', 'https://www.clearscope.io/favicon.ico'
  UNION ALL SELECT 'MarketMuse', 'AI content strategy and optimization platform.', 'Writing & Research', 'https://www.marketmuse.com', 'paid', 8, 'Active', 'https://www.marketmuse.com/favicon.ico'

) t
CROSS JOIN (SELECT id FROM public.profiles) u
ON CONFLICT (name, user_id) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  url = EXCLUDED.url,
  pricing_model = EXCLUDED.pricing_model,
  rating = EXCLUDED.rating,
  status = EXCLUDED.status,
  logo_url = EXCLUDED.logo_url,
  updated_at = NOW();
