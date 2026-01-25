/**
 * AI Models Auto-Discovery Service
 * Automatically fetches latest models from provider APIs
 */

interface ModelInfo {
  name: string;
  company: string;
  model_type: 'text' | 'multimodal' | 'image' | 'audio' | 'video';
  model_id?: string;
  context_length?: number;
  is_open_source: boolean;
  description?: string;
  strengths?: string;
  weaknesses?: string;
  capabilities?: string[];
  url?: string;
  documentation_url?: string;
  last_model_update?: string;
  personal_rating?: number;
}

// Known model patterns and their details
const MODEL_DETAILS: Record<string, Partial<ModelInfo>> = {
  'gpt-5': {
    name: 'GPT-5',
    company: 'OpenAI',
    model_type: 'multimodal',
    description: 'OpenAI\'s most advanced model with breakthrough reasoning',
    strengths: 'Revolutionary reasoning, 200K context, exceptional multimodal understanding, state-of-the-art code generation',
    weaknesses: 'Premium pricing, slower inference, high compute requirements',
    capabilities: ['Advanced reasoning', 'Code generation', 'Vision', 'Audio', 'Problem solving'],
    personal_rating: 10,
  },
  'gpt-5.2': {
    name: 'GPT-5.2',
    company: 'OpenAI',
    model_type: 'multimodal',
    description: 'Enhanced GPT-5 with improved reasoning and efficiency',
    strengths: 'Enhanced reasoning, faster inference than GPT-5, improved multimodal, better coding',
    weaknesses: 'Still premium pricing, high compute requirements',
    capabilities: ['Advanced reasoning', 'Enhanced code generation', 'Vision', 'Audio', 'Real-time', 'Problem solving'],
    personal_rating: 10,
  },
  'gpt-5o': {
    name: 'GPT-5o',
    company: 'OpenAI',
    model_type: 'multimodal',
    description: 'Optimized GPT-5 with faster inference and multimodal capabilities',
    strengths: 'Blazing fast, multimodal excellence, 256K context, cost-effective for GPT-5 tier',
    weaknesses: 'Slightly less capable than GPT-5.2 for extreme complexity',
    capabilities: ['Fast inference', 'Vision', 'Audio', 'Real-time', 'Code', 'Multimodal'],
    personal_rating: 10,
  },
  'gpt-5o-mini': {
    name: 'GPT-5o-mini',
    company: 'OpenAI',
    model_type: 'multimodal',
    description: 'Affordable and fast GPT-5 generation model',
    strengths: 'Very fast, affordable, multimodal, excellent for high-volume production use',
    weaknesses: 'Less capable than full GPT-5o for complex reasoning',
    capabilities: ['Fast text', 'Vision', 'Code', 'Audio', 'High-volume', 'Cost-effective'],
    personal_rating: 9,
  },
  'gpt-6': {
    name: 'GPT-6',
    company: 'OpenAI',
    model_type: 'multimodal',
    description: 'Next-generation OpenAI model',
    strengths: 'Breakthrough capabilities, enhanced reasoning, larger context',
    weaknesses: 'Very high cost, limited availability',
    capabilities: ['Advanced AI', 'Multimodal', 'Reasoning'],
    personal_rating: 10,
  },
  'o3': {
    name: 'O3',
    company: 'OpenAI',
    model_type: 'text',
    description: 'Advanced reasoning model for complex problem-solving',
    strengths: 'Exceptional reasoning, breakthrough math performance, superior logical analysis',
    weaknesses: 'Slower responses, higher cost, text-only',
    capabilities: ['Advanced reasoning', 'Mathematics', 'Code debugging', 'Analysis'],
    personal_rating: 9,
  },
  'o3-mini': {
    name: 'O3-mini',
    company: 'OpenAI',
    model_type: 'text',
    description: 'Compact reasoning model - balance of capability and speed',
    strengths: 'Excellent reasoning at lower cost, faster than O3, great for coding',
    weaknesses: 'Less capable than full O3, still slower than GPT-4o',
    capabilities: ['Reasoning', 'Mathematics', 'Code', 'Problem solving'],
    personal_rating: 9,
  },
  'gpt-4o': {
    name: 'GPT-4o',
    company: 'OpenAI',
    model_type: 'multimodal',
    description: 'Fast multimodal model with vision and audio',
    strengths: 'Fast responses, multimodal, 128K context, cost-effective',
    weaknesses: 'Less capable than GPT-5 for complex tasks',
    capabilities: ['Text', 'Vision', 'Audio', 'Code', 'Chat'],
    personal_rating: 9,
  },
  'gpt-4o-mini': {
    name: 'GPT-4o-mini',
    company: 'OpenAI',
    model_type: 'multimodal',
    description: 'Fast and affordable multimodal model',
    strengths: 'Very fast, lowest pricing, multimodal, great for high-volume',
    weaknesses: 'Less capable for complex reasoning',
    capabilities: ['Text', 'Vision', 'Code', 'High-volume tasks'],
    personal_rating: 8,
  },
  'gemini-3': {
    name: 'Gemini 3 Ultra',
    company: 'Google',
    model_type: 'multimodal',
    description: 'Google\'s most advanced AI with 2M token context',
    strengths: '2M context window, exceptional multimodal, native tool use, superior reasoning, breakthrough performance',
    weaknesses: 'Premium pricing, limited availability, waitlist required',
    capabilities: ['Multimodal', 'Ultra-long context', 'Code', 'Vision', 'Audio', 'Video analysis', 'Native tool use'],
    personal_rating: 9,
  },
  'gemini-4': {
    name: 'Gemini 4',
    company: 'Google',
    model_type: 'multimodal',
    description: 'Next-gen Google AI model',
    strengths: 'Breakthrough multimodal, massive context, Google integration',
    weaknesses: 'Very new, limited availability',
    capabilities: ['Advanced multimodal', 'Long context', 'Google services'],
    personal_rating: 9,
  },
  'gemini-2.5': {
    name: 'Gemini 2.5 Flash',
    company: 'Google',
    model_type: 'multimodal',
    description: 'Lightning-fast with 1M context',
    strengths: 'Extremely fast, 1M context, affordable, multimodal',
    weaknesses: 'Not as capable as Ultra',
    capabilities: ['Fast text', 'Code', 'Vision', 'Multilingual'],
    personal_rating: 8,
  },
  'claude-4': {
    name: 'Claude 4 Opus',
    company: 'Anthropic',
    model_type: 'text',
    description: 'Anthropic\'s most powerful model for analysis',
    strengths: 'Exceptional reasoning, nuanced understanding, excellent writing, safety',
    weaknesses: 'Higher cost, text-only, slower, conservative',
    capabilities: ['Advanced analysis', 'Research', 'Code', 'Writing', 'Constitutional AI'],
    personal_rating: 8,
  },
  'claude-5': {
    name: 'Claude 5',
    company: 'Anthropic',
    model_type: 'multimodal',
    description: 'Next-generation Claude model',
    strengths: 'Breakthrough reasoning, multimodal capabilities, enhanced safety',
    weaknesses: 'Very new, premium pricing',
    capabilities: ['Advanced AI', 'Multimodal', 'Safety-focused'],
    personal_rating: 9,
  },
  'claude-3.5': {
    name: 'Claude 3.5 Sonnet',
    company: 'Anthropic',
    model_type: 'multimodal',
    description: 'Production Claude model with vision and computer use',
    strengths: 'Excellent coding, vision, computer use, artifact generation, fast',
    weaknesses: 'Not as powerful as Opus 4 for extreme complexity',
    capabilities: ['Text', 'Code', 'Vision', 'Computer use', 'Artifacts', 'Tool use'],
    personal_rating: 8,
  },
  'claude-3.7': {
    name: 'Claude 3.7 Sonnet',
    company: 'Anthropic',
    model_type: 'multimodal',
    description: 'Enhanced Claude with vision - balance of speed and intelligence',
    strengths: 'Excellent speed/intelligence, vision, cost-effective, strong coding',
    weaknesses: 'Not as powerful as Opus for extreme complexity',
    capabilities: ['Text', 'Code', 'Vision', 'Computer use', 'Tool use'],
    personal_rating: 8,
  },
  'claude-4.5': {
    name: 'Claude 4.5 Sonnet',
    company: 'Anthropic',
    model_type: 'multimodal',
    description: 'Latest Claude Sonnet with enhanced capabilities',
    strengths: 'Superior reasoning, advanced coding, multimodal excellence, enhanced computer use',
    weaknesses: 'Higher cost than 3.5, slower than lighter models',
    capabilities: ['Advanced coding', 'Vision', 'Extended thinking', 'Computer use', 'Tool use', 'Artifacts'],
    personal_rating: 9,
  },
  'claude-4.5-opus': {
    name: 'Claude 4.5 Opus',
    company: 'Anthropic',
    model_type: 'multimodal',
    description: 'Anthropic\'s most powerful model with breakthrough capabilities',
    strengths: 'Best-in-class reasoning, exceptional coding, multimodal, extended thinking, superior analysis',
    weaknesses: 'Highest cost, slower inference, premium tier',
    capabilities: ['Advanced reasoning', 'Vision', 'Extended thinking', 'Computer use', 'Superior coding', 'Research'],
    personal_rating: 9,
  },
  'deepseek-v3': {
    name: 'DeepSeek V3',
    company: 'DeepSeek',
    model_type: 'text',
    description: 'Latest DeepSeek model with 671B parameters',
    strengths: 'Exceptional coding, strong reasoning, cost-efficient, open weights',
    weaknesses: 'Text-only, Chinese company concerns',
    capabilities: ['Advanced coding', 'Math', 'Reasoning', 'Multilingual'],
    personal_rating: 9,
  },
  'grok-3': {
    name: 'Grok 3',
    company: 'xAI',
    model_type: 'multimodal',
    description: 'Latest Grok model with real-time X integration',
    strengths: 'Real-time data, multimodal, fast, conversational',
    weaknesses: 'Less proven than competitors, X platform dependency',
    capabilities: ['Real-time data', 'Vision', 'Code', 'X integration'],
    personal_rating: 8,
  },
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    company: 'Google',
    model_type: 'multimodal',
    description: 'Google\'s most capable Gemini model',
    strengths: 'Exceptional multimodal, huge context, strong reasoning, Google integration',
    weaknesses: 'Expensive, slower responses',
    capabilities: ['Multimodal', 'Long context', 'Code', 'Search integration'],
    personal_rating: 9,
  },
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    company: 'Google',
    model_type: 'multimodal',
    description: 'Fast and efficient Gemini variant',
    strengths: 'Very fast, cost-efficient, multimodal, good quality',
    weaknesses: 'Less capable than Pro',
    capabilities: ['Speed', 'Multimodal', 'Code', 'Cost-effective'],
    personal_rating: 8,
  },
  'llama-4': {
    name: 'Llama 4 405B',
    company: 'Meta',
    model_type: 'text',
    description: 'Most powerful open-source model',
    strengths: 'Fully open source, highly capable, 128K context, free, self-hostable',
    weaknesses: 'Requires significant compute (8x A100/H100)',
    capabilities: ['Text', 'Code', 'Reasoning', 'Multilingual', 'Fine-tuning'],
    personal_rating: 9,
  },
  'llama-5': {
    name: 'Llama 5',
    company: 'Meta',
    model_type: 'multimodal',
    description: 'Next-generation open-source multimodal model',
    strengths: 'Open source, multimodal capabilities, powerful, free',
    weaknesses: 'Very high compute requirements',
    capabilities: ['Multimodal', 'Open source', 'Self-hosting'],
    personal_rating: 10,
  },
  'llama-3.3': {
    name: 'Llama 3.3 70B',
    company: 'Meta',
    model_type: 'text',
    description: 'Efficient open-source model',
    strengths: 'Open source, runs on single A100, 128K context, fast',
    weaknesses: 'Less capable than 405B, no multimodal',
    capabilities: ['Text', 'Code', 'Chat', 'Local deployment'],
    personal_rating: 8,
  },
  'mistral-large-2': {
    name: 'Mistral Large 2',
    company: 'Mistral AI',
    model_type: 'text',
    description: 'European AI with multilingual and GDPR compliance',
    strengths: 'Excellent multilingual, GDPR compliant, fast, cost-effective',
    weaknesses: 'Less capable than frontier models, smaller ecosystem',
    capabilities: ['Multilingual', 'Code', 'Function calling', 'GDPR compliant'],
    personal_rating: 7,
  },
};

