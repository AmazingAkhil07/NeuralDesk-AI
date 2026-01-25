import OpenAI from 'openai'
import axios from 'axios'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'

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

  // Last resort: try Puppeteer to render the page and extract visible text
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
    // give some time for dynamic content
    await page.waitForTimeout(800)
    // Try to extract from common article selectors, fallback to body text
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
