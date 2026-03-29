import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { fetchAllPhrases } from '@/features/phrases/phrasesService'
import { PhraseCardGlobal } from '@/features/phrases/PhraseCardGlobal'
import { Header } from '@/components/layout/Header'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/Skeleton'
import { InlineError } from '@/components/ui/InlineError'
import { Pagination } from '@/components/ui/Pagination'
import type { PhraseWithSeed } from '@/lib/database.types'

const PAGE_SIZE = 25

export function GlobalPhrases() {
  const [phrases, setPhrases] = useState<PhraseWithSeed[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadPhrases = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAllPhrases({ search: debouncedSearch, page, pageSize: PAGE_SIZE })
      setPhrases(result.phrases)
      setTotal(result.total)
    } catch {
      toast.error('Could not load phrases. Try again.')
      setError('Could not load phrases.')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page])

  useEffect(() => {
    loadPhrases()
  }, [loadPhrases])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col">
      <Header title="Phrases" />

      <div className="p-4 md:p-6">
        {/* Desktop header */}
        <div className="mb-6 hidden md:block">
          <h1 className="text-lg font-medium text-grey-800 dark:text-grey-100">All Phrases</h1>
          <p className="mt-0.5 text-sm text-grey-500 dark:text-grey-400">
            {total > 0 ? `${total} phrase${total !== 1 ? 's' : ''} across all seeds` : 'No phrases yet'}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400" />
          <Input
            type="search"
            placeholder="Search Mandarin, Pinyin or English…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 hover:text-grey-600 focus-visible:outline-none dark:hover:text-grey-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {error && <InlineError message={error} className="mb-4" />}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : phrases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-grey-500 dark:text-grey-400">
              {debouncedSearch ? `No phrases matching "${debouncedSearch}"` : 'No phrases yet. Add phrases from a Seed.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {phrases.map(phrase => (
                <PhraseCardGlobal key={phrase.id} phrase={phrase} />
              ))}
            </div>
            {total > PAGE_SIZE && (
              <div className="mt-6">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