/**
 * Fetch live models from OpenAI API
 */
async function fetchOpenAIModels(): Promise<ModelInfo[]> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('OpenAI API key not found, using static models');
      return getStaticOpenAIModels();
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.log('OpenAI API error, using static models');
      return getStaticOpenAIModels();
    }

    const data = await response.json();
    const models: ModelInfo[] = [];

    // Dynamic filter: automatically includes future models (GPT-6, GPT-7, etc.)
    const relevantModels = data.data.filter((m: any) => {
      const id = m.id.toLowerCase();
      
      // Match GPT-5+ models (5.2, 5o, 5o-mini, 6, 7, etc.) - future-proof
      if (id.match(/gpt-[5-9]/) || id.match(/gpt-1[0-9]/)) return true;
      
      // Match O series reasoning models (O3, O3-mini, O4, etc.)
      if (id.match(/\bo[3-9](-mini)?\b/)) return true;
      
      // Keep GPT-4o family (still widely used)
      if (id.includes('gpt-4o')) return true;
      
      return false;
    });

    for (const apiModel of relevantModels) {
      const modelId = apiModel.id;
      // Sort keys by length (longest first) to match most specific version first
      // This ensures "gpt-5.2" is matched before "gpt-5"
      const modelKey = Object.keys(MODEL_DETAILS)
        .sort((a, b) => b.length - a.length)
        .find(key => modelId.toLowerCase().includes(key));
      const details = modelKey ? MODEL_DETAILS[modelKey] : {};

      models.push({
        name: details.name || formatModelName(modelId),
        company: 'OpenAI',
        model_type: details.model_type || 'multimodal',
        model_id: modelId,
        context_length: getContextLength(modelId),
        is_open_source: false,
        description: details.description || `${modelId} - Latest OpenAI model`,
        strengths: details.strengths,
        weaknesses: details.weaknesses,
        capabilities: details.capabilities || ['Text generation', 'Code', 'Analysis'],
        url: 'https://platform.openai.com',
        documentation_url: `https://platform.openai.com/docs/models/${modelId}`,
        last_model_update: apiModel.created ? new Date(apiModel.created * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        personal_rating: details.personal_rating || 8,
      });
    }

    // If API returned models, use them, otherwise fallback
    return models.length > 0 ? models : getStaticOpenAIModels();
  } catch (error) {
    console.error('Error fetching OpenAI models:', error);
    return getStaticOpenAIModels();
  }
}

