import OpenAI from 'openai'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { IdeaAnalysis, IdeaRecommendation } from '@/types/ideas'
// Puppeteer is optional - only used as last resort fallback for article extraction
// Install with: npm install puppeteer (if needed)
// import puppeteer from 'puppeteer'

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
    // If we've previously detected provider quota problems, skip LLM calls
    if (!isLLMUp()) {
      console.warn('LLM calls temporarily disabled due to recent quota errors; using extractive fallback')
      const fallback = await extractiveSummaryFromUrl(options.url)
      return fallback || ''
    }
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

    // If this is a quota error from OpenAI, mark LLMs down briefly
    const code = (error as any)?.code || (error as any)?.response?.status
    if (code === 'insufficient_quota' || code === 429) {
      markLLMDown(5 * 60 * 1000) // disable for 5 minutes
      console.warn('Marking LLMs down for 5 minutes due to quota error')
    }

    // If request failed due to quota or rate limits, attempt a cheap extractive
    // fallback: fetch the article and return the first 2 sentences from the
    // first meaningful paragraph. This avoids blocking the pipeline when
    // the remote LLM is unavailable or billing is disabled.
    try {
      const fallback = await extractiveSummaryFromUrl(options.url)
      if (fallback) return fallback
    } catch (e) {
      console.error('Extractive fallback failed:', e)
    }

    return ''
  }
}

