"use client"

import { Text } from "@/shared/ui/text"

type SignupProgressProps = {
  currentStep: number
  total: number
  label: string
}

export function SignupProgress({ currentStep, total, label }: SignupProgressProps) {
  const pct = Math.min(100, Math.max(0, Math.round((currentStep / total) * 100)))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <Text as="span" typography="body3-medium" className="text-primary">
          {label}
        </Text>
        <Text
          as="span"
          typography="caption1-medium"
          className="text-muted-foreground tabular-nums"
        >
          {currentStep} / {total}
        </Text>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="bg-primary absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