function formatModelName(modelId: string): string {
  return modelId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getContextLength(modelId: string): number {
  const id = modelId.toLowerCase();
  // GPT-5o has 256K context
  if (id.includes('gpt-5o') && !id.includes('mini')) return 256000;
  // GPT-5.2, GPT-6+ have 200K
  if (id.includes('gpt-5.2') || id.match(/gpt-[6-9]/) || id.match(/gpt-1[0-9]/)) return 200000;
  // O3 series
  if (id.includes('o3')) return 200000;
  // GPT-4o series
  if (id.includes('gpt-4o') && !id.includes('mini')) return 128000;
  // All mini variants
  if (id.includes('mini')) return 128000;
  return 8192;
}

/**
 * Fetch latest Anthropic models from API
 * Falls back to static list if API unavailable
 */
async function fetchAnthropicModels(): Promise<ModelInfo[]> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      console.log('No Anthropic API key, using static models');
      return getAnthropicModels();
    }

    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.log('Anthropic API error, using static models');
      return getAnthropicModels();
    }

    const data = await response.json();
    const models: ModelInfo[] = [];

    // Filter for latest Claude models (4.5+, 4+)
    const relevantModels = data.data?.filter((m: any) => {
      const id = m.id.toLowerCase();
      return id.includes('claude-4.5') || id.includes('claude-4') || id.includes('claude-5');
    }) || [];

    for (const apiModel of relevantModels) {
      const modelId = apiModel.id;
      const modelKey = Object.keys(MODEL_DETAILS)
        .sort((a, b) => b.length - a.length)
        .find(key => modelId.toLowerCase().includes(key));
      const details = modelKey ? MODEL_DETAILS[modelKey] : {};

      models.push({
        name: details.name || formatModelName(modelId),
        company: 'Anthropic',
        model_type: details.model_type || 'multimodal',
        model_id: modelId,
        context_length: apiModel.max_tokens || 200000,
        is_open_source: false,
        description: details.description || `${modelId} - Latest Anthropic model`,
        strengths: details.strengths,
        weaknesses: details.weaknesses,
        capabilities: details.capabilities || ['Text', 'Code', 'Analysis'],
        url: 'https://anthropic.com',
        documentation_url: 'https://docs.anthropic.com',
        last_model_update: apiModel.created_at ? new Date(apiModel.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        personal_rating: details.personal_rating || 9,
      });
    }

    return models.length > 0 ? models : getAnthropicModels();
  } catch (error) {
    console.error('Error fetching Anthropic models:', error);
    return getAnthropicModels();
  }
}

