"use client"

import { overlay } from "overlay-kit"
import { LoginPromptModal } from "../ui/login-prompt-modal"

export function openLoginPrompt(): Promise<"login" | "cancel"> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <LoginPromptModal
        isOpen={isOpen}
        onLogin={() => {
          resolve("login")
          close()
          setTimeout(unmount, 300)
        }}
        onClose={() => {
          resolve("cancel")
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
