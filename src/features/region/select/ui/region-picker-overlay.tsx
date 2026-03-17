"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/ui/sheet"
import { useMediaQuery } from "@/shared/hooks/use-media-query"
import { RegionPickerContent } from "./region-picker-content"

type RegionPickerOverlayProps = {
  isOpen: boolean
  onClose: () => void
  currentRegion: string | undefined
  onSelect: (region: string | undefined) => void
}

/**
 * 반응형 지역 선택 오버레이
 * - 모바일(< md): bottom sheet
 * - 데스크탑(>= md): dialog (modal)
 */
export function RegionPickerOverlay({
  isOpen,
  onClose,
  currentRegion,
  onSelect,
}: RegionPickerOverlayProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const handleSelect = (region: string | undefined) => {
    onSelect(region)
    onClose()
  }

  // ── Desktop: Dialog Modal ──
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[70vh] overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-border/50 border-b px-5 pt-5 pb-3">
            <DialogTitle className="text-foreground text-base font-semibold">
              지역 선택
            </DialogTitle>
            <DialogDescription className="sr-only">
              시/도와 구/군을 선택해주세요
            </DialogDescription>
          </DialogHeader>
          <div className="scrollbar-none max-h-[55vh] overflow-y-auto">
            <RegionPickerContent currentRegion={currentRegion} onSelect={handleSelect} />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // ── Mobile: Bottom Sheet ──
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[80dvh] rounded-t-2xl p-0">
        <SheetHeader className="border-border/50 border-b px-5 pt-4 pb-3">
          <SheetTitle className="text-foreground text-base font-semibold">
            지역 선택
          </SheetTitle>
          <SheetDescription className="sr-only">
            시/도와 구/군을 선택해주세요
          </SheetDescription>
        </SheetHeader>
        <div className="scrollbar-none max-h-[65dvh] overflow-y-auto pb-safe">
          <RegionPickerContent currentRegion={currentRegion} onSelect={handleSelect} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
