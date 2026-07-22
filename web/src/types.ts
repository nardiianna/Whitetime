export type PostStatus = 'idea' | 'da_fare' | 'programmato' | 'promemoria_inviato' | 'pubblicato'
export type PageType = 'client' | 'personal'

export const STATUS_LABELS: Record<PostStatus, string> = {
  idea: 'Idea',
  da_fare: 'Da fare',
  programmato: 'Programmato',
  promemoria_inviato: 'Promemoria inviato',
  pubblicato: 'Pubblicato',
}

export function statusLabel(status: PostStatus, isPersonal: boolean) {
  if (isPersonal && status === 'pubblicato') return 'Fatto'
  return STATUS_LABELS[status]
}

export interface Page {
  id: string
  name: string
  type: PageType
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
  reminder_error: string | null
  notes: string | null
  created_at: string
  category?: { name: string } | null
  page?: { name: string; type: PageType } | null
}

export interface ContentIdea {
  id: string
  page_id: string
  idea_text: string
  pillar: string | null
  used: boolean
}
