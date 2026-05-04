"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { z } from "zod/v4"

import { useTicketCreateForm } from "@/features/ticket/create/model/use-ticket-create-form"
import { TicketCreatePage } from "@/features/ticket/create/ui/ticket-create-page"

const subCategoryIdSchema = z.coerce.number().int().positive()
const targetExpertIdSchema = z.coerce.number().int().positive()

/**
 * `/tickets/new` 의 client 루트 — wave-1-5-ticket-create.md 의 사용자 진입점 매트릭스.
 *
 * - `?subCategoryId=42`: 카테고리 prefill (카테고리 상세에서 진입)
 * - `?targetExpertId=42&directRequest=true`: 직접의뢰 진입 (전문가 프로필)
 */
export function TicketCreateContent() {
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
  }, [searchParams, setField, reset])

  return <TicketCreatePage />
}
