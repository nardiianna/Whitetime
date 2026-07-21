import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types'

interface Props {
  pageId: string
  category?: Category
  onSaved: () => void
  onCancel: () => void
  onDelete?: () => void
}

export function CategoryForm({ pageId, category, onSaved, onCancel, onDelete }: Props) {
  const [name, setName] = useState(category?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const { error: saveError } = category
      ? await supabase.from('categories').update({ name: name.trim() }).eq('id', category.id)
      : await supabase.from('categories').insert({ page_id: pageId, name: name.trim() })
    if (saveError) {
      setError(saveError.message)
      setSaving(false)
      return
    }
    onSaved()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome categoria…"
        className="rounded-md border border-brand-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-400"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-brand-300 px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-brand-400 disabled:opacity-50"
      >
        Salva
      </button>
      <button type="button" onClick={onCancel} className="text-sm text-brand-700">
        Annulla
      </button>
      {category && onDelete && (
        <button type="button" onClick={onDelete} className="text-sm text-red-700">
          Elimina
        </button>
      )}
      {error && <p className="text-sm text-brand-700">{error}</p>}
    </form>
  )
}