// Simple in-process circuit breaker for LLM usage
let llmDisabledUntil = 0
export function markLLMDown(ms: number) {
  llmDisabledUntil = Date.now() + ms
}
export function isLLMUp() {
  return Date.now() > llmDisabledUntil
}
// Small sleep helper
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Attempt to extract a short summary from a URL using a few strategies:
// 1) Direct fetch with several User-Agent values (to evade basic bot blocks)
// 2) If the host blocks us (403), try the r.jina.ai text extraction proxy
export async function extractiveSummaryFromUrl(url: string): Promise<string | null> {
  const userAgents = [
    'NeuralDesk/1.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15',
  ]

  // Try direct requests with different user-agents
  for (const ua of userAgents) {
    try {
      const res = await axios.get(url, { timeout: 7000, headers: { 'User-Agent': ua } })
      const $ = cheerio.load(res.data)

      const selectors = ['article p', 'main p', '.article p', '.post p', 'p']
      for (const sel of selectors) {
        const p = $(sel).first().text().trim()
        if (p && p.length > 30) {
          const sentences = p.match(/[^.!?]+[.!?]+/g) || [p]
          return sentences.slice(0, 2).join(' ').trim()
        }
      }

      // If page fetched but no good paragraph, return null to let caller try other approaches
      return null
    } catch (err: any) {
      // If blocked (403) try next strategy, otherwise continue to next UA
      const status = err?.response?.status
      console.warn(`extractive attempt with UA ${ua} failed:`, status || err?.code || err?.message)
      if (status === 403) {
        break
      }
      // brief pause before next UA attempt
      await sleep(300)
    }
  }

  // If direct requests are blocked (403), try a lightweight public extractor proxy
  try {
    // r.jina.ai expects a path like http://example.com/path after /http://
    const proxyTarget = url.replace(/^https?:\/\//, '')
    const proxyUrl = `https://r.jina.ai/http://${proxyTarget}`
    const res = await axios.get(proxyUrl, { timeout: 10000, headers: { 'User-Agent': 'NeuralDesk/1.0.0' } })
    // Some proxies return plain text; cheerio can still parse it
    const $ = cheerio.load(res.data)

    const text = $('body').text().trim() || res.data
    if (typeof text === 'string' && text.length > 120) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
      return sentences.slice(0, 2).join(' ').trim()
    }
  } catch (err) {
    console.error('extractiveSummaryFromUrl proxy attempt failed:', err)
  }

  // Last resort: Puppeteer fallback (DISABLED - puppeteer not installed)
  // To enable: npm install puppeteer and uncomment the import at the top
  // Uncomment this block if you need JavaScript-rendered page extraction:
  /*
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(800)
    const articleText = await page.evaluate(() => {
      const selectors = ['article', 'main', '[role="main"]']
      for (const sel of selectors) {
        const el = document.querySelector(sel)
        if (el) return el.textContent || ''
      }
      return document.body?.innerText || ''
    })
    await browser.close()

    if (articleText && articleText.length > 120) {
      const sentences = articleText.match(/[^.!?]+[.!?]+/g) || [articleText]
      return sentences.slice(0, 2).join(' ').trim()
    }
  } catch (err) {
    console.error('extractiveSummaryFromUrl puppeteer attempt failed:', err)
  }
  */

  return null
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

// Sophisticated Startup Idea Power Test (Phase 4)

export interface EvaluationResult {
  score: number
  recommendation: IdeaRecommendation
  brutal_summary: string
  analysis: IdeaAnalysis
}

const POWER_TEST_SYSTEM_PROMPT = `You are NeuralDesk — a brutally honest founder assistant. Your job is to reduce wasted effort, not to encourage ideas.
You must evaluate startup ideas with extreme critical thinking.
Avoid hype. Call out weak logic. Prefer clarity over kindness.

You will receive a startup idea with: Name, Problem, Target User, Solution, Why AI.

You must output a valid JSON object with the following structure:
{
  "score": number, // 0-10 integer
  "recommendation": "Build" | "Iterate" | "Kill",
  "brutal_summary": "One sentence summary of the verdict (no sugarcoating)",
  "analysis": {
    "existence": {
      "status": "Exists" | "Partially Exists" | "New" | "Unknown",
      "references": ["competitor1", "competitor2"] // Real companies if known, or descriptions
    },
    "market": {
      "pain_intensity": "Low" | "Medium" | "High" | "Unknown",
      "demand_likelihood": "Low" | "Medium" | "High" | "Unknown",
      "is_must_have": boolean
    },
    "differentiation": {
      "one_sentence_diff": "How it is strictly different (or null if generic)",
      "flags": ["buzzword1", "vague claim"] // List of red flags
    },
    "ai_justification": {
      "necessity_level": "Essential" | "Optional" | "Unnecessary" | "Unknown",
      "reasoning": "Why AI is needed or not"
    },
    "monetization": {
      "buyer_persona": "Who actually pays",
      "willingness_to_pay": "Low" | "Medium" | "High" | "Unknown"
    }
  }
}
`

// Safely parse provider output into EvaluationResult
function safeParseEvaluationResult(raw: string | undefined, provider: string): EvaluationResult {
  const snippet = (raw || '').toString().slice(0, 200)
  if (!raw) throw new Error(`${provider}: empty response`)

  // Try to extract a JSON object from the text
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  const candidate = jsonMatch ? jsonMatch[0] : raw.trim()

  // Quick sanity check: must start with '{'
  if (!candidate || !candidate.trim().startsWith('{')) {
    console.error(`${provider}: response not JSON. Snippet:`, snippet)
    throw new Error(`${provider} returned non-JSON response`)
  }

  try {
    return JSON.parse(candidate) as EvaluationResult
  } catch (err) {
    console.error(`${provider}: JSON parse failed. Snippet:`, snippet, 'error:', err)
    throw new Error(`${provider} returned invalid JSON`)
  }
}


// --- Multi-Model Clients ---

const getGeminiClient = () => {
  // Check both standard names
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
  if (!key) return null
  return new GoogleGenerativeAI(key)
}

const getGroqClient = () => {
  const key = process.env.GROQ_API_KEY
  if (!key) return null

  // Groq is OpenAI-compatible
  return new OpenAI({
    apiKey: key,
    baseURL: 'https://api.groq.com/openai/v1',
  })
}

export async function evaluateStartupIdea(idea: {
  name: string
  one_liner: string
  problem: string
  target_user: string
  solution: string
  why_ai: string
}): Promise<EvaluationResult> {

  const prompt = `
Idea Name: ${idea.name}
One Liner: ${idea.one_liner}
Target User: ${idea.target_user}

Problem:
${idea.problem}

Proposed Solution:
${idea.solution}

Why AI is Needed:
${idea.why_ai}
`

  // 1. Try OpenAI (Primary - GPT-4o)
  // NOTE: OpenAI is attempted later as a higher-cost provider. Prefer Gemini/Groq first.

  // 2. Try Gemini (Fallback 1 - Gemini 1.5 Flash)
  try {
    const genAI = getGeminiClient()
    if (!genAI) throw new Error('No Google AI Key')

    // Try a sequence of supported Gemini model IDs (newer 2.5 series first)
    const candidateModels = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-flash-latest']
    for (const candidate of candidateModels) {
      try {
        console.log(`Trying Gemini (${candidate})...`)
        const model = genAI.getGenerativeModel({ model: candidate, generationConfig: { responseMimeType: 'application/json' } })
        const fullPrompt = `${POWER_TEST_SYSTEM_PROMPT}\n\nUser Input:\n${prompt}`
        const result = await model.generateContent(fullPrompt)
        const response = await result.response
        const text = response.text()
        if (!text) throw new Error('No content from Gemini')
        const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim()
        return safeParseEvaluationResult(jsonStr, `Gemini:${candidate}`)
      } catch (innerErr: any) {
        console.warn(`Gemini model ${candidate} failed:`, innerErr?.message || innerErr)
        // try next candidate
      }
    }
    // If we get here, all Gemini candidates failed
    throw new Error('All Gemini candidates failed')
  } catch (err: any) {
    console.warn('Gemini failed, switching to next backup...', err.message)
  }

  // 3. Try Groq (Fallback 2 - Llama 3 70B)
  try {
    const groq = getGroqClient()
    if (!groq) throw new Error('No Groq Key')

    const groqModel = process.env.GROQ_MODEL
    if (!groqModel) throw new Error('No Groq model configured')

    console.log(`Trying Groq (${groqModel})...`)
    const completion = await groq.chat.completions.create({
      model: groqModel,
      messages: [
        { role: 'system', content: POWER_TEST_SYSTEM_PROMPT + "\nIMPORTANT: Return ONLY valid JSON. Do not use Markdown blocks." },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    })

    let content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No content from Groq')
    return safeParseEvaluationResult(content, `Groq:${groqModel}`)

  } catch (err: any) {
    console.error('Groq Failed:', err)

    // Try OpenAI here (if available) before falling back to local/HF
    try {
      if (process.env.OPENAI_API_KEY) {
        console.log('Trying OpenAI (gpt-4o) as fallback...')
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: POWER_TEST_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        })

        const content = completion.choices[0]?.message?.content
        if (content) {
          return safeParseEvaluationResult(content, 'OpenAI')
        }
      }
    } catch (openErr: any) {
      console.warn('OpenAI fallback failed:', openErr?.message || openErr)
      // continue to local/HF
    }

    // Try local fallback (LocalAI / Ollama / custom local HTTP model) before giving up
    try {
      const local = await callLocalModel(prompt)
      if (local) {
        // attempt JSON extraction similar to remote providers
        let jsonText = local
        return safeParseEvaluationResult(jsonText, 'LocalModel')
      }
    } catch (localErr) {
      console.warn('Local model fallback failed:', localErr)
    }

    // Try Hugging Face Inference API as a final fallback
    try {
      const hfResponse = await callHuggingFace(prompt)
      if (hfResponse) {
        let jsonText = hfResponse
        return safeParseEvaluationResult(jsonText, 'HuggingFace')
      }
    } catch (hfErr: any) {
      console.warn('HuggingFace fallback failed:', hfErr)
    }

    // Throw final error if no fallback succeeded
    throw new Error(`All Intelligence Systems Offline. OpenAI: ${process.env.OPENAI_API_KEY ? 'Checked' : 'Missing'}, Gemini: ${process.env.GOOGLE_AI_API_KEY ? 'Checked' : 'Missing'}, Groq: ${process.env.GROQ_API_KEY ? 'Checked' : 'Missing'}, HuggingFace: ${process.env.HUGGINGFACE_API_KEY ? 'Checked' : 'Missing'}. Check server logs for details.`)
  }
}

