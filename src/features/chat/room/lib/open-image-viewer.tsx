"use client"

import { overlay } from "overlay-kit"

import { ImageViewerDialog } from "../ui/image-viewer-dialog"

/**
 * 이미지 뷰어를 열고 닫힐 때 resolve.
 * 결과 데이터 없음 — 단순히 close 의 await 가 필요할 때만 사용.
 */
export function openImageViewer(url: string): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <ImageViewerDialog
        isOpen={isOpen}
        url={url}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
