"use client"

import { useEffect, useMemo } from "react"
import { CalendarIcon, Laptop, MapPin } from "lucide-react"

import { Text } from "@/shared/ui/text"

import {
  formatEstimatedDuration,
  LEVEL_OPTIONS,
} from "../../lib/ticket-create.constants"
import { formatBudget } from "../../lib/format-budget"
import { useCategoriesQuery } from "../../model/use-categories-query"
import { useTicketCreateForm } from "../../model/use-ticket-create-form"
import { StepCard } from "../step-card"

/**
 * Step 5 — 모바일 Step5ConfirmWidget 와 동일 섹션 구조:
 * - 기본 정보 (의뢰 유형 / 카테고리 / 제목 / 실력)
 * - 시간 & 예산 (희망 시간 / 예산 / 희망 장소 if OFFLINE)
 * - 첨부 이미지 (있을 때만)
 * - 희망 일시 (있을 때만)
 */
export function StepConfirm() {
  const form = useTicketCreateForm()
  const { data: categories } = useCategoriesQuery()

  const categoryLabel = useMemo(() => {
    if (!categories || form.subCategoryId == null) return "-"
    for (const c of categories) {
      const sub = c.subCategories.find((s) => s.id === form.subCategoryId)
      if (sub) return sub.name
    }
    return "-"
  }, [categories, form.subCategoryId])

  const levelLabel =
    LEVEL_OPTIONS.find((o) => o.value === form.level)?.label ?? "-"

  const budgetText = (() => {
    if (form.budgetType === "NEGOTIABLE") return "협의 가능"
    if (form.budgetType === "RANGE" && form.budgetMin != null && form.budgetMax != null) {
      return `${formatBudget(form.budgetMin)} ~ ${formatBudget(form.budgetMax)}원`
    }
    return "-"
  })()

  const locationText = (() => {
    if (form.ticketType !== "OFFLINE") return null
    const region = form.region ?? ""
    const detail = form.locationDetail.trim()
    if (region && detail) return `${region}, ${detail}`
    if (region) return region
    if (detail) return detail
    return null
  })()

  const visibleDates = form.desiredDates.filter((d) => d.date)
  const hasImages = form.localImages.length > 0

  return (
    <StepCard
      title="의뢰 내용을 확인하세요"
      subtitle="등록하면 전문가에게 공개됩니다."
    >
      <div className="flex flex-col gap-6">
        {/* 기본 정보 */}
        <Section label="기본 정보">
          <Row label="의뢰 유형" value={<TypeValue type={form.ticketType} />} />
          <Row label="카테고리" value={categoryLabel} />
          <Row label="제목" value={form.title || "-"} />
          <Row label="실력" value={levelLabel} />
        </Section>

        {/* 시간 & 예산 */}
        <Section label="시간 & 예산">
          <Row
            label="희망 시간"
            value={
              form.isNegotiableDuration
                ? "협의 가능"
                : formatEstimatedDuration(
                    form.estimatedDurationValue,
                    form.estimatedDurationUnit,
                  )
            }
          />
          <Row label="예산" value={budgetText} />
          {locationText && <Row label="희망 장소" value={locationText} />}
        </Section>

        {/* 첨부 이미지 */}
        {hasImages && (
          <Section label="첨부 이미지">
            <div className="flex flex-wrap gap-2 px-3 py-3">
              {form.localImages.map((file, idx) => (
                <ImagePreview key={idx} file={file} />
              ))}
            </div>
          </Section>
        )}

        {/* 희망 일시 */}
        {visibleDates.length > 0 && (
          <Section label="희망 일시">
            <div className="flex flex-col gap-1.5 px-3 py-3">
              {visibleDates.map((d, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CalendarIcon className="text-muted-foreground size-3.5" />
                  <Text typography="body3-medium" className="text-foreground tabular-nums">
                    {d.date}
                    {d.timeSlot && ` ${d.timeSlot}`}
                  </Text>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </StepCard>
  )
}

function Section({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Text typography="caption1-medium" className="text-muted-foreground">
        {label}
      </Text>
      <dl className="border-border bg-card divide-border flex flex-col divide-y rounded-xl border">
        {children}
      </dl>
    </div>
  )
}

function Row({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4 px-4 py-3">
      <Text typography="body3-medium" className="text-muted-foreground shrink-0">
        {label}
      </Text>
      <div className="flex flex-1 justify-end text-right">
        {typeof value === "string" ? (
          <Text typography="body3-bold" className="text-foreground">
            {value}
          </Text>
        ) : (
          value
        )}
      </div>
    </div>
  )
}

function TypeValue({ type }: { type: string | null }) {
  if (!type) return <span className="text-muted-foreground">-</span>
  const Icon = type === "OFFLINE" ? MapPin : Laptop
  const label = type === "OFFLINE" ? "오프라인" : "온라인"
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="text-primary size-3.5" />
      <Text typography="body3-bold" className="text-foreground">
        {label}
      </Text>
    </span>
  )
}

function ImagePreview({ file }: { file: File }) {
  // 파일에서 파생되는 blob URL — useMemo 로 생성하고 effect 는 cleanup(revoke)만 담당.
  const url = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(url), [url])
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className="border-border size-18 rounded-md border object-cover"
    />
  )
}
