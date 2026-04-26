"use client"

import { overlay } from "overlay-kit"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"

type OpenConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
}

/**
 * overlay-kit 으로 컨펌 다이얼로그를 열고, 사용자의 선택을 Promise<boolean> 로 반환한다.
 *
 * @returns true — 확인, false — 취소/배경 클릭/ESC
 *
 * @example
 * const ok = await openConfirm({
 *   title: "포트폴리오를 삭제하시겠습니까?",
 *   description: "삭제된 포트폴리오는 복구할 수 없습니다.",
 *   confirmLabel: "삭제",
 *   variant: "destructive",
 * })
 * if (!ok) return
 * await deleteMutation.mutateAsync(id)
 */
export function openConfirm(options: OpenConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <ConfirmDialog
        isOpen={isOpen}
        title={options.title}
        description={options.description}
        confirmLabel={options.confirmLabel}
        cancelLabel={options.cancelLabel}
        variant={options.variant}
        onConfirm={() => {
          resolve(true)
          close()
          setTimeout(unmount, 300)
        }}
        onCancel={() => {
          resolve(false)
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
