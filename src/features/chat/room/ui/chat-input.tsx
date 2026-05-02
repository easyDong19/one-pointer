"use client"

import { KeyboardEvent, useRef, useState } from "react"
import { Loader2, Send } from "lucide-react"

import { cn } from "@/shared/lib/utils"

import { AttachmentMenu } from "./attachment-menu"

const MAX_HEIGHT_PX = 120

type Props = {
  isConnected: boolean
  isUploading: boolean
  onSendText: (text: string) => void
  onPickImages: (files: File[]) => void
  onPickFile: (file: File) => void
  onTyping: () => void
}

/**
 * 채팅방 하단 입력바.
 * - textarea auto-grow (1~4 줄)
 * - Enter 전송 / Shift+Enter 줄바꿈 (한글 IME composition 중엔 무시)
 * - sticky bottom-0 — body window 스크롤 컨텍스트에서 viewport 하단 고정
 */
export function ChatInput({
  isConnected,
  isUploading,
  onSendText,
  onPickImages,
  onPickFile,
  onTyping,
}: Props) {
  const [text, setText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isComposingRef = useRef(false)

  const trimmed = text.trim()
  const canSend = isConnected && !isUploading && trimmed.length > 0

  const resetHeight = () => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
  }

  const grow = () => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, MAX_HEIGHT_PX)}px`
  }

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value)
    grow()
    if (isConnected) onTyping()
  }

  const handleSend = () => {
    if (!canSend) return
    onSendText(trimmed)
    setText("")
    resetHeight()
    textareaRef.current?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return
    if (event.shiftKey) return
    // 한글 IME 조합 중 Enter 는 한글 확정용 — 전송 막기
    if (isComposingRef.current || event.nativeEvent.isComposing) return
    event.preventDefault()
    handleSend()
  }

  return (
    <div className="bg-background/95 border-border sticky bottom-0 z-20 border-t backdrop-blur-md">
      <div className="flex items-end gap-2 px-4 py-3 md:px-6 lg:px-10">
        <AttachmentMenu
          onPickImages={onPickImages}
          onPickFile={onPickFile}
          disabled={!isConnected || isUploading}
        />

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            isComposingRef.current = true
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false
          }}
          placeholder={isConnected ? "메시지 입력..." : "연결 중..."}
          disabled={!isConnected}
          className={cn(
            "scrollbar-none border-border placeholder:text-muted-foreground text-foreground flex-1 resize-none rounded-2xl border bg-transparent px-3 py-2 text-sm leading-5 outline-none",
            "focus:border-primary",
            !isConnected && "cursor-not-allowed opacity-60",
          )}
          style={{ maxHeight: MAX_HEIGHT_PX }}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="전송"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
            canSend
              ? "bg-primary text-primary-foreground hover:bg-primary-hover"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}