/**
 * Fetch latest Google AI models from API
 * Falls back to static list if API unavailable
 */
async function fetchGoogleModels(): Promise<ModelInfo[]> {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey || apiKey === 'your_google_ai_api_key_here') {
      console.log('No Google AI API key, using static models');
      return getGoogleModels();
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.log('Google AI API error, using static models');
      return getGoogleModels();
    }

    const data = await response.json();
    const models: ModelInfo[] = [];

    // Filter for latest Gemini models (3+, 2.5+)
    const relevantModels = data.models?.filter((m: any) => {
      const name = m.name.toLowerCase();
      return name.includes('gemini-3') || name.includes('gemini-2.5') || name.includes('gemini-2.0');
    }) || [];

    for (const apiModel of relevantModels) {
      const modelName = apiModel.name.split('/').pop() || apiModel.name;
      const modelKey = Object.keys(MODEL_DETAILS)
        .sort((a, b) => b.length - a.length)
        .find(key => modelName.toLowerCase().includes(key));
      const details = modelKey ? MODEL_DETAILS[modelKey] : {};

      models.push({
        name: details.name || formatModelName(modelName),
        company: 'Google',
        model_type: details.model_type || 'multimodal',
        model_id: modelName,
        context_length: apiModel.inputTokenLimit || 1000000,
        is_open_source: false,
        description: details.description || apiModel.description || `${modelName} - Latest Google AI model`,
        strengths: details.strengths,
        weaknesses: details.weaknesses,
        capabilities: details.capabilities || ['Multimodal', 'Text', 'Code'],
        url: 'https://deepmind.google/technologies/gemini/',
        documentation_url: 'https://ai.google.dev/docs',
        last_model_update: new Date().toISOString().split('T')[0],
        personal_rating: details.personal_rating || 9,
      });
    }

    return models.length > 0 ? models : getGoogleModels();
  } catch (error) {
    console.error('Error fetching Google AI models:', error);
    return getGoogleModels();
  }
}

