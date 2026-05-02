"use client"

import { overlay } from "overlay-kit"

import type { ToggleMessageVisibilityRequest } from "@/entities/review/api/review.service"

import { VisibilityReasonDialog } from "../ui/visibility-reason-dialog"

type Reason = ToggleMessageVisibilityRequest["reason"]

/**
 * 비공개 사유 선택 다이얼로그를 열고 결과를 Promise 로 반환.
 *   resolve(reason) — 사유 선택 + 확인
 *   resolve(null)   — 취소 / 배경 클릭
 */
export function openVisibilityReasonPicker(): Promise<Reason | null> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <VisibilityReasonDialog
        isOpen={isOpen}
        onSelect={(reason) => {
          resolve(reason)
          close()
          setTimeout(unmount, 300)
        }}
        onClose={() => {
          resolve(null)
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
