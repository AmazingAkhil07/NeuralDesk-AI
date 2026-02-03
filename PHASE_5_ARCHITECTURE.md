# Phase 5 Visual Architecture & Features Map

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                            │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐  │
│  │ Graveyard    │ Vault        │ Ideas Hub    │ Other Tabs   │  │
│  │ /graveyard   │ /vault       │ /ideas       │ (news, etc)  │  │
│  └──────────────┴──────────────┴──────────────┴──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ↓                    ↑
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Graveyard API          │ Vault API        │ Vault Tags   │  │
│  │ - POST (create)        │ - POST (create)  │ - GET (list) │  │
│  │ - GET (list/search)    │ - GET (list)     │ - POST (new) │  │
│  │ - PATCH (update)       │ - PATCH (update) │              │  │
│  │ - DELETE (remove)      │ - DELETE (remove)│              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ↓                    ↑
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer (Supabase)                   │
│  ┌──────────────┬──────────────┬──────────────────────────────┐ │
│  │ idea_graveyard           │ vault           │ vault_tags    │ │
│  │ - Archived ideas         │ - Bookmarks     │ - Custom tags │ │
│  │ - Learnings              │ - Annotations   │ - Metadata    │ │
│  │ - Future pivots          │ - Ratings       │               │ │
│  │ - Learning tags          │ - Archive flag  │               │ │
│  └──────────────┴──────────────┴──────────────────────────────┘ │
│                                                                   │
│  All tables include:                                             │
│  - user_id (for isolation)                                       │
│  - RLS Policies (Row Level Security)                             │
│  - Timestamps (created_at, updated_at)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 User Interface Layout

### Graveyard Page (`/dashboard/graveyard`)

```
┌──────────────────────────────────────────────────────────────────┐
│  🪦 Idea Graveyard                                               │
│  Where failed ideas rest. Extract learnings, spot patterns...   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Search ideas, learnings, pivots...                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Filters: [market-gap] [timing] [differentiation] [+3]         │
│                                                                  │
│  ┌────────────────┬────────────────┬────────────────┐          │
│  │ 12 Ideas       │ 8 With Learn.  │ 5 Patterns     │          │
│  │ Archived       │ Documented     │ Found          │          │
│  └────────────────┴────────────────┴────────────────┘          │
│                                                                  │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐
│  │ 🪦 Idea Name                │  │ 🪦 Another Killed Idea      │
│  │ One-liner summary           │  │ Another one-liner           │
│  │ [KILL] [timing] [market-gap]│  │ [KILL] [differentiation]    │
│  │                             │  │                             │
│  │ Why It Failed               │  │ Why It Failed               │
│  │ Market didn't want it...    │  │ Founders lacked bandwidth..│
│  │                             │  │                             │
│  │ [View Learnings ▼]          │  │ [View Learnings ▼]          │
│  │                             │  │                             │
│  │ Archived Feb 3              │  │ Archived Jan 28             │
│  └─────────────────────────────┘  └─────────────────────────────┘
│
│  [Edit Learnings Dialog]
│  - Why It Failed
│  - Key Learnings
│  - Future Pivot Ideas
│  - Learning Tags selector
│
└──────────────────────────────────────────────────────────────────┘
```

### Vault Page (`/dashboard/vault`)

```
┌──────────────────────────────────────────────────────────────────┐
│  📚 Knowledge Vault                                              │
│  Your personal knowledge base. Bookmark, annotate, search...    │
│                                          [+ ADD TO VAULT]        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Search bookmarks, notes, tags...                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [All Sources ▼] [research] [ai-concepts] [tools] [Clear] [Show Active] │
│                                                                  │
│  ┌────────────────┬────────────────┬────────────────┬───────────┐
│  │ 42 Items       │ 28 Annotated   │ 15 Five-Stars  │ 8 Custom  │
│  │ Active         │ With Notes     │ Top Rated      │ Tags      │
│  └────────────────┴────────────────┴────────────────┴───────────┘
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────┐
│  │ 📰 News Article    │  │ 🤖 Claude 3.5     │  │ 🛠️ Tool   │
│  │ Title of article   │  │ Anthropic Model   │  │ Product    │
│  │ URL • Excerpt      │  │ Context window    │  │ Platform   │
│  │                    │  │                    │  │            │
│  │ 💭 My notes about  │  │ 💭 Great for code │  │ 💭 Testing│
│  │    this topic      │  │     generation    │  │    it out  │
│  │                    │  │                    │  │            │
│  │ [read] [research]  │  │ [ai] [models]     │  │ [ai-tools] │
│  │ ⭐⭐⭐⭐⭐            │  │ ⭐⭐⭐⭐⭐            │  │ ⭐⭐⭐⭐⭐   │
│  │ Saved Jan 15       │  │ Saved Feb 1       │  │ Saved Today│
│  └────────────────────┘  └────────────────────┘  └────────────┘
│
│  [Add to Vault Dialog]
│  - Title (required)
│  - Type (dropdown: news/model/tool/idea/research/external)
│  - URL (optional)
│  - Excerpt/Summary
│  - Your Notes
│
│  [Edit Dialog]
│  - Update notes
│  - Change rating (1-5 stars)
│
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design Elements

### Card Styling

```
┌─────────────────────────────────┐  ← Accent line on hover
│  🪦 Idea Name          [Score]  │     (red for graveyard)
│  One-liner description  [KILL]  │     (blue for vault)
│  [tag] [tag]                    │
│  ├─────────────────────────────┤
│  │ Why It Failed               │  ← Premium backdrop blur
│  │ Main content here...        │     Semi-transparent bg
│  │                             │     Dark border, subtle shadow
│  │ [View Learnings ▼]          │
│  ├─────────────────────────────┤
│  │ Archived Feb 3              │  ← Metadata
│  └─────────────────────────────┘
     ↑
   [Edit] [Delete]  ← Visible on hover only