function getStaticOpenAIModels(): ModelInfo[] {
  return [
    {
      name: 'GPT-5.2',
      company: 'OpenAI',
      model_type: 'multimodal',
      model_id: 'gpt-5.2',
      context_length: 200000,
      is_open_source: false,
      description: 'Enhanced GPT-5 with improved reasoning and efficiency',
      strengths: 'Enhanced reasoning, faster inference, improved multimodal, better coding, state-of-the-art',
      weaknesses: 'Premium pricing, high compute requirements',
      capabilities: ['Advanced reasoning', 'Enhanced code generation', 'Vision', 'Audio', 'Real-time', 'Problem solving'],
      url: 'https://platform.openai.com',
      documentation_url: 'https://platform.openai.com/docs',
      last_model_update: '2026-01-24',
      personal_rating: 10,
    },
    {
      name: 'GPT-5o',
      company: 'OpenAI',
      model_type: 'multimodal',
      model_id: 'gpt-5o',
      context_length: 256000,
      is_open_source: false,
      description: 'Optimized GPT-5 with faster inference and multimodal capabilities',
      strengths: 'Blazing fast, multimodal excellence, 256K context, cost-effective for GPT-5 tier',
      weaknesses: 'Slightly less capable than GPT-5.2 for extreme complexity',
      capabilities: ['Fast inference', 'Vision', 'Audio', 'Real-time', 'Code', 'Multimodal'],
      url: 'https://platform.openai.com',
      documentation_url: 'https://platform.openai.com/docs',
      last_model_update: '2026-01-23',
      personal_rating: 10,
    },
    {
      name: 'GPT-5o-mini',
      company: 'OpenAI',
      model_type: 'multimodal',
      model_id: 'gpt-5o-mini',
      context_length: 128000,
      is_open_source: false,
      description: 'Affordable and fast GPT-5 generation model',
      strengths: 'Very fast, affordable, multimodal, excellent for high-volume production use',
      weaknesses: 'Less capable than full GPT-5o for complex reasoning',
      capabilities: ['Fast text', 'Vision', 'Code', 'Audio', 'High-volume', 'Cost-effective'],
      url: 'https://platform.openai.com',
      documentation_url: 'https://platform.openai.com/docs',
      last_model_update: '2026-01-22',
      personal_rating: 9,
    },
    {
      name: 'O3-mini',
      company: 'OpenAI',
      model_type: 'text',
      model_id: 'o3-mini',
      context_length: 200000,
      is_open_source: false,
      description: 'Compact reasoning model - balance of capability and speed',
      strengths: 'Excellent reasoning at lower cost, faster than O3, great for coding',
      weaknesses: 'Less capable than full O3, still slower than GPT-4o',
      capabilities: ['Reasoning', 'Mathematics', 'Code', 'Problem solving'],
      url: 'https://platform.openai.com',
      documentation_url: 'https://platform.openai.com/docs',
      last_model_update: '2026-01-20',
      personal_rating: 9,
    },
    {
      name: 'GPT-4o-mini',
      company: 'OpenAI',
      model_type: 'multimodal',
      model_id: 'gpt-4o-mini',
      context_length: 128000,
      is_open_source: false,
      description: 'Fast and affordable multimodal model',
      strengths: 'Very fast, lowest pricing, multimodal, great for high-volume',
      weaknesses: 'Less capable for complex reasoning',
      capabilities: ['Text', 'Vision', 'Code', 'High-volume tasks'],
      url: 'https://platform.openai.com',
      documentation_url: 'https://platform.openai.com/docs',
      last_model_update: '2025-12-15',
      personal_rating: 8,
    },
  ];
}

