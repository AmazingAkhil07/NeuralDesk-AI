
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Or service role if needed, but anon simulates user if RLS allows or we use service role

const supabase = createClient(supabaseUrl, supabaseKey)

async function testIdeaCreation() {
    console.log('Testing connection to Supabase...')

    // 1. Check if table exists and has columns by selecting empty
    const { data: selectData, error: selectError } = await supabase
        .from('ideas')
        .select('*')
        .limit(1)

    if (selectError) {
        console.error('❌ SELECT failed:', selectError.message)
        return
    }
    console.log('✅ Connection successful. Table reachable.')

    // 2. Try to insert a dummy idea
    // Note: This might fail if RLS is on and we are not logged in.
    // We should try to use the SERVICE ROLE key if available in env, otherwise this test might be limited to public access check.
    // But usually .env.local has SUPABASE_SERVICE_ROLE_KEY.

    console.log('Skipping INSERT test because we need auth. Just checking schema via Select...')
    console.log('Columns found in select:', selectData ? 'Yes' : 'No details (empty table)')

    // Inspecting error object if column missing usually gives specific error on Select too if we select specific columns.
    // Let's try selecting specific columns we need.

    const { error: colError } = await supabase
        .from('ideas')
        .select('name, one_liner, problem, target_user, solution, why_ai')
        .limit(1)

    if (colError) {
        console.error('❌ Missing Columns:', colError.message)
    } else {
        console.log('✅ All required columns exist.')
    }
}

testIdeaCreation()
