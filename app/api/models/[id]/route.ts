import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { UpdateModelInput } from '@/types/models';
import { Database } from '@/types/supabase';

type ModelUpdate = Database['public']['Tables']['models']['Update'];

// GET /api/models/[id] - Get a single model by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching model:', error);
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/models/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/models/[id] - Update a model
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: Partial<UpdateModelInput> = await request.json();

    // Remove id from body if present
    const { id, ...updateData } = body;

    const modelUpdate: ModelUpdate = updateData;

    const { data, error } = await supabase
      .from('models')
      // @ts-ignore - Supabase types will be regenerated after migration
      .update(modelUpdate)
      .eq('id', paramId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating model:', error);
      return NextResponse.json({ error: 'Failed to update model' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH /api/models/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/models/[id] - Delete a model
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('models')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting model:', error);
      return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Model deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/models/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
