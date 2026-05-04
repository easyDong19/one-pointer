"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { ALL_STEPS, type Step } from "../lib/ticket-create.constants"

/**
 * `?step=...` 으로 wizard 단계를 관리. 모바일과 동일한 5단계 (분기 없음).
 */
export function useStepFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const requested = (searchParams.get("step") ?? ALL_STEPS[0]) as Step
  const currentStep: Step = ALL_STEPS.includes(requested)
    ? requested
    : ALL_STEPS[0]

  const currentIndex = ALL_STEPS.indexOf(currentStep)
  const totalCount = ALL_STEPS.length

  const buildHref = useCallback(
    (step: Step) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("step", step)
      return `?${params.toString()}`
    },
    [searchParams],
  )

  const goTo = useCallback(
    (step: Step) => {
      if (!ALL_STEPS.includes(step)) return
      router.push(buildHref(step))
    },
    [router, buildHref],
  )

  const goNext = useCallback(() => {
    const next = ALL_STEPS[currentIndex + 1]
    if (next) goTo(next)
  }, [currentIndex, goTo])

  const goPrev = useCallback(() => {
    const prev = ALL_STEPS[currentIndex - 1]
    if (prev) goTo(prev)
  }, [currentIndex, goTo])

  return {
    steps: ALL_STEPS,
    currentStep,
    currentIndex,
    totalCount,
    progress: (currentIndex + 1) / totalCount,
    isFirst: currentIndex === 0,
    isLast: currentIndex === totalCount - 1,
    goTo,
    goNext,
    goPrev,
    buildHref,
  }
}
