import axios from 'axios'
import * as cheerio from 'cheerio'
import { extractiveSummaryFromUrl, isLLMUp, markLLMDown } from './aiService'

export interface NewsItem {
  title: string
  url: string
  source: string
  publishedAt: string
  tags: string[]
  summary?: string
}

/**
 * Generate AI summary using Groq API (FREE and FAST)
 */
async function generateSummary(title: string, url: string): Promise<string | undefined> {
  try {
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      console.warn('Groq API key not found, skipping AI summary')
      return undefined
    }

    // If LLMs are currently disabled (circuit breaker), skip to extractive fallback
    if (!isLLMUp()) {
      console.warn('Skipping Groq calls because LLMs are temporarily disabled; using extractive fallback')
      return await extractiveSummaryFromUrl(url) ?? undefined
    }

    // Retry with exponential backoff on rate limits
    let responseData: any = undefined
    const maxRetries = 2
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant', // Fast and FREE
            messages: [{
              role: 'user',
              content: `Summarize this AI/ML news article in 2-3 concise sentences. Focus on the key innovation or finding. Title: ${title}\nURL: ${url}`
            }],
            temperature: 0.3,
            max_tokens: 150,
          }),
        })

        if (!response.ok) {
          const status = response.status
          console.warn('Groq API attempt failed:', status)

          if (status === 429) {
            if (attempt < maxRetries) {
              const backoff = Math.pow(2, attempt + 1) * 1000
              console.warn(`Rate limited by Groq, retrying in ${backoff}ms (attempt ${attempt + 1})`)
              await new Promise((r) => setTimeout(r, backoff))
              continue
            } else {
              // Out of retries - mark LLMs down briefly and fall back
              console.warn('Groq returning 429 repeatedly; marking LLMs down and falling back to extractive')
              markLLMDown(5 * 60 * 1000)
              break
            }
          }

          // Non-rate-limit error
          throw new Error(`Groq API error: ${status}`)
        }

        responseData = await response.json()
        break
      } catch (err: any) {
        console.warn('Groq generate attempt failed:', err?.message)
        if (attempt >= maxRetries) {
          throw err
        }
      }
    }

    const summary = responseData?.choices?.[0]?.message?.content
    if (summary) return summary.trim()
  } catch (error) {
    console.error('Error generating summary with Groq:', error)

    // Try centralized extractive fallback (handles 403s and proxies)
    try {
      const fallback = await extractiveSummaryFromUrl(url)
      if (fallback) return fallback
    } catch (e) {
      console.error('Extractive fallback failed:', e)
    }

    return undefined
  }
}

// Reddit API - fetch posts from ML subreddits
export async function fetchRedditNews(): Promise<NewsItem[]> {
  const subreddits = ['MachineLearning', 'LocalLLaMA', 'artificial']
  const newsItems: NewsItem[] = []

  for (const subreddit of subreddits) {
    try {
      const response = await axios.get(
        `https://www.reddit.com/r/${subreddit}/hot.json?limit=10`,
        {
          headers: {
            'User-Agent': 'NeuralDesk/1.0.0',
          },
          timeout: 10000,
        }
      )

      const posts = response.data.data.children
      console.log(`✅ Fetched ${posts.length} posts from r/${subreddit}`)
      for (const post of posts) {
        const data = post.data
        // Filter out stickied posts and low-quality content
        if (!data.stickied && data.score > 20) { // Lowered score threshold for more news
          newsItems.push({
            title: data.title,
            url: data.url.startsWith('http') ? data.url : `https://reddit.com${data.permalink}`,
            source: `r/${subreddit}`,
            publishedAt: new Date(data.created_utc * 1000).toISOString(),
            tags: ['reddit', subreddit.toLowerCase()],
          })
        }
      }
    } catch (error: any) {
      console.error(`Error fetching from r/${subreddit}:`, error.message)
    }
  }

  return newsItems
}

// arXiv API - fetch recent ML papers
export async function fetchArXivNews(): Promise<NewsItem[]> {
  const newsItems: NewsItem[] = []

  try {
    const query = 'cat:cs.AI OR cat:cs.LG OR cat:cs.CL'
    const response = await axios.get(
      `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&start=0&max_results=10&sortBy=lastUpdatedDate&sortOrder=descending`,
      { timeout: 10000 }
    )

    const $ = cheerio.load(response.data, { xmlMode: true })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('entry').each((_: any, entry: any) => {
      const $entry = $(entry)
      const title = $entry.find('title').text().trim().replace(/\s+/g, ' ')
      const id = $entry.find('id').text().trim()
      const published = $entry.find('published').text().trim()

      newsItems.push({
        title,
        url: id,
        source: 'arXiv',
        publishedAt: new Date(published).toISOString(),
        tags: ['arxiv', 'research', 'paper'],
      })
    })
    console.log(`✅ Fetched ${newsItems.length} papers from arXiv`)
  } catch (error: any) {
    console.error('Error fetching from arXiv:', error.message)
  }

  return newsItems
}

