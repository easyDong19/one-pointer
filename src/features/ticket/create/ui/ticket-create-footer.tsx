"use client"

import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"

import { STEP_LABELS } from "../lib/ticket-create.constants"
import { useStepFlow } from "../model/use-step-flow"
import { useStepValidation } from "../model/use-step-validation"

type Props = {
  onSubmit: () => void
  isSubmitting: boolean
}

/**
 * 모바일 _buildBottomBar 와 동일 구조:
 * - 좌측: STEP X / 5 + step 라벨
 * - 우측: 이전 (outline) / 다음 또는 의뢰 등록하기 (primary)
 *
 * 모바일은 fixed bottom + safe-area, 데스크탑은 메인 패널 하단에 렌더.
 */
export function TicketCreateFooter({ onSubmit, isSubmitting }: Props) {
  const { currentStep, currentIndex, totalCount, isFirst, isLast, goPrev, goNext } =
    useStepFlow()
  const canProceed = useStepValidation()

  return (
    <div className="bg-card border-border sticky bottom-0 z-20 mt-6 flex items-center gap-3 border-t px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:mt-8 md:rounded-xl md:border md:px-5 md:py-4 md:pb-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <Text typography="caption1-bold" className="text-primary tabular-nums">
          STEP {currentIndex + 1}
          <Text
            as="span"
            typography="caption1-medium"
            className="text-muted-foreground"
          >
            {" "}
            / {totalCount}
          </Text>
        </Text>
        <Text typography="caption2-medium" className="text-muted-foreground truncate">
          {STEP_LABELS[currentStep]}
        </Text>
      </div>

      {!isFirst && (
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          disabled={isSubmitting}
          size="sm"
        >
          이전
        </Button>
      )}
      {isLast ? (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canProceed || isSubmitting}
          size="sm"
          className="min-w-32"
        >
          {isSubmitting ? "등록 중..." : "의뢰 등록하기"}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={goNext}
          disabled={!canProceed || isSubmitting}
          size="sm"
        >
          다음
        </Button>
      )}
    </div>
  )
}
