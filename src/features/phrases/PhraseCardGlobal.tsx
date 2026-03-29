import { Link } from 'react-router-dom'
import type { PhraseWithSeed } from '@/lib/database.types'
import { AudioPlayButton } from '@/components/ui/AudioPlayButton'
import { Badge } from '@/components/ui/badge'

interface PhraseCardGlobalProps {
  phrase: PhraseWithSeed
}

export function PhraseCardGlobal({ phrase }: PhraseCardGlobalProps) {
  return (
    <div className="rounded-lg border border-grey-200 bg-white p-4 dark:border-grey-700 dark:bg-grey-800">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p lang="zh-TW" className="text-base font-medium text-grey-800 dark:text-grey-100">
            {phrase.mandarin}
          </p>
          <p className="mt-0.5 text-sm text-grey-500 dark:text-grey-400">{phrase.pinyin}</p>
          <p className="mt-0.5 text-sm text-grey-500 dark:text-grey-400">{phrase.english}</p>
          {phrase.seeds && (
            <Link
              to={`/seeds/${phrase.seeds.id}`}
              className="mt-2 inline-flex items-center gap-1"
            >
              <Badge variant="count" className="hover:bg-grey-200 dark:hover:bg-grey-600 cursor-pointer">
                {phrase.seeds.name}
              </Badge>
              {phrase.seeds.tag && <Badge variant="tag">{phrase.seeds.tag}</Badge>}
            </Link>
          )}
        </div>
        <AudioPlayButton text={phrase.mandarin} id={phrase.id} className="shrink-0" />
      </div>
    </div>
  )
}
