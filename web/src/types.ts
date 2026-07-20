export type PostStatus = 'idea' | 'da_fare' | 'programmato' | 'promemoria_inviato' | 'pubblicato'

export const STATUS_LABELS: Record<PostStatus, string> = {
  idea: 'Idea',
  da_fare: 'Da fare',
  programmato: 'Programmato',
  promemoria_inviato: 'Promemoria inviato',
  pubblicato: 'Pubblicato',
}

export interface Page {
  id: string
  name: string
  instagram_username: string | null
  notes: string | null
}

export interface Category {
  id: string
  page_id: string
  name: string
}

export interface Post {
  id: string
  page_id: string
  category_id: string | null
  caption: string
  media_paths: string[]
  scheduled_at: string
  status: PostStatus
  reminder_sent: boolean
  notes: string | null
  created_at: string
  category?: { name: string } | null
}

export interface ContentIdea {
  id: string
  page_id: string
  idea_text: string
  pillar: string | null
  used: boolean
}
