import { useEffect, useState, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { Login } from './components/Login'
import { PostForm } from './components/PostForm'
import { PostList } from './components/PostList'
import { IdeasBank } from './components/IdeasBank'
import type { Page, Post, ContentIdea } from './types'

const ALL = 'all'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [pages, setPages] = useState<Page[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string>(ALL)
  const [posts, setPosts] = useState<Post[]>([])
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const loadPages = useCallback(async () => {
    const { data } = await supabase.from('pages').select('*').order('name')
    setPages(data ?? [])
  }, [])

  const loadPosts = useCallback(async () => {
    let query = supabase.from('posts').select('*').order('scheduled_at')
    if (selectedPageId !== ALL) query = query.eq('page_id', selectedPageId)
    const { data } = await query
    setPosts(data ?? [])
  }, [selectedPageId])

  const loadIdeas = useCallback(async () => {
    if (selectedPageId === ALL) {
      setIdeas([])
      return
    }
    const { data } = await supabase
      .from('content_ideas')
      .select('*')
      .eq('page_id', selectedPageId)
      .order('created_at')
    setIdeas(data ?? [])
  }, [selectedPageId])

  useEffect(() => {
    if (session) loadPages()
  }, [session, loadPages])

  useEffect(() => {
    if (session) {
      loadPosts()
      loadIdeas()
    }
  }, [session, loadPosts, loadIdeas])

  if (authLoading) return null
  if (!session) return <Login />

  async function handleDelete(post: Post) {
    if (!confirm('Eliminare questo post?')) return
    await supabase.from('posts').delete().eq('id', post.id)
    loadPosts()
  }

  async function handleMarkPublished(post: Post) {
    await supabase.from('posts').update({ status: 'pubblicato' }).eq('id', post.id)
    loadPosts()
  }

  function openNewPost() {
    setEditingPost(undefined)
    setShowForm(true)
  }

  function openEditPost(post: Post) {
    setEditingPost(post)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Content Planner</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-neutral-500 hover:underline"
          >
            Esci
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPageId(ALL)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              selectedPageId === ALL
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            Tutte
          </button>
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setSelectedPageId(page.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                selectedPageId === page.id
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {page.name}
            </button>
          ))}
        </div>

        <div className="mb-4 flex justify-end">
          <button
            onClick={openNewPost}
            className="rounded-md bg-neutral-900 dark:bg-neutral-100 px-3 py-2 text-sm font-medium text-white dark:text-neutral-900"
          >
            + Nuovo post
          </button>
        </div>

        {showForm && (
          <div className="mb-4">
            <PostForm
              pages={pages}
              defaultPageId={selectedPageId !== ALL ? selectedPageId : pages[0]?.id ?? ''}
              post={editingPost}
              onSaved={() => {
                setShowForm(false)
                loadPosts()
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <PostList
          posts={posts}
          onEdit={openEditPost}
          onDelete={handleDelete}
          onMarkPublished={handleMarkPublished}
        />

        {selectedPageId !== ALL && (
          <div className="mt-6">
            <IdeasBank pageId={selectedPageId} ideas={ideas} onChanged={loadIdeas} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
