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

const STATUS_DOT: Record<string, string> = {
  idea: 'border border-brand-300 bg-white',
  da_fare: 'bg-brand-200',
  programmato: 'bg-brand-400',
  promemoria_inviato: 'bg-brand-600',
  pubblicato: 'bg-brand-800',
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
    <div className="space-y-3">
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

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2">
          {days.map((day) => {
            const dayPosts = posts.filter((post) => isSameDay(new Date(post.scheduled_at), day))
            const isToday = isSameDay(day, today)

            return (
              <div key={day.toISOString()} className="min-w-[124px] flex-1 space-y-1.5">
                <div
                  className={`flex items-center justify-between rounded-md px-1.5 py-1 ${
                    isToday ? 'bg-brand-100' : ''
                  }`}
                >
                  <span
                    className={`text-xs font-semibold capitalize ${
                      isToday ? 'text-brand-700' : 'text-neutral-700'
                    }`}
                  >
                    {day.toLocaleDateString('it-IT', { weekday: 'short' })}{' '}
                    <span className="font-normal text-neutral-500">
                      {day.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </span>
                  <button
                    onClick={() => onQuickAdd(day)}
                    className="rounded-full border border-dashed border-brand-300 px-1.5 text-xs leading-5 text-brand-700"
                    aria-label="Aggiungi post"
                  >
                    +
                  </button>
                </div>

                <div className="space-y-1.5">
                  {dayPosts.length === 0 && <p className="px-1.5 text-[11px] text-neutral-300">—</p>}
                  {dayPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => onEdit(post)}
                      className="cursor-pointer space-y-1 rounded-md border border-brand-100 bg-white p-1.5 text-xs hover:border-brand-300"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-semibold text-neutral-900">
                          {post.page?.name ?? 'Cliente'}
                        </span>
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[post.status]}`}
                          title={STATUS_LABELS[post.status]}
                        />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                        <span>
                          {new Date(post.scheduled_at).toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {post.category?.name && (
                          <span className="truncate text-brand-600">· {post.category.name}</span>
                        )}
                      </div>
                      <p className="line-clamp-2 text-neutral-600">
                        {post.caption || '(nessuna caption)'}
                      </p>
                      {post.reminder_error && (
                        <span className="block text-[10px] text-red-700" title={post.reminder_error}>
                          ⚠️ non inviato
                        </span>
                      )}
                      <div
                        className="flex gap-1.5 pt-0.5 text-[11px] text-brand-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {post.status !== 'pubblicato' && (
                          <button onClick={() => onMarkPublished(post)} title="Segna pubblicato">
                            ✓
                          </button>
                        )}
                        <button onClick={() => onDuplicate(post)} title="Duplica">
                          ⧉
                        </button>
                        <button onClick={() => onDelete(post)} title="Elimina" className="text-brand-800">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
