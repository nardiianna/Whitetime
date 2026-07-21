import { STATUS_LABELS } from '../types'
import type { Post } from '../types'

interface Props {
  posts: Post[]
  weekStart: Date
  onPrevWeek: () => void
  onNextWeek: () => void
  onToday: () => void
  onEdit: (post: Post) => void
  onDelete: (post: Post) => void
  onMarkPublished: (post: Post) => void
  onDuplicate: (post: Post) => void
  onQuickAdd: (date: Date) => void
}

const STATUS_STYLES: Record<string, string> = {
  idea: 'bg-white text-brand-600 border border-brand-200',
  da_fare: 'bg-brand-50 text-brand-600',
  programmato: 'bg-brand-100 text-brand-700',
  promemoria_inviato: 'bg-brand-200 text-brand-800',
  pubblicato: 'bg-brand-300 text-neutral-800 font-medium',
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function WeekCalendar({
  posts,
  weekStart,
  onPrevWeek,
  onNextWeek,
  onToday,
  onEdit,
  onDelete,
  onMarkPublished,
  onDuplicate,
  onQuickAdd,
}: Props) {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd = days[6]

  const rangeLabel = `${weekStart.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} – ${weekEnd.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onPrevWeek}
          className="rounded-md border border-brand-200 px-2 py-1 text-sm text-brand-700"
          aria-label="Settimana precedente"
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-800">{rangeLabel}</span>
          <button
            onClick={onToday}
            className="rounded-full border border-brand-200 px-2 py-0.5 text-xs text-brand-700"
          >
            Oggi
          </button>
        </div>
        <button
          onClick={onNextWeek}
          className="rounded-md border border-brand-200 px-2 py-1 text-sm text-brand-700"
          aria-label="Settimana successiva"
        >
          ›
        </button>
      </div>

      {days.map((day) => {
        const dayPosts = posts.filter((post) => isSameDay(new Date(post.scheduled_at), day))
        const isToday = isSameDay(day, today)

        return (
          <div key={day.toISOString()} className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-semibold ${isToday ? 'text-brand-700' : 'text-neutral-700'}`}
              >
                {day.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                {isToday && <span className="ml-2 rounded-full bg-brand-200 px-2 py-0.5 text-xs">Oggi</span>}
              </span>
              <button
                onClick={() => onQuickAdd(day)}
                className="rounded-full border border-dashed border-brand-300 px-2 py-0.5 text-xs text-brand-700"
              >
                + post
              </button>
            </div>

            {dayPosts.length === 0 ? (
              <p className="pl-1 text-xs text-neutral-400">Nessun post</p>
            ) : (
              <ul className="space-y-2">
                {dayPosts.map((post) => (
                  <li
                    key={post.id}
                    className="flex flex-col gap-3 rounded-lg border border-brand-100 bg-white p-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900">
                          {new Date(post.scheduled_at).toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[post.status]}`}>
                          {STATUS_LABELS[post.status]}
                        </span>
                        {post.category?.name && (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">
                            {post.category.name}
                          </span>
                        )}
                        {post.reminder_error && (
                          <span
                            className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700"
                            title={post.reminder_error}
                          >
                            ⚠️ Promemoria non inviato
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-neutral-600">
                        {post.caption || '(nessuna caption)'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:shrink-0">
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
                        onClick={() => onDuplicate(post)}
                        className="rounded-md border border-brand-200 px-2 py-1 text-xs text-brand-700"
                      >
                        Duplica
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
            )}
          </div>
        )
      })}
    </div>
  )
}
