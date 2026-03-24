"use client"

import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"

type SignupStepperProps = {
  currentStep: 1 | 2
}

const steps = [
  { step: 1, label: "기본 정보" },
  { step: 2, label: "약관 동의" },
] as const

export function SignupStepper({ currentStep }: SignupStepperProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((item, index) => (
        <div key={item.step} className="flex flex-1 items-center">
          {index > 0 && (
            <div
              className={cn(
                "h-0.5 flex-1",
                currentStep >= item.step ? "bg-primary" : "bg-neutral-200",
              )}
            />
          )}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full",
                currentStep >= item.step
                  ? "bg-primary text-primary-foreground"
                  : "bg-neutral-200 text-neutral-500",
              )}
            >
              <Text as="span" typography="caption1-bold">
                {item.step}
              </Text>
            </div>
            <Text
              as="span"
              typography="body3-medium"
              className={cn(
                currentStep >= item.step
                  ? "text-primary"
                  : "text-neutral-500",
              )}
            >
              {item.label}
            </Text>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1",
                currentStep > item.step ? "bg-primary" : "bg-neutral-200",
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
