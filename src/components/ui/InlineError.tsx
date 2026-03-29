import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineErrorProps {
  message: string
  className?: string
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div
      role="alert"
      className={cn('flex items-center gap-2 rounded-md bg-[#fee2e2] px-3 py-2 text-sm text-[#991b1b] dark:bg-[#991b1b] dark:text-[#fee2e2]', className)}
    >
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
