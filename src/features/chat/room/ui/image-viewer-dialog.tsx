"use client"

import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog"

type Props = {
  isOpen: boolean
  url: string
  onClose: () => void
}

/**
 * 풀스크린 이미지 뷰어. overlay-kit 명령형 패턴으로 호출.
 * 사용: openImageViewer(url)
 */
export function ImageViewerDialog({ isOpen, url, onClose }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="!h-dvh !max-w-none !w-screen !rounded-none !border-0 !bg-black/95 !p-0"
        showCloseButton
      >
        <DialogTitle className="sr-only">이미지 보기</DialogTitle>
        <div className="flex h-full w-full items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
