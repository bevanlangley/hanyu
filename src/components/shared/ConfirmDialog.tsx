import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useConfirmDialog } from '@/context/ConfirmDialogContext'

export function ConfirmDialog() {
  const { state } = useConfirmDialog()

  return (
    <Dialog open={state.open} onOpenChange={(open) => { if (!open) state.onCancel() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{state.title}</DialogTitle>
          <DialogDescription>{state.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={state.onCancel}>
            {state.cancelLabel}
          </Button>
          <Button
            variant={state.variant === 'danger' ? 'danger' : 'default'}
            onClick={state.onConfirm}
          >
            {state.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
