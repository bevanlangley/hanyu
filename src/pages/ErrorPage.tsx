import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ErrorPage() {
  const error = useRouteError()

  const title = isRouteErrorResponse(error) && error.status === 404
    ? 'Page not found'
    : 'Something went wrong'

  const description = isRouteErrorResponse(error)
    ? error.statusText
    : 'An unexpected error occurred.'

  return (
    <div className="flex min-h-screen items-center justify-center bg-grey-50 px-4 dark:bg-grey-900">
      <div className="max-w-md text-center">
        <div className="mb-4 flex justify-center">
          <AlertCircle className="h-12 w-12 text-grey-400" strokeWidth={1.5} />
        </div>
        <h1 className="mb-2 text-lg font-medium text-grey-800 dark:text-grey-100">{title}</h1>
        <p className="mb-6 text-sm text-grey-500 dark:text-grey-400">{description}</p>
        <Button asChild>
          <Link to="/seeds">Go to Seeds</Link>
        </Button>
      </div>
    </div>
  )
}
