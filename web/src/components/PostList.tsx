import { STATUS_LABELS } from '../types'
import type { Post } from '../types'

interface Props {
  posts: Post[]
  onEdit: (post: Post) => void
  onDelete: (post: Post) => void
  onMarkPublished: (post: Post) => void
}

const STATUS_STYLES: Record<string, string> = {
  idea: 'bg-white text-brand-600 border border-brand-200',
  da_fare: 'bg-brand-50 text-brand-600',
  programmato: 'bg-brand-100 text-brand-700',
  promemoria_inviato: 'bg-brand-200 text-brand-800',
  pubblicato: 'bg-brand-300 text-neutral-800 font-medium',
}

export function PostList({ posts, onEdit, onDelete, onMarkPublished }: Props) {
  if (posts.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-500">
        Nessun post pianificato. Aggiungine uno con "+ Nuovo post".
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {posts.map((post) => (
        <li
          key={post.id}
          className="flex items-center gap-3 rounded-lg border border-brand-100 bg-white p-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-900">
                {new Date(post.scheduled_at).toLocaleString('it-IT', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[post.status]}`}>
                {STATUS_LABELS[post.status]}
              </span>
            </div>
            <p className="truncate text-sm text-neutral-600">
              {post.caption || '(nessuna caption)'}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {post.status !== 'pubblicato' && (
              <button
                onClick={() => onMarkPublished(post)}
                className="rounded-md border border-brand-200 px-2 py-1 text-xs text-brand-700"
              >
                Segna pubblicato
              </button>
            )}
            <button
              onClick={() => onEdit(post)}
              className="rounded-md border border-brand-200 px-2 py-1 text-xs text-brand-700"
            >
              Modifica
            </button>
            <button
              onClick={() => onDelete(post)}
              className="rounded-md border border-brand-300 px-2 py-1 text-xs text-brand-800"
            >
              Elimina
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
