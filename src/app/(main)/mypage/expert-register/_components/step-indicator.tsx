"use client"

import { Check } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"
import { STEP_LABELS } from "@/features/mypage/expert-register"

type StepIndicatorProps = {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const isCompleted = step < currentStep
        const isCurrent = step === currentStep

        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="size-4" /> : step}
              </div>
              <Text
                as="span"
                typography="caption2-medium"
                className={cn(
                  "hidden sm:block",
                  isCurrent ? "text-primary" : "text-muted-foreground",
                )}
              >
                {STEP_LABELS[i]}
              </Text>
            </div>

            {step < totalSteps && (
              <div
                className={cn(
                  "mx-2 h-px flex-1",
                  step < currentStep ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