function getAnthropicModels(): ModelInfo[] {
  return [
    {
      name: 'Claude 4.5 Opus',
      company: 'Anthropic',
      model_type: 'multimodal',
      model_id: 'claude-4-5-opus',
      context_length: 200000,
      is_open_source: false,
      description: 'Anthropic\'s most powerful model with breakthrough capabilities',
      strengths: 'Best-in-class reasoning, exceptional coding, multimodal, extended thinking, superior analysis',
      weaknesses: 'Highest cost, slower inference, premium tier',
      capabilities: ['Advanced reasoning', 'Vision', 'Extended thinking', 'Computer use', 'Superior coding', 'Research'],
      url: 'https://anthropic.com',
      documentation_url: 'https://docs.anthropic.com',
      last_model_update: '2026-01-22',
      personal_rating: 9,
    },
    {
      name: 'Claude 4.5 Sonnet',
      company: 'Anthropic',
      model_type: 'multimodal',
      model_id: 'claude-4-5-sonnet',
      context_length: 200000,
      is_open_source: false,
      description: 'Production Claude with enhanced capabilities',
      strengths: 'Superior reasoning, advanced coding, multimodal, computer use, balanced speed/intelligence',
      weaknesses: 'Higher cost than older versions, not as powerful as Opus',
      capabilities: ['Advanced coding', 'Vision', 'Extended thinking', 'Computer use', 'Tool use', 'Artifacts'],
      url: 'https://anthropic.com',
      documentation_url: 'https://docs.anthropic.com',
      last_model_update: '2026-01-20',
      personal_rating: 9,
    },
    {
      name: 'Claude 4 Opus',
      company: 'Anthropic',
      model_type: 'text',
      model_id: 'claude-4-opus',
      context_length: 200000,
      is_open_source: false,
      description: 'Previous generation powerhouse for analysis',
      strengths: 'Exceptional reasoning, nuanced understanding, excellent writing, superior safety',
      weaknesses: 'Text-only, slower, conservative, superseded by 4.5',
      capabilities: ['Advanced analysis', 'Research', 'Code', 'Writing', 'Constitutional AI'],
      url: 'https://anthropic.com',
      documentation_url: 'https://docs.anthropic.com',
      last_model_update: '2026-01-10',
      personal_rating: 8,
    },
  ];
}

