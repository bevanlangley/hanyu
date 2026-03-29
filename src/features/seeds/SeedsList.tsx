import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { fetchSeeds, getUniqueTags } from '@/features/seeds/seedsService'
import { SeedCard } from '@/features/seeds/SeedCard'
import { SeedForm } from '@/features/seeds/SeedForm'
import { TagFilter } from '@/features/seeds/TagFilter'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/Skeleton'
import { InlineError } from '@/components/ui/InlineError'
import { Pagination } from '@/components/ui/Pagination'
import type { Seed, SeedWithCount } from '@/lib/database.types'

const PAGE_SIZE = 25

export function SeedsList() {
  const [seeds, setSeeds] = useState<SeedWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingSeed, setEditingSeed] = useState<SeedWithCount | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadSeeds()
  }, [])

  async function loadSeeds() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSeeds()
      setSeeds(data)
    } catch {
      toast.error('Could not load seeds. Try again.')
      setError('Could not load seeds.')
    } finally {
      setLoading(false)
    }
  }

  const tags = useMemo(() => getUniqueTags(seeds), [seeds])
  const filtered = useMemo(
    () => (selectedTag ? seeds.filter(s => s.tag === selectedTag) : seeds),
    [seeds, selectedTag]
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleTagSelect(tag: string | null) {
    setSelectedTag(tag)
    setPage(1)
  }

  function openCreate() {
    setEditingSeed(null)
    setFormOpen(true)
  }

  function openEdit(seed: SeedWithCount) {
    setEditingSeed(seed)
    setFormOpen(true)
  }

  function handleSaved(saved: Seed) {
    setSeeds(prev => {
      const exists = prev.find(s => s.id === saved.id)
      if (exists) return prev.map(s => (s.id === saved.id ? { ...saved, phraseCount: s.phraseCount } : s))
      return [{ ...saved, phraseCount: 0 }, ...prev]
    })
  }

  function handleDeleted(id: string) {
    setSeeds(prev => prev.filter(s => s.id !== id))
  }

  const createButton = (
    <Button size="sm" onClick={openCreate}>
      <Plus className="h-4 w-4" />
      New seed
    </Button>
  )

  return (
    <div className="flex flex-col">
      <Header title="Seeds" actions={createButton} />

      <div className="p-4 md:p-6">
        {/* Desktop header */}
        <div className="mb-6 hidden items-center justify-between md:flex">
          <div>
            <h1 className="text-lg font-medium text-grey-800 dark:text-grey-100">Seeds</h1>
            <p className="mt-0.5 text-sm text-grey-500 dark:text-grey-400">
              Your learning sources
            </p>
          </div>
          {createButton}
        </div>

        {tags.length > 0 && (
          <div className="mb-4">
            <TagFilter tags={tags} selectedTag={selectedTag} onSelect={handleTagSelect} />
          </div>
        )}

        {error && <InlineError message={error} className="mb-4" />}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-grey-500 dark:text-grey-400">
              {selectedTag ? `No seeds with tag "${selectedTag}"` : 'No seeds yet. Create your first one.'}
            </p>
            {!selectedTag && (
              <Button className="mt-4" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Create a seed
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map(seed => (
                <SeedCard
                  key={seed.id}
                  seed={seed}
                  onEdit={openEdit}
                  onDeleted={handleDeleted}
                />
              ))}
            </div>
            {filtered.length > PAGE_SIZE && (
              <div className="mt-6">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <SeedForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        seed={editingSeed}
        onSaved={handleSaved}
      />
    </div>
  )
}
