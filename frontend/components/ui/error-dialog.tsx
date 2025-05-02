"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  message: string | null
  description?: string
}

export function ErrorDialog({
  open,
  onOpenChange,
  title = "Error Occurred",
  message,
  description = "Please try again or check your wallet for more details.",
}: ErrorDialogProps) {
  // Don't show the dialog if there's no message
  if (!message) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background-paper border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center text-primary">
            <AlertCircle className="h-5 w-5 mr-2" />
            {title}
          </DialogTitle>
          {description && <DialogDescription className="text-text-secondary">{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">
          <p className="text-primary-light font-medium">{message}</p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-primary hover:bg-primary-dark text-primary-foreground"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
