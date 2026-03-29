import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        tag: 'bg-secondary-100 text-secondary-500',
        count: 'bg-grey-100 text-grey-600 dark:bg-grey-700 dark:text-grey-300',
        success: 'bg-[#d1fae5] text-[#065f46] dark:bg-[#065f46] dark:text-[#d1fae5]',
        warning: 'bg-[#fef3c7] text-[#92400e] dark:bg-[#92400e] dark:text-[#fef3c7]',
        error: 'bg-[#fee2e2] text-[#991b1b] dark:bg-[#991b1b] dark:text-[#fee2e2]',
      },
    },
    defaultVariants: {
      variant: 'count',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
