# Phase 5 Integration Checklist

This document outlines optional integrations to create a seamless workflow between existing modules and the new Graveyard/Vault systems.

---

## 🔗 Optional Integrations

### 1. Ideas Hub → Graveyard Integration

**Current:** Ideas can have KILL recommendation but stay in ideas list  
**Enhanced:** Add "Archive to Graveyard" button for killed ideas

**Location:** `app/dashboard/ideas/page.tsx` or `app/dashboard/ideas/[id]/page.tsx`

**Implementation:**

```tsx
// In IdeaCard or idea detail view
<Dialog>
  <DialogTrigger>
    <Button className="bg-red-500/10 text-red-500">
      ARCHIVE TO GRAVEYARD
    </Button>
  </DialogTrigger>
  <DialogContent>
    <form onSubmit={handleArchive}>
      <Textarea 
        label="Why was this killed?"
        placeholder="This idea failed because..."
      />
      <Textarea 
        label="What did you learn?"
        placeholder="Key insights from this failure..."
      />
      <Textarea 
        label="Future pivot ideas?"
        placeholder="Could this pivot as..."
      />
      <TagSelector 
        label="Learning tags"
        options={learningTags}
      />
      <Button>Archive to Graveyard</Button>
    </form>
  </DialogContent>
</Dialog>

async function handleArchive(formData) {
  // Get idea data from current context
  const response = await fetch('/api/graveyard', {
    method: 'POST',
    body: JSON.stringify({
      idea_id: currentIdea.id,
      idea_name: currentIdea.name,
      idea_one_liner: currentIdea.one_liner,
      idea_problem: currentIdea.problem,
      idea_solution: currentIdea.solution,
      idea_target_user: currentIdea.target_user,
      final_score: currentIdea.score,
      recommendation: 'Kill',
      brutal_summary: currentIdea.brutal_summary,
      ...formData,
    }),
  })
  
  // Optionally: mark idea as archived in ideas table
  // (or just show it's in graveyard)
  
  toast.success('Idea archived to graveyard')
  navigate('/dashboard/graveyard')
}
```

**Workflow:**
1. Review idea with KILL recommendation
2. Click "Archive to Graveyard"
3. Fill in learnings form
4. Get redirected to graveyard
5. View alongside other failures

---

### 2. News Page → Vault Integration

**Current:** News articles displayed, no save option  
**Enhanced:** "Save to Vault" button for bookmarking articles

**Location:** `app/dashboard/news/page.tsx` (NewsCard component)

**Implementation:**

```tsx
// In NewsCard component
<Button 
  variant="ghost"
  onClick={() => handleSaveNews(news)}
  className="hover:text-blue-500"
>
  <Bookmark className="h-4 w-4" />
</Button>

async function handleSaveNews(newsItem: any) {
  const response = await fetch('/api/vault', {
    method: 'POST',
    body: JSON.stringify({
      title: newsItem.title,
      url: newsItem.url,
      content_excerpt: newsItem.summary || newsItem.content,
      source_type: 'news',
      source_id: newsItem.id,
      personal_notes: '',
      tags: newsItem.tags || [],
    }),
  })
  
  if (response.ok) {
    toast.success('Saved to Knowledge Vault')
  }
}
```

**Workflow:**
1. Browse news feed
2. Click bookmark icon
3. Auto-saves with article content
4. Can optionally add notes in vault
5. Search vault later for specific topics

---

### 3. Models Page → Vault Integration

**Current:** Model cards with details  
**Enhanced:** "Save to Vault" button for bookmarking models

**Location:** `components/models/ModelCard.tsx`

**Implementation:**

```tsx
<Button
  variant="ghost"
  onClick={() => handleSaveModel(model)}
  className="hover:text-purple-500"
>
  <Bookmark className="h-4 w-4" />
</Button>

async function handleSaveModel(model: any) {
  const modelSummary = `
    Context: ${model.context_length}
    Type: ${model.model_type}
    Strengths: ${model.strengths}
    Weaknesses: ${model.weaknesses}
  `.trim()
  
  const response = await fetch('/api/vault', {
    method: 'POST',
    body: JSON.stringify({
      title: model.name,
      url: model.url,
      content_excerpt: modelSummary,
      source_type: 'model',
      source_id: model.id,
      personal_notes: '',
      tags: [model.company, model.model_type],
    }),
  })
  
  if (response.ok) {
    toast.success('Model saved to vault')
  }
}
```

**Workflow:**
1. Browse models
2. Find interesting model
3. Click bookmark
4. Auto-saves model details
5. Add personal rating/notes in vault
6. Quick reference when choosing models

---

### 4. Tools Page → Vault Integration

**Current:** Tool cards with categories  
**Enhanced:** "Save to Vault" button for bookmarking tools

**Location:** `components/tools/ToolCard.tsx`

**Implementation:**

