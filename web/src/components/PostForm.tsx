import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { STATUS_LABELS } from '../types'
import type { Page, Post, PostStatus, Category } from '../types'

interface Props {
  pages: Page[]
  defaultPageId: string
  post?: Post
  onSaved: () => void
  onCancel: () => void
}

function toLocalInputValue(iso: string | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function PostForm({ pages, defaultPageId, post, onSaved, onCancel }: Props) {
  const [pageId, setPageId] = useState(post?.page_id ?? defaultPageId)
  const [categoryId, setCategoryId] = useState(post?.category_id ?? '')
  const [categories, setCategories] = useState<Category[]>([])
  const [caption, setCaption] = useState(post?.caption ?? '')
  const [scheduledAt, setScheduledAt] = useState(toLocalInputValue(post?.scheduled_at))
  const [status, setStatus] = useState<PostStatus>(post?.status ?? 'programmato')
  const [notes, setNotes] = useState(post?.notes ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentMediaUrl = post?.media_path
    ? supabase.storage.from('media').getPublicUrl(post.media_path).data.publicUrl
    : null

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('page_id', pageId)
      .order('name')
      .then(({ data }) => setCategories(data ?? []))
  }, [pageId])

  function handlePageChange(newPageId: string) {
    setPageId(newPageId)
    setCategoryId('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      let mediaPath = post?.media_path ?? null
      if (file) {
        const path = `${pageId}/${crypto.randomUUID()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('media').upload(path, file)
        if (uploadError) throw uploadError
        mediaPath = path
      }

      const payload = {
        page_id: pageId,
        category_id: categoryId || null,
        caption,
        scheduled_at: new Date(scheduledAt).toISOString(),
        status,
        notes: notes || null,
        media_path: mediaPath,
      }

      const { error: saveError } = post
        ? await supabase.from('posts').update(payload).eq('id', post.id)
        : await supabase.from('posts').insert(payload)

      if (saveError) throw saveError
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-brand-200 bg-white p-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-neutral-600">Pagina</label>
          <select
            value={pageId}
            onChange={(e) => handlePageChange(e.target.value)}
            className="w-full rounded-md border border-brand-200 bg-white px-3 py-2 text-sm focus:border-brand-400 outline-none"
          >
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-neutral-600">Data e ora pubblicazione</label>
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-md border border-brand-200 bg-white px-3 py-2 text-sm focus:border-brand-400 outline-none"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="space-y-1">
          <label className="text-sm text-neutral-600">Categoria (opzionale)</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-md border border-brand-200 bg-white px-3 py-2 text-sm focus:border-brand-400 outline-none"
          >
            <option value="">— nessuna —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm text-neutral-600">Caption</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-brand-200 bg-white px-3 py-2 text-sm focus:border-brand-400 outline-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-neutral-600">Immagine</label>
        {currentMediaUrl && !file && (
          <img src={currentMediaUrl} alt="" className="h-24 w-24 rounded object-cover mb-2" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-neutral-600">Stato</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus)}
            className="w-full rounded-md border border-brand-200 bg-white px-3 py-2 text-sm focus:border-brand-400 outline-none"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-neutral-600">Note (opzionale)</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-brand-200 bg-white px-3 py-2 text-sm focus:border-brand-400 outline-none"
          />
        </div>
      </div>

      {error && <p className="text-sm text-brand-700">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-brand-200 px-3 py-2 text-sm text-brand-700"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand-300 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-brand-400 disabled:opacity-50"
        >
          {saving ? 'Salvataggio…' : 'Salva'}
        </button>
      </div>
    </form>
  )
}
