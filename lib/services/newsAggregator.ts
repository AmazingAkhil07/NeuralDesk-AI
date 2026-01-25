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
 * Generate AI summary using Gemini API
 */
async function generateSummary(title: string, url: string): Promise<string | undefined> {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY
    
    if (!apiKey || apiKey === 'your_google_ai_api_key_here') {
      return undefined
    }

    // If LLMs are currently disabled (circuit breaker), skip to extractive fallback
    if (!isLLMUp()) {
      console.warn('Skipping Gemini calls because LLMs are temporarily disabled; using extractive fallback')
      return await extractiveSummaryFromUrl(url) ?? undefined
    }

    // Retry with exponential backoff on 429
    let response: any = undefined
    const maxRetries = 2
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            contents: [{
              parts: [{
                text: `Summarize this AI/ML news article in 2-3 concise sentences. Focus on the key innovation or finding. Title: ${title}\nURL: ${url}`
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 150,
            }
          },
          {
            timeout: 10000 // 10 second timeout
          }
        )
        break
      } catch (err: any) {
        const status = err?.response?.status
        console.warn('Gemini generate attempt failed:', status || err?.code || err?.message)
        if (status === 429) {
          if (attempt < maxRetries) {
            const backoff = Math.pow(2, attempt + 1) * 1000
            console.warn(`Rate limited by Gemini, retrying in ${backoff}ms (attempt ${attempt + 1})`)
            await new Promise((r) => setTimeout(r, backoff))
            continue
          } else {
            // Out of retries - mark LLMs down briefly and fall back
            console.warn('Gemini returning 429 repeatedly; marking LLMs down and falling back to extractive')
            markLLMDown(5 * 60 * 1000)
            response = undefined
            break
          }
        }
        // non-rate-limit error: rethrow so outer catch will handle fallback
        throw err
      }
    }

    const summary = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (summary) return summary?.trim()
  } catch (error) {
    console.error('Error generating summary:', error)

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
        }
      )

      const posts = response.data.data.children
      for (const post of posts) {
        const data = post.data
        // Filter out stickied posts and low-quality content
        if (!data.stickied && data.score > 50) {
          newsItems.push({
            title: data.title,
            url: data.url.startsWith('http') ? data.url : `https://reddit.com${data.permalink}`,
            source: `r/${subreddit}`,
            publishedAt: new Date(data.created_utc * 1000).toISOString(),
            tags: ['reddit', subreddit.toLowerCase()],
          })
        }
      }
    } catch (error) {
      console.error(`Error fetching from r/${subreddit}:`, error)
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
      `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&start=0&max_results=10&sortBy=lastUpdatedDate&sortOrder=descending`
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
  } catch (error) {
    console.error('Error fetching from arXiv:', error)
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
  } catch (error) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error)
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
    venturebeatNews,
    vergeNews,
    mitTechNews,
    wiredNews,
    hfNews,
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
    fetchVentureBeatAI(),
    fetchTheVergeAI(),
    fetchMITTechReviewAI(),
    fetchWiredAI(),
    fetchHuggingFacePapers(),
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
    ...venturebeatNews,
    ...vergeNews,
    ...mitTechNews,
    ...wiredNews,
    ...hfNews,
  ]

  console.log(`Aggregated ${allNews.length} news items from 17 sources`)
  
  // Filter out news older than 2 days
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  
  const recentNews = allNews.filter((item) => {
    const publishDate = new Date(item.publishedAt)
    return publishDate >= twoDaysAgo
  })
  
  console.log(`After filtering (last 2 days): ${recentNews.length} recent items`)
  
  // Remove duplicates based on URL
  const uniqueNews = recentNews.filter(
    (item, index, self) => index === self.findIndex((t) => t.url === item.url)
  )

  console.log(`After deduplication: ${uniqueNews.length} unique items`)

  // Sort by publish date (newest first)
  uniqueNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  // Generate summaries for top 10 news using Gemini with a small concurrency limit
  console.log('Generating AI summaries with Gemini (concurrency=3)...')
  const topNews = uniqueNews.slice(0, 10)

  const concurrency = 3
  for (let i = 0; i < topNews.length; i += concurrency) {
    const batch = topNews.slice(i, i + concurrency)
    await Promise.all(
      batch.map(async (item) => {
        if (!item.summary) {
          const summary = await generateSummary(item.title, item.url)
          if (summary) item.summary = summary
        }
      })
    )
    // small pause between batches
    if (i + concurrency < topNews.length) await new Promise((r) => setTimeout(r, 500))
  }

  console.log(`Generated summaries for ${topNews.filter((n) => n.summary).length} articles`)

  return uniqueNews
}
