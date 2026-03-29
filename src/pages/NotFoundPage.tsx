import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <p className="mb-2 text-4xl font-medium text-grey-300 dark:text-grey-600">404</p>
        <h1 className="mb-2 text-lg font-medium text-grey-800 dark:text-grey-100">Page not found</h1>
        <p className="mb-6 text-sm text-grey-500 dark:text-grey-400">
          The page you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link to="/seeds">Go to Seeds</Link>
        </Button>
      </div>
    </div>
  )
}
