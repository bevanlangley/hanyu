import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ConfirmDialogProvider } from '@/context/ConfirmDialogContext'
import { TtsProvider } from '@/context/TtsContext'

export function AppShell() {
  return (
    <ConfirmDialogProvider>
      <TtsProvider>
        <div className="flex h-screen flex-col bg-grey-50 dark:bg-grey-900">
          <OfflineBanner />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
              <Outlet />
            </main>
          </div>
          <BottomNav />
        </div>
        <ConfirmDialog />
        <Toaster position="top-right" richColors />
      </TtsProvider>
    </ConfirmDialogProvider>
  )
}
