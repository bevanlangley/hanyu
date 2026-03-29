import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { fetchSeeds } from '@/features/seeds/seedsService'
import { useDrilling } from '@/features/drilling/useDrilling'
import { DrillingControls } from '@/features/drilling/DrillingControls'
import { Header } from '@/components/layout/Header'
import { Spinner } from '@/components/ui/Spinner'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Seed } from '@/lib/database.types'

export function DrillingMode() {
  const location = useLocation()
  const locationSeedId = (location.state as { seedId?: string } | null)?.seedId ?? null

  const [seeds, setSeeds] = useState<Seed[]>([])
  const [seedsLoading, setSeedsLoading] = useState(true)
  const [selectedSeedId, setSelectedSeedId] = useState<string | null>(locationSeedId)

  useEffect(() => {
    fetchSeeds()
      .then(data => {
        setSeeds(data)
        if (!selectedSeedId && data.length > 0) {
          setSelectedSeedId(data[0].id)
        }
      })
      .finally(() => setSeedsLoading(false))
  }, [])

  const {
    phrases,
    loading: phrasesLoading,
    currentPhrase,
    currentIndex,
    mode,
    play,
    pause,
    resume,
    stop,
    next,
    previous,
    speakCurrentManually,
  } = useDrilling({ seedId: selectedSeedId })

  return (
    <div className="flex flex-col">
      <Header title="Drill" />

      <div className="p-4 md:p-6">
        {/* Desktop header */}
        <div className="mb-6 hidden md:block">
          <h1 className="text-lg font-medium text-grey-800 dark:text-grey-100">Fluency Drilling</h1>
          <p className="mt-0.5 text-sm text-grey-500 dark:text-grey-400">
            Auto-play phrases to build fluency
          </p>
        </div>

        {seedsLoading ? (
          <Skeleton className="h-10 w-full max-w-xs" />
        ) : seeds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-grey-500 dark:text-grey-400">
              No seeds yet.{' '}
              <Link to="/seeds" className="text-primary-500 hover:underline dark:text-primary-400">
                Create a seed
              </Link>{' '}
              and add phrases to start drilling.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Seed selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="drill-seed" className="text-[13px] font-medium text-grey-700 dark:text-grey-300">
                Seed
              </label>
              <select
                id="drill-seed"
                value={selectedSeedId ?? ''}
                onChange={e => {
                  stop()
                  setSelectedSeedId(e.target.value || null)
                }}
                className="w-full max-w-xs rounded-md border border-grey-300 bg-white px-3 py-2 text-sm text-grey-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-grey-600 dark:bg-grey-800 dark:text-grey-100"
              >
                {seeds.map(seed => (
                  <option key={seed.id} value={seed.id}>
                    {seed.name}
                  </option>
                ))}
              </select>
            </div>

            {phrasesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : phrases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-grey-500 dark:text-grey-400">
                  This seed has no phrases yet.{' '}
                  <Link
                    to={`/seeds/${selectedSeedId}`}
                    className="text-primary-500 hover:underline dark:text-primary-400"
                  >
                    Add phrases
                  </Link>
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                {/* Current phrase display */}
                <div className="w-full max-w-md rounded-lg border border-grey-200 bg-white p-6 text-center dark:border-grey-700 dark:bg-grey-800">
                  {currentPhrase ? (
                    <>
                      <p
                        lang="zh-TW"
                        className="text-3xl font-medium text-grey-800 dark:text-grey-100"
                      >
                        {currentPhrase.mandarin}
                      </p>
                      <p className="mt-2 text-base text-grey-500 dark:text-grey-400">
                        {currentPhrase.pinyin}
                      </p>
                      <p className="mt-1 text-base text-grey-500 dark:text-grey-400">
                        {currentPhrase.english}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-grey-400 dark:text-grey-500">No phrase selected</p>
                  )}
                </div>

                <DrillingControls
                  mode={mode}
                  currentIndex={currentIndex}
                  totalPhrases={phrases.length}
                  onPlay={play}
                  onPause={pause}
                  onResume={resume}
                  onStop={stop}
                  onNext={next}
                  onPrevious={previous}
                  onSpeak={speakCurrentManually}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
