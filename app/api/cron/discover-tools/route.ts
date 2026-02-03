import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';

interface DiscoveredTool {
  name: string;
  description: string;
  category: string;
  url: string;
  pricing_model: 'free' | 'freemium' | 'paid' | 'subscription';
  rating: number;
}

/**
 * Safely parse hostname from URL string.
 * Falls back to empty string if URL is malformed.
 */
function safeParseHostname(urlString: string): string {
  try {
    return new URL(urlString).hostname || '';
  } catch (error) {
    console.warn(`Failed to parse hostname from URL: ${urlString}`, error);
    return '';
  }
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate GROQ_API_KEY is configured
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY environment variable is not configured');
    return NextResponse.json({ 
      error: 'GROQ_API_KEY not configured' 
    }, { status: 500 });
  }

  try {
    // Call Groq API to discover new AI tools (Free tier - no credits needed)
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an AI tool discovery expert. Your job is to identify the latest and most innovative AI tools that have come online recently (last 2-4 weeks).

Return ONLY valid JSON array with this exact structure. No markdown, no code blocks, just pure JSON.

Categories: Coding & Dev, Image Generation, Video Generation, Audio & Music, Writing & Research, Creative/Vibe, Experimental/Agents, Design, Data & Analytics, Productivity, Marketing, Research, Security, SEO

Format:
[{"name":"Tool Name","description":"Short description","category":"Category","url":"https://example.com","pricing_model":"freemium","rating":8}]`
          },
          {
            role: 'user',
            content: `Find 5-10 new AI tools launched or trending in the past 2-4 weeks. Include tools like CodeRabbit, Swimm, code analysis tools, design tools, video generation tools, productivity tools, automation tools, etc. Make sure they're real tools with actual working URLs. Return ONLY the JSON array, nothing else.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const groqResult = await groqResponse.json();
    
    if (!groqResult.choices?.[0]?.message?.content) {
      return NextResponse.json({ 
        error: 'Failed to get discovery response from Groq',
        details: {
          hasChoices: !!groqResult.choices,
          statusDescription: 'API returned empty or malformed response'
        }
      }, { status: 500 });
    }

    // Parse the response
    let content = groqResult.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    let discoveredTools: DiscoveredTool[] = [];
    try {
      discoveredTools = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse Groq response:', content);
      return NextResponse.json({ 
        error: 'Failed to parse tool data',
        details: {
          parseError: 'Invalid JSON format received'
        }
      }, { status: 500 });
    }

    if (!Array.isArray(discoveredTools)) {
      return NextResponse.json({ 
        error: 'Invalid response format - expected array',
        details: {
          expectedType: 'array',
          receivedType: typeof discoveredTools
        }
      }, { status: 500 });
    }

    // Insert discovered tools into database
    const supabase = await createClient();
    const supabaseAny: any = supabase;

    // Get system account for tools (deterministic approach using a known identifier)
    // First, try to find a 'service' or 'system' account
    const { data: systemUsers } = await supabaseAny
      .from('profiles')
      .select('id')
      .eq('email', 'system@neuraldesk.local')
      .limit(1);

    // Fallback: get the first profile (typically the app creator)
    let userId: string | null = null;
    if (systemUsers && systemUsers.length > 0) {
      userId = systemUsers[0].id;
    } else {
      const { data: firstUser } = await supabaseAny
        .from('profiles')
        .select('id')
        .limit(1);

      if (firstUser && firstUser.length > 0) {
        userId = firstUser[0].id;
      }
    }

    if (!userId) {
      return NextResponse.json({ 
        error: 'No profiles found in database to associate tools with'
      }, { status: 400 });
    }

    let insertedCount = 0;
    let errors: string[] = [];

    for (const tool of discoveredTools) {
      // Check if tool already exists
      const { data: existing } = await supabaseAny
        .from('tools')
        .select('id')
        .eq('name', tool.name)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`Tool ${tool.name} already exists, skipping`);
        continue;
      }

      // Safely parse hostname for logo_url (with fallback on parse failure)
      const hostname = safeParseHostname(tool.url);
      const logoUrl = hostname 
        ? `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`
        : '';

      // Insert new tool (cast to any to bypass strict type checking for dynamic fields)
      const insertResult: any = await supabaseAny
        .from('tools')
        .insert([
          {
            name: tool.name,
            description: tool.description,
            category: tool.category,
            url: tool.url,
            pricing_model: tool.pricing_model,
            rating: Math.max(1, Math.min(10, tool.rating || 7)),
            status: 'Active',
            user_id: userId,
            logo_url: logoUrl,
          }
        ]);
      
      const { error } = insertResult;

      if (error) {
        errors.push(`Failed to insert ${tool.name}: ${error.message}`);
        console.error(`Error inserting tool ${tool.name}:`, error);
      } else {
        insertedCount++;
        console.log(`✅ Inserted tool: ${tool.name}`);
      }
    }

    return NextResponse.json({
      success: true,
      discovered: discoveredTools.length,
      inserted: insertedCount,
      errors: errors.length > 0 ? errors : undefined,
      tools: discoveredTools,
    });

  } catch (error) {
    console.error('Tool discovery error:', error);
    return NextResponse.json({ 
      error: 'Tool discovery failed',
      details: error instanceof Error ? { message: error.message } : { message: 'Unknown error' }
    }, { status: 500 });
  }
}