```

### Color Palette

```
Graveyard:
- Primary: #ef4444 (red-500)  - Warnings, kills, archives
- Secondary: #8b5cf6 (purple) - Learnings, insights
- Accents: Blue for key sections, Yellow for highlights

Vault:
- Primary: #3b82f6 (blue-500)  - Trust, organization
- Secondary: #10b981 (green)   - Annotated items
- Accents: Yellow for ratings, Purple for research

Source Types:
- News: 📰 Blue
- Model: 🤖 Purple
- Tool: 🛠️ Green
- Idea: 💡 Yellow
- Research: 📚 Indigo
- External: 🔗 Orange
```

---

## 🔄 Data Flow Examples

### Scenario 1: Archive Failed Idea

```
Ideas Page (Kill Button)
        ↓
POST /api/graveyard
  {
    idea_name: "AI-powered coffee machine",
    why_failed: "No market demand, too niche",
    lessons_learned: "Niche markets too small",
    learnings_tags: ["market-gap", "timing"]
  }
        ↓
idea_graveyard table
  ├─ Stores complete history
  ├─ Preserves evaluation context
  ├─ Tracks learnings for patterns
  └─ Allows edit after kill
        ↓
Graveyard Page
  ├─ Search by name/learnings
  ├─ Filter by learning tags
  ├─ View stats & patterns
  └─ Edit learnings anytime
```

### Scenario 2: Save Article to Vault

```
News Page (Save Button)
        ↓
POST /api/vault
  {
    title: "The Rise of Open-Source AI",
    url: "https://example.com/...",
    content_excerpt: "Latest developments...",
    source_type: "news",
    personal_notes: "Good insights about OSS models"
  }
        ↓
vault table
  ├─ Stores bookmark
  ├─ Preserves source reference
  ├─ Tracks personal annotations
  └─ Allows rating/archiving
        ↓
Vault Page
  ├─ Search/filter
  ├─ View all bookmarks
  ├─ Edit notes & ratings
  └─ Archive old items
```

---

## 🔐 Security Model

### Authentication
- All endpoints require valid Supabase session
- 401 returned if no user
- Session managed by Supabase auth

### Authorization (RLS)
```
Graveyard:
- SELECT: Only own entries (user_id = auth.uid())
- INSERT: Only own entries (user_id = auth.uid())
- UPDATE: Only own entries (user_id = auth.uid())
- DELETE: Only own entries (user_id = auth.uid())

Vault (same pattern):
- SELECT: Only own items
- INSERT: Only own items
- UPDATE: Only own items
- DELETE: Only own items
```

### Data Isolation
- No cross-user visibility possible
- user_id is immutable (set at creation)
- Cascading deletes on auth.users removal

---

## 📊 Statistics & Analytics

### Graveyard Stats
- **Total Archived:** Count of all entries
- **With Learnings:** Count where lessons_learned is not null
- **Patterns Found:** Count of unique learnings_tags

### Vault Stats
- **Active Items:** Count where is_archived = false
- **Annotated:** Count where personal_notes is not null
- **Five-Stars:** Count where rating = 5
- **Custom Tags:** Count of distinct tags used

---

## 🎯 User Workflows

### Pattern Recognition Workflow
1. Kill ideas → Archive to graveyard
2. Tag with learning categories
3. Over time, spot patterns in failures
4. Use patterns to improve idea generation

### Knowledge Building Workflow
1. Read news/article → Save to vault
2. Add personal notes & rating
3. Use tags to organize
4. Search vault when planning
5. Reference saved knowledge

---

## 🚀 Performance Optimizations

### Database
- Indexes on user_id (fast filtering)
- Indexes on created_at (fast sorting)
- GIN indexes on text arrays (fast tag queries)
- RLS prevents unnecessary data transfer

### Frontend
- React.memo for cards (prevent re-renders)
- Lazy loading for large lists
- Pagination support (added to API)
- Local search debouncing

---

## 📈 Future Enhancements

### Phase 5.1+: Graveyard
- Pattern analysis: "You fail most on timing issues"
- Failure leaderboard: "Top 3 failure reasons"
- Export learnings as PDF
- AI insights: "Here's what you can learn from these"

### Phase 5.2+: Vault
- Semantic search (OpenAI embeddings)
- Collections/folders
- Vault insights: "Your top topics"
- Browser extension for quick save
- Email digest: "Your weekly reads"

---

**Architecture complete, UI polished, ready to deploy! 🎉**