// RSS Feed Parser - generic RSS parser for blogs
async function parseRSSFeed(url: string, sourceName: string, tags: string[]): Promise<NewsItem[]> {
  const newsItems: NewsItem[] = []

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'NeuralDesk/1.0.0',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data, { xmlMode: true })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('item').each((_: any, item: any) => {
      const $item = $(item)
      const title = $item.find('title').text().trim()
      const link = $item.find('link').text().trim()
      const pubDate = $item.find('pubDate').text().trim()

      if (title && link) {
        newsItems.push({
          title,
          url: link,
          source: sourceName,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          tags,
        })
      }
    })
    console.log(`✅ Fetched ${newsItems.length} items from ${sourceName}`)
  } catch (error: any) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error.message)
  }

  return newsItems
}

// OpenAI Blog
export async function fetchOpenAIBlog(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://openai.com/blog/rss.xml',
    'OpenAI Blog',
    ['openai', 'blog', 'company']
  )
}

// Anthropic Blog (Claude)
export async function fetchAnthropicBlog(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://www.anthropic.com/rss.xml',
    'Anthropic Blog',
    ['anthropic', 'claude', 'blog', 'company']
  )
}

// Google AI Blog (Gemini, DeepMind)
export async function fetchGoogleAIBlog(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://blog.google/technology/ai/rss/',
    'Google AI Blog',
    ['google', 'gemini', 'blog', 'company']
  )
}

// DeepMind Blog
export async function fetchDeepMindBlog(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://www.deepmind.com/blog/rss.xml',
    'DeepMind Blog',
    ['deepmind', 'google', 'research', 'blog']
  )
}

// Meta AI Blog
export async function fetchMetaAIBlog(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://ai.meta.com/blog/rss/',
    'Meta AI Blog',
    ['meta', 'llama', 'blog', 'company']
  )
}

// Mistral AI Blog
export async function fetchMistralAIBlog(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://mistral.ai/news/rss.xml',
    'Mistral AI Blog',
    ['mistral', 'blog', 'company']
  )
}

// Stability AI Blog
export async function fetchStabilityAIBlog(): Promise<NewsItem[]> {
  const newsItems: NewsItem[] = []

  try {
    const response = await axios.get('https://stability.ai/news', {
      headers: {
        'User-Agent': 'NeuralDesk/1.0.0',
      },
    })

    const $ = cheerio.load(response.data)

    // Parse news articles from Stability AI
    $('article').slice(0, 10).each((_: any, article: any) => {
      const $article = $(article)
      const title = $article.find('h2, h3').first().text().trim()
      const link = $article.find('a').first().attr('href')
      const date = $article.find('time').attr('datetime') || new Date().toISOString()

      if (title && link) {
        newsItems.push({
          title,
          url: link.startsWith('http') ? link : `https://stability.ai${link}`,
          source: 'Stability AI',
          publishedAt: new Date(date).toISOString(),
          tags: ['stability', 'image-generation', 'blog'],
        })
      }
    })
  } catch (error) {
    console.error('Error fetching from Stability AI:', error)
  }

  return newsItems
}

// Cohere AI Blog
export async function fetchCohereAIBlog(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://cohere.com/blog/rss.xml',
    'Cohere AI Blog',
    ['cohere', 'blog', 'company']
  )
}

// Perplexity AI Blog
export async function fetchPerplexityAIBlog(): Promise<NewsItem[]> {
  const newsItems: NewsItem[] = []

  try {
    const response = await axios.get('https://blog.perplexity.ai/', {
      headers: {
        'User-Agent': 'NeuralDesk/1.0.0',
      },
    })

    const $ = cheerio.load(response.data)

    // Parse blog posts
    $('article').slice(0, 10).each((_: any, article: any) => {
      const $article = $(article)
      const title = $article.find('h2, h3').first().text().trim()
      const link = $article.find('a').first().attr('href')

      if (title && link) {
        newsItems.push({
          title,
          url: link.startsWith('http') ? link : `https://blog.perplexity.ai${link}`,
          source: 'Perplexity AI',
          publishedAt: new Date().toISOString(),
          tags: ['perplexity', 'blog', 'search'],
        })
      }
    })
  } catch (error) {
    console.error('Error fetching from Perplexity AI:', error)
  }

  return newsItems
}

// VentureBeat Startup News
export async function fetchVentureBeatStartups(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://venturebeat.com/category/startups/feed/',
    'VentureBeat Startups',
    ['startups', 'business', 'industry']
  )
}

// Product Hunt AI Tools (using RSS if available or generic feed)
export async function fetchProductHuntAI(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://www.producthunt.com/feed?category=artificial-intelligence',
    'Product Hunt AI',
    ['tools', 'launch', 'new']
  )
}

