import { useEffect, useState, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { Login } from './components/Login'
import { PostForm } from './components/PostForm'
import { PostList } from './components/PostList'
import { IdeasBank } from './components/IdeasBank'
import { PageForm } from './components/PageForm'
import { CategoryForm } from './components/CategoryForm'
import logo from './assets/logo.png'
import type { Page, Post, ContentIdea, Category } from './types'

const ALL = 'all'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [pages, setPages] = useState<Page[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string>(ALL)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ALL)
  const [posts, setPosts] = useState<Post[]>([])
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined)
  const [showPageForm, setShowPageForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)

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
    let query = supabase.from('posts').select('*, category:categories(name)').order('scheduled_at')
    if (selectedPageId !== ALL) query = query.eq('page_id', selectedPageId)
    if (selectedCategoryId !== ALL) query = query.eq('category_id', selectedCategoryId)
    const { data } = await query
    setPosts(data ?? [])
  }, [selectedPageId, selectedCategoryId])

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

  const loadCategories = useCallback(async () => {
    if (selectedPageId === ALL) {
      setCategories([])
      return
    }
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('page_id', selectedPageId)
      .order('name')
    setCategories(data ?? [])
  }, [selectedPageId])

  useEffect(() => {
    if (session) loadPages()
  }, [session, loadPages])

  useEffect(() => {
    setSelectedCategoryId(ALL)
  }, [selectedPageId])

  useEffect(() => {
    if (session) {
      loadPosts()
      loadIdeas()
      loadCategories()
    }
  }, [session, loadPosts, loadIdeas, loadCategories])

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
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <img src={logo} alt="WhiteTime" className="h-8 w-auto" />
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-brand-600 hover:underline"
          >
            Esci
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPageId(ALL)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              selectedPageId === ALL
                ? 'bg-brand-300 text-neutral-800'
                : 'border border-brand-200 text-brand-700'
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
                  ? 'bg-brand-300 text-neutral-800'
                  : 'border border-brand-200 text-brand-700'
              }`}
            >
              {page.name}
            </button>
          ))}
          <button
            onClick={() => setShowPageForm(true)}
            className="rounded-full border border-dashed border-brand-300 px-3 py-1.5 text-sm text-brand-700"
          >
            + Cliente
          </button>
        </div>

        {showPageForm && (
          <div className="mb-4">
            <PageForm
              onSaved={() => {
                setShowPageForm(false)
                loadPages()
              }}
              onCancel={() => setShowPageForm(false)}
            />
          </div>
        )}

        {selectedPageId !== ALL && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategoryId(ALL)}
              className={`rounded-full px-3 py-1 text-xs ${
                selectedCategoryId === ALL
                  ? 'bg-brand-200 text-neutral-800'
                  : 'border border-brand-100 text-brand-600'
              }`}
            >
              Tutte le categorie
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`rounded-full px-3 py-1 text-xs ${
                  selectedCategoryId === category.id
                    ? 'bg-brand-200 text-neutral-800'
                    : 'border border-brand-100 text-brand-600'
                }`}
              >
                {category.name}
              </button>
            ))}
            {showCategoryForm ? (
              <CategoryForm
                pageId={selectedPageId}
                onSaved={() => {
                  setShowCategoryForm(false)
                  loadCategories()
                }}
                onCancel={() => setShowCategoryForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowCategoryForm(true)}
                className="rounded-full border border-dashed border-brand-200 px-3 py-1 text-xs text-brand-600"
              >
                + Categoria
              </button>
            )}
          </div>
        )}

        <div className="mb-4 flex justify-end">
          <button
            onClick={openNewPost}
            className="rounded-md bg-brand-300 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-brand-400"
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
