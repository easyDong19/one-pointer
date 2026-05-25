"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod/v4"

import { useTicketCreateForm } from "@/features/ticket/create/model/use-ticket-create-form"
import { ALL_STEPS } from "@/features/ticket/create/lib/ticket-create.constants"
import { TicketCreatePage } from "@/features/ticket/create/ui/ticket-create-page"

const subCategoryIdSchema = z.coerce.number().int().positive()
const targetExpertIdSchema = z.coerce.number().int().positive()

/**
 * `/tickets/new` 의 client 루트 — wave-1-5-ticket-create.md 의 사용자 진입점 매트릭스.
 *
 * - `?subCategoryId=42`: 카테고리 prefill (카테고리 상세에서 진입)
 * - `?targetExpertId=42&directRequest=true`: 직접의뢰 진입 (전문가 프로필)
 *
 * 새로고침 / 직접 URL 진입 시 form state(zustand, in-memory) 가 비어 있으므로
 * `?step=...` 가 step 1 외라면 step 1 로 replace 하여 빈 폼으로 중간 step 에
 * 떨어지는 상황을 막는다.
 */
export function TicketCreateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setField = useTicketCreateForm((s) => s.setField)
  const reset = useTicketCreateForm((s) => s.reset)
  const initRef = useRef(false)

  // mount 시 1회만 prefill — searchParams 변경 (?step=...) 마다 재실행 X
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    reset()

    const subCategoryRaw = searchParams.get("subCategoryId")
    if (subCategoryRaw) {
      const parsed = subCategoryIdSchema.safeParse(subCategoryRaw)
      if (parsed.success) setField("subCategoryId", parsed.data)
    }

    const targetExpertRaw = searchParams.get("targetExpertId")
    if (targetExpertRaw) {
      const parsed = targetExpertIdSchema.safeParse(targetExpertRaw)
      if (parsed.success) {
        setField("targetExpertId", parsed.data)
        setField("directRequest", searchParams.get("directRequest") === "true")
      }
    }

    // 중간 step 으로 들어왔다면 step 1 로 튕긴다.
    const stepParam = searchParams.get("step")
    if (stepParam && stepParam !== ALL_STEPS[0]) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("step")
      const qs = params.toString()
      router.replace(qs ? `/tickets/new?${qs}` : "/tickets/new")
      toast.info("이전 입력이 초기화되어 처음부터 다시 입력해주세요")
    }
  }, [searchParams, setField, reset, router])

  return <TicketCreatePage />
}