// Local model fallback: expect a local HTTP server that accepts { prompt } and returns plain text
async function callLocalModel(prompt: string): Promise<string | null> {
  try {
    // Common local runtimes: LocalAI (default 8080), Ollama (11434), adapt as needed
    const endpoints = [
      'http://localhost:8080/generate',
      'http://localhost:11434/generate',
      'http://localhost:8080/v1/generate'
    ]
    for (const url of endpoints) {
      try {
        const res = await axios.post(url, { prompt }, { timeout: 10000 })
        if (res?.data) {
          // if response has { text } or plain string
          if (typeof res.data === 'string') return res.data
          if (res.data.text) return res.data.text
          if (res.data.result) return typeof res.data.result === 'string' ? res.data.result : JSON.stringify(res.data.result)
        }
      } catch (e) {
        // try next endpoint
        continue
      }
    }
  } catch (err) {
    console.error('callLocalModel error:', err)
  }
  return null
}

// Hugging Face Inference API fallback
async function callHuggingFace(prompt: string): Promise<string | null> {
  try {
    const hfKey = process.env.HUGGINGFACE_API_KEY
    if (!hfKey) return null

    const model = process.env.HUGGINGFACE_MODEL || 'gpt2'
    const url = `https://api-inference.huggingface.co/models/${model}`

    const res = await axios.post(
      url,
      {
        inputs: prompt,
        parameters: { max_new_tokens: 512 },
      },
      {
        timeout: 20000,
        headers: {
          Authorization: `Bearer ${hfKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = res.data
    // Many HF models return an array of objects with `generated_text`
    if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text
    if (data?.generated_text) return data.generated_text
    if (typeof data === 'string') return data
    if (data?.error) throw new Error(data.error)
    return JSON.stringify(data)
  } catch (err) {
    console.error('callHuggingFace error:', err)
    return null
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