```tsx
<Button
  variant="ghost"
  onClick={() => handleSaveTool(tool)}
  className="hover:text-green-500"
>
  <Bookmark className="h-4 w-4" />
</Button>

async function handleSaveTool(tool: any) {
  const toolSummary = `
    Category: ${tool.category}
    Pricing: ${tool.pricing_model}
    Status: ${tool.status}
    Pros: ${tool.pros?.join(', ')}
    Cons: ${tool.cons?.join(', ')}
  `.trim()
  
  const response = await fetch('/api/vault', {
    method: 'POST',
    body: JSON.stringify({
      title: tool.name,
      url: tool.url,
      content_excerpt: toolSummary,
      source_type: 'tool',
      source_id: tool.id,
      personal_notes: '',
      tags: [tool.category, ...tool.features],
    }),
  })
  
  if (response.ok) {
    toast.success('Tool saved to vault')
  }
}
```

**Workflow:**
1. Explore tools
2. Find useful tool
3. Click bookmark
4. Saves with details
5. Rate and add notes
6. Reference later when building

---

### 5. Custom Hook for Vault Saving

**Create:** `hooks/useVaultSave.ts`

```tsx
import { useState } from 'react'
import { toast } from 'sonner'

export function useVaultSave() {
  const [loading, setLoading] = useState(false)

  const saveToVault = async (
    title: string,
    sourceType: 'news' | 'model' | 'tool' | 'idea' | 'external' | 'research',
    options?: {
      url?: string
      content_excerpt?: string
      source_id?: string
      personal_notes?: string
      tags?: string[]
    }
  ) => {
    setLoading(true)
    try {
      const response = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          source_type: sourceType,
          ...options,
        }),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast.success(`"${title}" saved to Knowledge Vault`)
      return await response.json()
    } catch (error) {
      toast.error('Failed to save to vault')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { saveToVault, loading }
}
```

**Usage:**
```tsx
const { saveToVault, loading } = useVaultSave()

// Anywhere in components:
await saveToVault('Article Title', 'news', {
  url: 'https://...',
  content_excerpt: 'Summary...',
  tags: ['ai', 'research']
})
```

---

## 📋 Implementation Priority

### Phase 5 (Current)
- ✅ Graveyard system complete
- ✅ Vault system complete
- ✅ Navigation integrated

### Phase 5.1 (Optional, Recommended)
- [ ] Ideas → Graveyard integration (high value)
- [ ] Create `useVaultSave` hook
- [ ] News → Vault integration
- [ ] Models → Vault integration
- [ ] Tools → Vault integration

### Phase 5.2+ (Future)
- [ ] Semantic search in vault
- [ ] AI-powered pattern analysis in graveyard
- [ ] Export/analytics dashboards
- [ ] Browser extension for vault

---

## 🎯 Integration Benefits

### For Graveyard
- Full workflow from Idea Test → Kill → Archive → Learn
- Preserve evaluation context
- Build pattern library of failures
- Improve future idea generation

### For Vault
- One-click bookmarking from any module
- Centralized knowledge base
- Cross-module insights (news + models + tools)
- Personal annotations and ratings
- Quick reference when building

---

## 🚀 Implementation Effort

| Task | Effort | Value | Priority |
|------|--------|-------|----------|
| Ideas → Graveyard | 1-2 hrs | HIGH | 1 |
| useVaultSave hook | 30 min | HIGH | 2 |
| News → Vault | 30 min | MEDIUM | 3 |
| Models → Vault | 30 min | MEDIUM | 4 |
| Tools → Vault | 30 min | MEDIUM | 5 |
| **Total** | **~3.5 hrs** | - | - |

---

## 📝 Code Templates

### Template 1: Simple Save Button

```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={async () => {
    await fetch('/api/vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: item.title,
        url: item.url,
        content_excerpt: item.description,
        source_type: 'external',
        tags: item.tags || [],
      }),
    })
    toast.success('Saved to vault')
  }}
>
  <Bookmark className="h-4 w-4" />
</Button>
```

### Template 2: Save with Dialog

```tsx
const [isOpen, setIsOpen] = useState(false)
const [notes, setNotes] = useState('')

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button variant="ghost">Save</Button>
  </DialogTrigger>
  <DialogContent>
    <Textarea
      placeholder="Add notes..."
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
    />
    <Button
      onClick={async () => {
        await fetch('/api/vault', {
          method: 'POST',
          body: JSON.stringify({
            title: item.title,
            personal_notes: notes,
            source_type: 'external',
          }),
        })
        setIsOpen(false)
      }}
    >
      Save to Vault
    </Button>
  </DialogContent>
</Dialog>
```

---

## 🎨 UI Consistency

All "Save to Vault" buttons should:
- Use 📚 Bookmark icon
- Use blue-500 color (#3b82f6)
- Show tooltip "Save to Knowledge Vault"
- Appear on hover (like delete buttons)
- Show success toast on click

---

**Ready to integrate! These are all optional but highly recommended for full workflow integration. Start with Ideas → Graveyard for maximum value.** ✅
