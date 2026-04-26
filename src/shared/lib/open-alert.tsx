"use client"

import { overlay } from "overlay-kit"
import { ResponsiveAlert } from "@/shared/ui/responsive-alert"

type OpenAlertOptions = {
  variant: "success" | "warning"
  title: string
  description?: string
  confirmLabel?: string
}

/**
 * overlay-kit 으로 반응형 알림을 띄운다.
 * 사용자가 확인 버튼/배경 클릭/ESC 로 닫을 때까지 기다리며, Promise<void> 로 완료를 통보.
 *
 * @example
 * await openAlert({
 *   variant: "success",
 *   title: "포트폴리오가 추가되었습니다.",
 * })
 */
export function openAlert(options: OpenAlertOptions): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <ResponsiveAlert
        isOpen={isOpen}
        variant={options.variant}
        title={options.title}
        description={options.description}
        confirmLabel={options.confirmLabel}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
