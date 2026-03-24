"use client"

import { useMediaQuery } from "@/shared/hooks/use-media-query"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/shared/ui/sheet"

type ResponsiveAlertProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: "success" | "warning"
  title: string
  description?: string
  confirmLabel?: string
}

export function ResponsiveAlert({
  open,
  onOpenChange,
  variant,
  title,
  description,
  confirmLabel = "확인",
}: ResponsiveAlertProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const buttonVariant = variant === "success" ? "default" : "destructive"

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              <Text as="span" typography="subtitle1-bold">
                {title}
              </Text>
            </DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          <DialogFooter>
            <Button
              variant={buttonVariant}
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-[env(safe-area-inset-bottom,0px)]">
        <SheetHeader className="px-0">
          <SheetTitle>
            <Text as="span" typography="subtitle1-bold">
              {title}
            </Text>
          </SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <SheetFooter className="px-0 pb-3">
          <Button
            variant={buttonVariant}
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            {confirmLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
