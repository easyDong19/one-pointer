"use client"

import { useState } from "react"

import type { ToggleMessageVisibilityRequest } from "@/entities/review/api/review.service"
import { VISIBILITY_REASON_LABEL } from "@/entities/review/lib/review.constants"
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type Reason = ToggleMessageVisibilityRequest["reason"]

const REASONS: ReadonlyArray<{ key: Reason; description: string }> = [
  { key: "PERSONAL", description: "이름·연락처 등 개인정보" },
  { key: "SENSITIVE", description: "민감하거나 노출하고 싶지 않은 내용" },
  { key: "OTHER", description: "그 외 사유" },
]

type Props = {
  isOpen: boolean
  onSelect: (reason: Reason) => void
  onClose: () => void
}

/** 공개/비공개 토글 시 사유 선택 다이얼로그. overlay-kit opener 가 호출. */
export function VisibilityReasonDialog({ isOpen, onSelect, onClose }: Props) {
  const [selected, setSelected] = useState<Reason | null>(null)

  const handleSubmit = () => {
    if (!selected) return
    onSelect(selected)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogTitle className="text-foreground text-base font-bold">
          비공개 사유를 선택해주세요
        </DialogTitle>
        <Text typography="caption1-medium" className="text-muted-foreground">
          이 메시지는 공개 리뷰에서 가려집니다. 가린 사유는 본인만 확인할 수 있어요.
        </Text>

        <div className="flex flex-col gap-2">
          {REASONS.map((reason) => {
            const isSelected = selected === reason.key
            return (
              <button
                key={reason.key}
                type="button"
                onClick={() => setSelected(reason.key)}
                className={cn(
                  "border-border hover:border-primary flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  isSelected && "border-primary bg-primary-light",
                )}
              >
                <Text typography="caption1-bold" className="text-foreground">
                  {VISIBILITY_REASON_LABEL[reason.key]}
                </Text>
                <Text
                  typography="caption2-medium"
                  className="text-muted-foreground"
                >
                  {reason.description}
                </Text>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:bg-muted/40 rounded-md px-3 py-1.5 text-sm"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selected}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              selected
                ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            비공개로 전환
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
