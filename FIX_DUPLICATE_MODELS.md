# Fix Duplicate Models - Setup Instructions

## Problem
You're seeing duplicate model cards (multiple GPT-5, etc.) because:
1. The database had no unique constraint
2. Each sync created new entries instead of updating existing ones
3. Old models weren't being removed

## Solution
We've implemented:
1. **Database migration** to remove duplicates and add unique constraints
2. **UPSERT logic** that inserts new models OR updates existing ones
3. **Ordering by latest update date** so you always see the newest model info first

## Steps to Fix

### 1. Run the Migration
Navigate to your Supabase project dashboard and run the migration:

```bash
# Option A: Using Supabase CLI (recommended)
cd neuraldesk-app
supabase db push

# Option B: Manual - Copy and paste the SQL from this file into Supabase SQL Editor:
# neuraldesk-app/supabase/003_fix_duplicate_models.sql
```

### 2. Verify in Supabase Dashboard
1. Go to your Supabase project
2. Navigate to Table Editor → models
3. You should now see:
   - No duplicate models (only one GPT-5, one Claude 4, etc. per user)
   - Each model has unique (user_id + company + name)

### 3. Test the Fix
1. Refresh your models page in NeuralDesk
2. Click "Sync Latest Models" button
3. You should see:
   - No more duplicates
   - Models updated with latest info
   - Message showing "X new models added, Y updated"

### 4. Future Updates
From now on:
- ✅ New models will be added automatically
- ✅ Existing models will be updated (not duplicated)
- ✅ Always shows the most recent model information
- ✅ Models ordered by last update date (newest first)

## What Changed

### Database (003_fix_duplicate_models.sql)
- Removed all duplicate models (kept newest version)
- Added unique constraint: `unique_user_model (user_id, company, name)`
- Added index for faster lookups
- Added trigger to auto-update `updated_at` timestamp

### API Updates (route.ts)
- **update-models**: Uses proper upsert logic (insert if new, update if exists)
- **models API**: Orders by `last_model_update` date to show newest first

## Troubleshooting

### If you still see duplicates:
1. Make sure the migration ran successfully
2. Check Supabase logs for any errors
3. Try clearing your browser cache and refreshing

### If sync button doesn't work:
1. Check browser console for errors
2. Verify you're logged in
3. Check that the cron endpoint is accessible

## Need Help?
If you encounter any issues, check:
1. Supabase Dashboard → Logs for database errors
2. Browser Console (F12) for frontend errors
3. The migration file for SQL syntax errors
