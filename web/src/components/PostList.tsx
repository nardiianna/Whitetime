import { STATUS_LABELS } from '../types'
import type { Post } from '../types'

interface Props {
  posts: Post[]
  onEdit: (post: Post) => void
  onDelete: (post: Post) => void
  onMarkPublished: (post: Post) => void
}

const STATUS_STYLES: Record<string, string> = {
  idea: 'bg-white text-pink-400 border border-pink-200',
  da_fare: 'bg-pink-50 text-pink-500',
  programmato: 'bg-pink-100 text-pink-600',
  promemoria_inviato: 'bg-pink-200 text-pink-700',
  pubblicato: 'bg-pink-400 text-white',
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
          className="flex items-center gap-3 rounded-lg border border-pink-100 bg-white p-3"
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
                className="rounded-md border border-pink-200 px-2 py-1 text-xs text-pink-600"
              >
                Segna pubblicato
              </button>
            )}
            <button
              onClick={() => onEdit(post)}
              className="rounded-md border border-pink-200 px-2 py-1 text-xs text-pink-600"
            >
              Modifica
            </button>
            <button
              onClick={() => onDelete(post)}
              className="rounded-md border border-pink-300 px-2 py-1 text-xs text-pink-700"
            >
              Elimina
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
