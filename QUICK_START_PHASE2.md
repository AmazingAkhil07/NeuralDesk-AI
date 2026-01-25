# Quick Start: Phase 2 Migration

## 🚀 3-Step Setup (5 minutes)

### Step 1: Apply Migration to Supabase

1. Go to https://supabase.com/dashboard
2. Select your NeuralDesk project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy ALL content from `supabase/002_models_phase2_migration.sql`
6. Paste into the SQL Editor
7. Click "Run" button (or press Ctrl/Cmd + Enter)
8. Verify you see "Success. No rows returned"

### Step 2: Get Your User ID

1. In the same SQL Editor, click "New Query"
2. Run this query (replace with your email):
```sql
SELECT id FROM auth.users WHERE email = 'your-email@example.com';
```
3. Copy the UUID returned (e.g., `550e8400-e29b-41d4-a716-446655440000`)

### Step 3: Seed Model Data (Optional)

1. Open `supabase/seed_models.sql` in your code editor
2. Press Ctrl/Cmd + F to find `{user_id}`
3. Replace ALL 20+ instances with your UUID from Step 2
4. Copy the entire modified content
5. Paste into Supabase SQL Editor
6. Click "Run"
7. Verify you see "Success" with row count

## ✅ Verify It Worked

1. In Supabase, go to "Table Editor"
2. Click on the "models" table
3. You should see 20+ models populated

## 🎉 Start Using

1. Go to http://localhost:3000/models
2. You should see all your models!
3. Try adding, editing, searching, and filtering

## 🐛 Troubleshooting

**Issue**: Migration fails with "relation already exists"
- **Fix**: The migration script drops the table first, but if it fails, manually drop: `DROP TABLE IF EXISTS public.models CASCADE;` then rerun

**Issue**: Can't see any models after seeding
- **Fix**: Double-check you replaced {user_id} correctly. Run Step 2 again to verify your user ID.

**Issue**: "Unauthorized" when viewing models
- **Fix**: Log out and log back in to refresh your session

## 📚 Full Documentation

- See `PHASE_2_SETUP.md` for detailed setup guide
- See `PHASE_2_COMPLETE.md` for implementation details
- See `IMPLEMENTATION_PLAN.md` for project roadmap

---

**Estimated Time**: 5 minutes  
**Difficulty**: Easy (Copy & Paste)  
**Required**: Database migration (Step 1)  
**Optional**: Seed data (Step 3)
