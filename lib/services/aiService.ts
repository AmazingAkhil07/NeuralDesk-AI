import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface SummarizeOptions {
  title: string
  url: string
  source: string
}

// Prompt template for news summarization
const SUMMARIZATION_PROMPT = `You are an AI assistant helping a developer stay updated with AI/ML news. 

Analyze this news item and provide a concise "Why this matters" summary in 2-3 sentences.

Focus on:
- Practical implications for developers
- How it fits into the broader AI landscape
- Why someone should care about this

Title: {title}
Source: {source}
URL: {url}

Provide only the summary, no additional formatting or labels.`

// Generate AI summary for a news item
export async function generateNewsSummary(options: SummarizeOptions): Promise<string> {
  try {
    const prompt = SUMMARIZATION_PROMPT
      .replace('{title}', options.title)
      .replace('{source}', options.source)
      .replace('{url}', options.url)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost efficiency
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant that summarizes AI/ML news for developers.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    return completion.choices[0]?.message?.content?.trim() || ''
  } catch (error) {
    console.error('Error generating summary:', error)
    return ''
  }
}

// Batch summarize multiple news items with rate limiting
export async function batchSummarizeNews(
  newsItems: SummarizeOptions[]
): Promise<Map<string, string>> {
  const summaries = new Map<string, string>()
  const batchSize = 5 // Process 5 items at a time to respect rate limits

  for (let i = 0; i < newsItems.length; i += batchSize) {
    const batch = newsItems.slice(i, i + batchSize)
    
    const batchPromises = batch.map(async (item) => {
      const summary = await generateNewsSummary(item)
      return { url: item.url, summary }
    })

    const results = await Promise.all(batchPromises)
    
    results.forEach(({ url, summary }) => {
      summaries.set(url, summary)
    })

    // Add a small delay between batches to avoid rate limits
    if (i + batchSize < newsItems.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return summaries
}

// Prompt template for idea evaluation (for later use in Phase 4)
export const IDEA_EVALUATION_PROMPT = `You are a brutally honest AI advisor helping evaluate startup ideas.

Analyze this idea and provide:
1. Honest assessment (be critical, not encouraging)
2. Key risks and challenges
3. Market reality check
4. Technical feasibility
5. One actionable next step

Idea: {idea}
Context: {context}

Be direct and realistic. Focus on what could go wrong.`

// Generate idea evaluation (placeholder for Phase 4)
export async function evaluateIdea(idea: string, context: string): Promise<string> {
  try {
    const prompt = IDEA_EVALUATION_PROMPT
      .replace('{idea}', idea)
      .replace('{context}', context)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Use full model for deeper analysis
      messages: [
        {
          role: 'system',
          content: 'You are a brutally honest startup advisor who tells the truth, not what people want to hear.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    })

    return completion.choices[0]?.message?.content?.trim() || 'Evaluation failed.'
  } catch (error) {
    console.error('Error evaluating idea:', error)
    throw error
  }
}

// Generate embeddings for knowledge vault (placeholder for Phase 5)
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}
