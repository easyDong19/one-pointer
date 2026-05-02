"use client"

import { Check } from "lucide-react"

import type { TicketProgressInfo } from "@/entities/chat/api/chat.schema"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type Props = {
  progress: TicketProgressInfo | null | undefined
}

/**
 * 의뢰 진행 단계 가로 스크롤 스텝 인디케이터.
 * 데이터가 비어있거나 steps 가 없으면 렌더하지 않는다.
 */
export function ProgressStepper({ progress }: Props) {
  const steps = progress?.steps ?? []
  if (steps.length === 0) return null

  return (
    <div className="border-border bg-background border-b">
      <div className="scrollbar-none flex items-center gap-3 overflow-x-auto px-4 py-3 md:px-6 lg:px-10">
        {steps.map((step, index) => (
          <Step
            key={`${step.label ?? index}-${index}`}
            label={step.label ?? `단계 ${index + 1}`}
            completed={Boolean(step.completed)}
            current={Boolean(step.current)}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

function Step({
  label,
  completed,
  current,
  isLast,
}: {
  label: string
  completed: boolean
  current: boolean
  isLast: boolean
}) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold",
            completed && "bg-primary text-primary-foreground",
            current && !completed && "border-primary text-primary border-2 bg-transparent",
            !completed && !current && "bg-muted text-muted-foreground",
          )}
        >
          {completed ? <Check className="h-3 w-3" /> : null}
        </span>
        <Text
          as="span"
          typography="caption1-medium"
          className={cn(
            "whitespace-nowrap",
            current ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
        </Text>
      </div>
      {!isLast && (
        <span
          aria-hidden
          className={cn("h-px w-6 shrink-0", completed ? "bg-primary" : "bg-border")}
        />
      )}
    </div>
  )
}
