import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { ContentIdea } from '../types'

interface Props {
  pageId: string
  ideas: ContentIdea[]
  onChanged: () => void
}

export function IdeasBank({ pageId, ideas, onChanged }: Props) {
  const [text, setText] = useState('')
  const [pillar, setPillar] = useState('')

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await supabase.from('content_ideas').insert({
      page_id: pageId,
      idea_text: text.trim(),
      pillar: pillar.trim() || null,
    })
    setText('')
    setPillar('')
    onChanged()
  }

  async function toggleUsed(idea: ContentIdea) {
    await supabase.from('content_ideas').update({ used: !idea.used }).eq('id', idea.id)
    onChanged()
  }

  async function remove(idea: ContentIdea) {
    await supabase.from('content_ideas').delete().eq('id', idea.id)
    onChanged()
  }

  const pending = ideas.filter((i) => !i.used)
  const used = ideas.filter((i) => i.used)

  return (
    <div className="space-y-3 rounded-xl border border-pink-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-pink-500">Banca idee</h3>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nuova idea…"
          className="flex-1 rounded-md border border-pink-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-pink-400"
        />
        <input
          value={pillar}
          onChange={(e) => setPillar(e.target.value)}
          placeholder="Categoria (opz.)"
          className="w-40 rounded-md border border-pink-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-pink-400"
        />
        <button
          type="submit"
          className="rounded-md bg-pink-400 px-3 py-1.5 text-sm font-medium text-white hover:bg-pink-500"
        >
          Aggiungi
        </button>
      </form>

      {pending.length === 0 && used.length === 0 && (
        <p className="text-sm text-neutral-500">Nessuna idea salvata per questa pagina.</p>
      )}

      {pending.length > 0 && (
        <ul className="space-y-1">
          {pending.map((idea) => (
            <li key={idea.id} className="flex items-center gap-2 text-sm">
              <button
                onClick={() => toggleUsed(idea)}
                className="h-4 w-4 shrink-0 rounded border border-pink-300"
                title="Segna come usata"
              />
              <span className="flex-1 text-neutral-800">{idea.idea_text}</span>
              {idea.pillar && (
                <span className="rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-500">
                  {idea.pillar}
                </span>
              )}
              <button onClick={() => remove(idea)} className="text-xs text-pink-500">
                Elimina
              </button>
            </li>
          ))}
        </ul>
      )}

      {used.length > 0 && (
        <details className="text-sm text-neutral-500">
          <summary>Già usate ({used.length})</summary>
          <ul className="mt-1 space-y-1">
            {used.map((idea) => (
              <li key={idea.id} className="flex items-center gap-2 line-through">
                <button onClick={() => toggleUsed(idea)} className="h-4 w-4 shrink-0 rounded bg-pink-300" />
                <span className="flex-1">{idea.idea_text}</span>
                <button onClick={() => remove(idea)} className="text-xs text-pink-500 no-underline">
                  Elimina
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
