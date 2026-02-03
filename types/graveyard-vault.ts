export interface GraveyardEntry {
  id: string
  user_id: string
  idea_id?: string
  idea_name: string
  idea_one_liner?: string
  idea_problem?: string
  idea_solution?: string
  idea_target_user?: string
  final_score?: number
  recommendation?: string
  brutal_summary?: string
  why_failed: string
  lessons_learned?: string
  future_pivots?: string
  learnings_tags: string[]
  killed_at: string
  created_at: string
  updated_at: string
}

export interface VaultItem {
  id: string
  user_id: string
  title: string
  url?: string
  content_excerpt?: string
  full_content?: string
  source_type: 'news' | 'model' | 'tool' | 'idea' | 'external' | 'research'
  source_id?: string
  personal_notes?: string
  tags: string[]
  rating?: number
  embedding_id?: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface VaultTag {
  id: string
  user_id: string
  tag_name: string
  tag_color: 'blue' | 'purple' | 'green' | 'yellow' | 'red' | 'pink' | 'orange' | 'cyan'
  tag_description?: string
  usage_count: number
  created_at: string
  updated_at: string
}
