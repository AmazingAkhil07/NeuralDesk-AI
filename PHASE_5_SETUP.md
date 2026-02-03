# Phase 5 Setup Instructions

## Quick Start Guide

### Step 1: Database Migration

Run this SQL in your Supabase dashboard (SQL Editor):

```sql
-- Copy the entire content of:
-- supabase/007_graveyard_vault_phase5_migration.sql
-- and paste it into the SQL editor, then click "Run"
```

**Verification:**
- Check tables exist: `idea_graveyard`, `vault`, `vault_tags`
- Check indexes are created
- Verify RLS policies are active

### Step 2: Test the Pages

Navigate to:
- http://localhost:3000/dashboard/graveyard
- http://localhost:3000/dashboard/vault

Both should load without errors (empty state is expected).

### Step 3: Optional - Test API Endpoints

Using a REST client (Postman, Thunder Client, curl):

```bash
# Get all graveyard entries (requires auth)
GET http://localhost:3000/api/graveyard

# Get all vault items (requires auth)
GET http://localhost:3000/api/vault

# Get vault tags
GET http://localhost:3000/api/vault/tags
```

### Step 4: Integrate with Existing Modules

To enable the full workflow:

1. **From Ideas Test Page:** Add "Archive to Graveyard" button to killed ideas
2. **From News Page:** Add "Save to Vault" button to articles
3. **From Models Page:** Add "Save to Vault" button to models
4. **From Tools Page:** Add "Save to Vault" button to tools

### Step 5: Deploy

```bash
# Build locally to verify no errors
npm run build

# Deploy to Vercel
git add .
git commit -m "Phase 5: Idea Graveyard & Knowledge Vault"
git push
```

---

## Feature Overview

### Idea Graveyard (`/dashboard/graveyard`)
- **Add ideas:** Ideas are archived here when killed from the test page
- **Search:** Find by idea name, learnings, or pivots
- **Filter:** By learning tags (market-gap, timing, differentiation, etc.)
- **Edit:** Update learnings, future pivots, and tags after archival
- **Stats:** See total archived, with learnings, and patterns

### Knowledge Vault (`/dashboard/vault`)
- **Add bookmarks:** Click "ADD TO VAULT" button or save from any module
- **Organize:** By source type (news, model, tool, idea, research, external)
- **Annotate:** Add personal notes and 5-star ratings
- **Search:** Find by title, notes, or content
- **Filter:** By source type or custom tags
- **Archive:** Hide old items but keep for reference

---

## Sidebar Navigation

Both pages are now in the sidebar:
- 🪦 Idea Graveyard
- 📚 Knowledge Vault

Located after the Ideas Hub for easy access.

---

## Database Schema Summary

### idea_graveyard table
```
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- idea_id: UUID (optional reference to original idea)
- idea_name, idea_one_liner, idea_problem, idea_solution
- final_score, recommendation, brutal_summary
- why_failed (required), lessons_learned, future_pivots
- learnings_tags (text array for pattern tracking)
- killed_at, created_at, updated_at timestamps
- RLS: Users only see their own entries
```

### vault table
```
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- title (required), url, content_excerpt, full_content
- source_type (news/model/tool/idea/external/research)
- source_id (optional reference to original item)
- personal_notes, tags (text array), rating (1-5)
- is_archived (boolean for active/archived toggle)
- created_at, updated_at timestamps
- RLS: Users only see their own entries
```

### vault_tags table
```
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- tag_name (unique per user), tag_color, tag_description
- usage_count (updated when tag is used)
- created_at, updated_at timestamps
- RLS: Users only see their own tags
```

---

## Common Tasks

### Archive a Killed Idea
1. Go to Ideas Hub
2. Find a killed idea (marked with KILL badge)
3. Click the "Archive to Graveyard" button (add this)
4. Fill in learnings form
5. Submit - idea appears in graveyard

### Save Content to Vault
1. From any page (News, Models, Tools)
2. Click "Save to Vault" button (add this)
3. Fill in title, notes, rating
4. Submit - item appears in vault

### Organize by Tags
1. Go to Knowledge Vault
2. Click "ADD TO VAULT"
3. Add custom tags in notes
4. Use tag filter to find related items

### Search Learnings
1. Go to Idea Graveyard
2. Search for keywords in idea name or lessons
3. Or filter by learning tags
4. Click to expand and read full learnings

---

## Customization Ideas

### For Graveyard
- Add AI-powered pattern analysis
- Generate insights about failure modes
- Export learnings as PDF report
- Share insights (private link)
- Leaderboard of lessons learned

### For Vault
- Add semantic search (embeddings)
- Create collections/folders
- Add vault insights dashboard
- Generate summaries from bookmarks
- Browser extension for quick save
- Email weekly digest

---

## Support

If you encounter issues:

1. **Database errors:** Check Supabase dashboard for errors in SQL execution
2. **API errors:** Check browser console (F12 → Console tab)
3. **UI not loading:** Clear cache (Ctrl+Shift+Delete) and refresh
4. **Auth errors:** Verify you're logged in and session is valid

---

**Phase 5 is ready! 🚀**
