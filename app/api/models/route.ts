import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { CreateModelInput, ModelsFilters } from '@/types/models';
import { Database } from '@/types/supabase';

type ModelInsert = Database['public']['Tables']['models']['Insert'];

// GET /api/models - List all models with optional filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const company = searchParams.get('company');
    const model_type = searchParams.get('model_type');
    const is_open_source = searchParams.get('is_open_source');
    const min_rating = searchParams.get('min_rating');

    // Start query - order by last_model_update to show newest models first
    let query = supabase
      .from('models')
      .select('*')
      .eq('user_id', user.id)
      .order('last_model_update', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (company) {
      query = query.eq('company', company);
    }

    if (model_type) {
      query = query.eq('model_type', model_type);
    }

    if (is_open_source !== null && is_open_source !== undefined) {
      query = query.eq('is_open_source', is_open_source === 'true');
    }

    if (min_rating) {
      query = query.gte('personal_rating', parseInt(min_rating));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching models:', error);
      return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/models:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/models - Create a new model
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateModelInput = await request.json();

    // Validate required fields
    if (!body.name || !body.company || !body.model_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, company, model_type' },
        { status: 400 }
      );
    }

    // Insert model
    const modelData: ModelInsert = {
      ...body,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('models')
      // @ts-ignore - Supabase types will be regenerated after migration
      .insert(modelData)
      .select()
      .single();

    if (error) {
      console.error('Error creating model:', error);
      return NextResponse.json({ error: 'Failed to create model' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/models:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