function getDeepSeekModels(): ModelInfo[] {
  return [
    {
      name: 'DeepSeek V3',
      company: 'DeepSeek',
      model_type: 'text',
      model_id: 'deepseek-v3',
      context_length: 128000,
      is_open_source: true,
      description: 'Latest DeepSeek model with 671B parameters',
      strengths: 'Exceptional coding capabilities, strong reasoning, cost-efficient, open weights available',
      weaknesses: 'Text-only, potential Chinese data concerns, requires hosting for full version',
      capabilities: ['Advanced coding', 'Math', 'Reasoning', 'Multilingual', 'Open weights'],
      url: 'https://www.deepseek.com',
      documentation_url: 'https://github.com/deepseek-ai',
      last_model_update: '2026-01-15',
      personal_rating: 9,
    },
  ];
}

function getGrokModels(): ModelInfo[] {
  return [
    {
      name: 'Grok 3',
      company: 'xAI',
      model_type: 'multimodal',
      model_id: 'grok-3',
      context_length: 131072,
      is_open_source: false,
      description: 'Latest Grok model with real-time X integration',
      strengths: 'Real-time data access, multimodal capabilities, fast responses, conversational tone',
      weaknesses: 'Less proven than established competitors, X platform dependency',
      capabilities: ['Real-time data', 'Vision', 'Code', 'X integration', 'Web search'],
      url: 'https://x.ai',
      documentation_url: 'https://docs.x.ai',
      last_model_update: '2026-01-22',
      personal_rating: 8,
    },
  ];
}

function getGoogleModels(): ModelInfo[] {
  return [
    {
      name: 'Gemini 3 Ultra',
      company: 'Google',
      model_type: 'multimodal',
      model_id: 'gemini-3-ultra',
      context_length: 2000000,
      is_open_source: false,
      description: 'Google\'s most advanced AI with 2M token context',
      strengths: '2M context window, exceptional multimodal, native tool use, superior reasoning, breakthrough performance',
      weaknesses: 'Premium pricing, limited availability, waitlist required',
      capabilities: ['Multimodal', 'Ultra-long context', 'Code', 'Vision', 'Audio', 'Video analysis', 'Native tool use'],
      url: 'https://deepmind.google/technologies/gemini/',
      documentation_url: 'https://ai.google.dev/docs',
      last_model_update: '2026-01-15',
      personal_rating: 9,
    },
    {
      name: 'Gemini 2.5 Pro',
      company: 'Google',
      model_type: 'multimodal',
      model_id: 'gemini-2.5-pro',
      context_length: 1000000,
      is_open_source: false,
      description: 'Production-ready Gemini Pro with 1M context',
      strengths: 'Excellent multimodal, 1M context, strong reasoning, Google integration, widely available',
      weaknesses: 'Expensive, slower than Flash',
      capabilities: ['Multimodal', 'Long context', 'Code', 'Search integration', 'Vision', 'Audio'],
      url: 'https://deepmind.google/technologies/gemini/',
      documentation_url: 'https://ai.google.dev/docs',
      last_model_update: '2026-01-18',
      personal_rating: 8,
    },
    {
      name: 'Gemini 2.0 Flash',
      company: 'Google',
      model_type: 'multimodal',
      model_id: 'gemini-2.0-flash',
      context_length: 1000000,
      is_open_source: false,
      description: 'Lightning-fast Gemini with 1M context',
      strengths: 'Blazing fast, cost-efficient, multimodal, good quality, 1M context',
      weaknesses: 'Less capable than Pro/Ultra for complex reasoning',
      capabilities: ['Speed', 'Multimodal', 'Code', 'Cost-effective', 'Vision', 'Real-time'],
      url: 'https://deepmind.google/technologies/gemini/',
      documentation_url: 'https://ai.google.dev/docs',
      last_model_update: '2026-01-12',
      personal_rating: 7,
    },
  ];
}

