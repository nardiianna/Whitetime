import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  pageId: string
  onSaved: () => void
  onCancel: () => void
}

export function CategoryForm({ pageId, onSaved, onCancel }: Props) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const { error: saveError } = await supabase
      .from('categories')
      .insert({ page_id: pageId, name: name.trim() })
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
      {error && <p className="text-sm text-brand-700">{error}</p>}
    </form>
  )
}