// TechCrunch Funding News
export async function fetchTechCrunchFunding(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://techcrunch.com/category/startups/fundraising/feed/',
    'TechCrunch Funding',
    ['funding', 'investment', 'startups']
  )
}

// TechCrunch AI News
export async function fetchTechCrunchAI(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'TechCrunch AI',
    ['techcrunch', 'news', 'acquisitions']
  )
}

// VentureBeat AI News
export async function fetchVentureBeatAI(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://venturebeat.com/category/ai/feed/',
    'VentureBeat AI',
    ['venturebeat', 'news', 'industry']
  )
}

// The Verge AI
export async function fetchTheVergeAI(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    'The Verge AI',
    ['theverge', 'news', 'tech']
  )
}

// MIT Technology Review AI
export async function fetchMITTechReviewAI(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://www.technologyreview.com/topic/artificial-intelligence/feed/',
    'MIT Tech Review',
    ['mit', 'research', 'tech']
  )
}

// Wired AI
export async function fetchWiredAI(): Promise<NewsItem[]> {
  return parseRSSFeed(
    'https://www.wired.com/feed/tag/ai/latest/rss',
    'Wired AI',
    ['wired', 'news', 'tech']
  )
}

// HuggingFace Papers (using their daily papers page)
export async function fetchHuggingFacePapers(): Promise<NewsItem[]> {
  const newsItems: NewsItem[] = []

  try {
    const response = await axios.get('https://huggingface.co/papers', {
      headers: {
        'User-Agent': 'NeuralDesk/1.0.0',
      },
    })

    const $ = cheerio.load(response.data)

    // Parse the papers list (this is a simplified version)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('article').slice(0, 10).each((_: any, article: any) => {
      const $article = $(article)
      const title = $article.find('h3').text().trim()
      const link = $article.find('a').attr('href')

      if (title && link) {
        newsItems.push({
          title,
          url: link.startsWith('http') ? link : `https://huggingface.co${link}`,
          source: 'HuggingFace',
          publishedAt: new Date().toISOString(),
          tags: ['huggingface', 'paper', 'model'],
        })
      }
    })
  } catch (error) {
    console.error('Error fetching from HuggingFace:', error)
  }

  return newsItems
}

// Main aggregator function
export async function aggregateAllNews(): Promise<NewsItem[]> {
  console.log('Starting news aggregation from all sources...')

  console.log('Starting parallel news aggregation...')

  const [
    redditNews,
    arxivNews,
    openaiNews,
    anthropicNews,
    googleAINews,
    deepmindNews,
    metaAINews,
    mistralNews,
    stabilityNews,
    cohereNews,
    perplexityNews,
    techcrunchNews,
    techcrunchFunding,
    venturebeatNews,
    venturebeatStartups,
    vergeNews,
    mitTechNews,
    wiredNews,
    hfNews,
    phNews,
  ] = await Promise.all([
    fetchRedditNews(),
    fetchArXivNews(),
    fetchOpenAIBlog(),
    fetchAnthropicBlog(),
    fetchGoogleAIBlog(),
    fetchDeepMindBlog(),
    fetchMetaAIBlog(),
    fetchMistralAIBlog(),
    fetchStabilityAIBlog(),
    fetchCohereAIBlog(),
    fetchPerplexityAIBlog(),
    fetchTechCrunchAI(),
    fetchTechCrunchFunding(),
    fetchVentureBeatAI(),
    fetchVentureBeatStartups(),
    fetchTheVergeAI(),
    fetchMITTechReviewAI(),
    fetchWiredAI(),
    fetchHuggingFacePapers(),
    fetchProductHuntAI(),
  ])

  const allNews = [
    ...redditNews,
    ...arxivNews,
    ...openaiNews,
    ...anthropicNews,
    ...googleAINews,
    ...deepmindNews,
    ...metaAINews,
    ...mistralNews,
    ...stabilityNews,
    ...cohereNews,
    ...perplexityNews,
    ...techcrunchNews,
    ...techcrunchFunding,
    ...venturebeatNews,
    ...venturebeatStartups,
    ...vergeNews,
    ...mitTechNews,
    ...wiredNews,
    ...hfNews,
    ...phNews,
  ]

  console.log(`Aggregated ${allNews.length} total items from 20 sources`)

  // Filter out news older than 3 days (increased for safety buffer)
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const recentNews = allNews.filter((item) => {
    const publishDate = new Date(item.publishedAt)
    return publishDate >= threeDaysAgo
  })

  console.log(`After filtering (last 3 days): ${recentNews.length} items`)

  // Remove duplicates based on URL
  const uniqueNews = recentNews.filter(
    (item, index, self) => index === self.findIndex((t) => t.url === item.url)
  )

  console.log(`After deduplication: ${uniqueNews.length} unique items`)

  // Sort by publish date (newest first)
  uniqueNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return uniqueNews
}