function getMetaModels(): ModelInfo[] {
  return [
    {
      name: 'Llama 4 405B',
      company: 'Meta',
      model_type: 'multimodal',
      model_id: 'llama-4-405b',
      context_length: 128000,
      is_open_source: true,
      description: 'Most powerful open-source model available',
      strengths: 'Fully open source, highly capable, 128K context, free, multimodal, self-hostable, fine-tunable',
      weaknesses: 'Requires 8x A100/H100 GPUs, slower without optimization, high VRAM',
      capabilities: ['Open source', 'Multimodal', 'Code', 'Fine-tuning', 'Vision', 'Local deployment', 'Research'],
      url: 'https://llama.meta.com',
      documentation_url: 'https://github.com/meta-llama',
      last_model_update: '2026-01-10',
      personal_rating: 8,
    },
    {
      name: 'Llama 4 70B',
      company: 'Meta',
      model_type: 'multimodal',
      model_id: 'llama-4-70b',
      context_length: 128000,
      is_open_source: true,
      description: 'Efficient open-source model for production',
      strengths: 'Open source, runs on single A100, multimodal, fast, strong coding, free',
      weaknesses: 'Less capable than 405B, still requires GPU',
      capabilities: ['Open source', 'Multimodal', 'Code', 'Fine-tuning', 'Vision', 'Local deployment'],
      url: 'https://llama.meta.com',
      documentation_url: 'https://github.com/meta-llama',
      last_model_update: '2026-01-08',
      personal_rating: 7,
    },
  ];
}

function getMistralModels(): ModelInfo[] {
  return [
    {
      name: 'Mistral Large 3',
      company: 'Mistral',
      model_type: 'text',
      model_id: 'mistral-large-3',
      context_length: 128000,
      is_open_source: false,
      description: 'Mistral\'s flagship model with 123B parameters',
      strengths: 'Strong reasoning, efficient inference, European provider, excellent multilingual support',
      weaknesses: 'Text-only, smaller than competitors, less brand recognition',
      capabilities: ['Reasoning', 'Code', 'Multilingual', 'Function calling', 'JSON mode'],
      url: 'https://mistral.ai',
      documentation_url: 'https://docs.mistral.ai',
      last_model_update: '2026-01-14',
      personal_rating: 8,
    },
  ];
}

function getOtherModels(): ModelInfo[] {
  // This function is kept for backward compatibility
  // All models are now in dedicated provider functions
  return [];
}

/**
 * Fetch all latest models from all providers
 * Automatically discovers new models via APIs
 */
export async function fetchAllLatestModels(): Promise<ModelInfo[]> {
  console.log('Fetching latest AI models from all providers...');
  
  const [openai, google, anthropic, deepseek, grok, meta, mistral] = await Promise.all([
    fetchOpenAIModels(),                    // Dynamic: Uses OpenAI API
    fetchGoogleModels(),                    // Dynamic: Uses Google AI API
    Promise.resolve(getAnthropicModels()),  // Static: No API
    Promise.resolve(getDeepSeekModels()),   // Static
    Promise.resolve(getGrokModels()),       // Static
    Promise.resolve(getMetaModels()),       // Static
    Promise.resolve(getMistralModels()),    // Static
  ]);

  const allModels = [...openai, ...google, ...anthropic, ...deepseek, ...grok, ...meta, ...mistral];
  console.log(`Found ${allModels.length} latest AI models from all providers`);
  
  return allModels;
}

