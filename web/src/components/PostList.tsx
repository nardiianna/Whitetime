import { STATUS_LABELS } from '../types'
import type { Post } from '../types'

interface Props {
  posts: Post[]
  onEdit: (post: Post) => void
  onDelete: (post: Post) => void
  onMarkPublished: (post: Post) => void
}

const STATUS_STYLES: Record<string, string> = {
  idea: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  da_fare: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  programmato: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  promemoria_inviato: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  pubblicato: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
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
          className="flex items-center gap-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
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
            <p className="truncate text-sm text-neutral-600 dark:text-neutral-400">
              {post.caption || '(nessuna caption)'}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {post.status !== 'pubblicato' && (
              <button
                onClick={() => onMarkPublished(post)}
                className="rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-xs"
              >
                Segna pubblicato
              </button>
            )}
            <button
              onClick={() => onEdit(post)}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-xs"
            >
              Modifica
            </button>
            <button
              onClick={() => onDelete(post)}
              className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600"
            >
              Elimina
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
