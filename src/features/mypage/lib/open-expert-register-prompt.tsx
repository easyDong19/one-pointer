"use client"

import { overlay } from "overlay-kit"
import { ExpertRegisterPromptDialog } from "../ui/expert-register-prompt-dialog"

/**
 * overlay-kit으로 전문가 등록 안내 모달을 열고,
 * 사용자의 선택을 Promise로 반환한다.
 *
 * @returns true — 전문가 등록하기 선택, false — 취소
 */
export function openExpertRegisterPrompt(): Promise<boolean> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => {
      return (
        <ExpertRegisterPromptDialog
          isOpen={isOpen}
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
      )
    })
  })
}
