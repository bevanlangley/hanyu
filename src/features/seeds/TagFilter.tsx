import { cn } from '@/lib/utils'

interface TagFilterProps {
  tags: string[]
  selectedTag: string | null
  onSelect: (tag: string | null) => void
}

export function TagFilter({ tags, selectedTag, onSelect }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div role="group" aria-label="Filter by tag" className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'rounded-full px-3 py-1 text-xs font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
          selectedTag === null
            ? 'bg-primary-500 text-white dark:bg-primary-400'
            : 'bg-grey-100 text-grey-600 hover:bg-grey-200 dark:bg-grey-700 dark:text-grey-300 dark:hover:bg-grey-600'
        )}
      >
        All
      </button>
      {tags.map(tag => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(tag)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
            selectedTag === tag
              ? 'bg-primary-500 text-white dark:bg-primary-400'
              : 'bg-grey-100 text-grey-600 hover:bg-grey-200 dark:bg-grey-700 dark:text-grey-300 dark:hover:bg-grey-600'
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
