"use client"

import { useMemo } from "react"
import {
  ChevronDown,
  Info,
  Laptop,
  Loader2,
  MapPin,
  Check,
} from "lucide-react"

import type { TicketType } from "@/entities/ticket/api/ticket.schema"
import { openRegionPicker } from "@/features/region/select/lib/open-region-picker"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { useCategoriesQuery } from "../../model/use-categories-query"
import { useTicketCreateForm } from "../../model/use-ticket-create-form"
import { TICKET_TYPE_OPTIONS } from "../../lib/ticket-create.constants"
import { StepCard } from "../step-card"

const TYPE_ICON: Record<TicketType, React.ComponentType<{ className?: string }>> = {
  ONLINE: Laptop,
  OFFLINE: MapPin,
}

/**
 * Step 1 — 모바일 Step1TypeCategoryWidget 와 동일 구성:
 * - Notice banner (직접의뢰 / 일반 분기)
 * - 의뢰 유형 (2-col) — 선택 시 OFFLINE 안내 다이얼로그는 생략 (web 에선 단순)
 * - 카테고리 (대분류 → 중분류 expandable)
 * - 희망 장소 (OFFLINE only) — RegionPicker + 상세 위치
 */
export function StepTypeCategory() {
  const ticketType = useTicketCreateForm((s) => s.ticketType)
  const directRequest = useTicketCreateForm((s) => s.directRequest)
  const setField = useTicketCreateForm((s) => s.setField)

  return (
    <div className="flex flex-col gap-3">
      <NoticeBanner directRequest={directRequest} />
      <TypeSection ticketType={ticketType} onChange={(v) => setField("ticketType", v)} />
      <CategorySection />
      {ticketType === "OFFLINE" && <LocationSection />}
    </div>
  )
}

// ─── Notice ──────────────────────────────────────────────────────────────────

function NoticeBanner({ directRequest }: { directRequest: boolean }) {
  const text = directRequest
    ? "전문가에게 의뢰가 전달됩니다. 전문가가 거절하거나 5일 동안 응답이 없으면 의뢰가 자동으로 취소됩니다."
    : "2주간 의뢰가 공개됩니다. 이후 매칭되지 않으면 의뢰가 자동으로 만료됩니다."

  return (
    <div className="bg-primary-light border-primary/20 flex gap-2 rounded-lg border px-3 py-3">
      <Info className="text-primary mt-0.5 size-4 shrink-0" />
      <Text typography="caption1-medium" className="text-primary">
        {text}
      </Text>
    </div>
  )
}

// ─── Type ────────────────────────────────────────────────────────────────────

function TypeSection({
  ticketType,
  onChange,
}: {
  ticketType: TicketType | null
  onChange: (v: TicketType) => void
}) {
  return (
    <StepCard
      title="의뢰 유형을 선택하세요"
      subtitle="오프라인은 대면 서비스, 온라인은 작업물 전달 형식으로 진행됩니다."
    >
      <div className="grid gap-3 md:grid-cols-2">
        {TICKET_TYPE_OPTIONS.map((opt) => {
          const Icon = TYPE_ICON[opt.value]
          const selected = ticketType === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex flex-col items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                selected
                  ? "border-primary bg-primary-light"
                  : "border-border bg-background hover:border-primary/40",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <Icon
                  className={cn(
                    "size-5",
                    selected ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border-2",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent",
                  )}
                >
                  {selected && <Check className="size-3" strokeWidth={3} />}
                </span>
              </div>
              <Text
                typography="body3-bold"
                className={cn(selected ? "text-primary" : "text-foreground")}
              >
                {opt.label}
              </Text>
              <Text
                typography="caption2-medium"
                className="text-muted-foreground line-clamp-3"
              >
                {opt.description}
              </Text>
            </button>
          )
        })}
      </div>
    </StepCard>
  )
}

// ─── Category ────────────────────────────────────────────────────────────────

function CategorySection() {
  const { data, isLoading, isError, refetch } = useCategoriesQuery()
  const categories = data ?? []

  const majorId = useTicketCreateForm((s) => s.selectedMajorCategoryId)
  const subId = useTicketCreateForm((s) => s.subCategoryId)
  const setField = useTicketCreateForm((s) => s.setField)

  // majorId 가 store 에 없을 때 (edit 모드 prefill 이 sub 만 들고옴) subId 로부터
  // 대분류를 역추적해서 UI 표시를 보장한다. 사용자가 명시적으로 대분류를 바꾸면
  // 그때 setField("selectedMajorCategoryId", ...) 가 호출되어 store 도 정합.
  const currentMajor = useMemo(() => {
    if (majorId != null) return categories.find((c) => c.id === majorId) ?? null
    if (subId != null) {
      return (
        categories.find((c) =>
          c.subCategories.some((s) => s.id === subId),
        ) ?? null
      )
    }
    return null
  }, [categories, majorId, subId])

  const subOptions = currentMajor?.subCategories ?? []

  return (
    <StepCard
      title="카테고리를 선택하세요"
      subtitle="어떤 분야의 서비스를 원하시나요?"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-primary size-5 animate-spin" />
        </div>
      ) : isError || categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <Text typography="body3-medium" className="text-muted-foreground">
            카테고리를 불러오지 못했어요.
          </Text>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <RequiredLabel>대분류</RequiredLabel>
          <ExpandableSelect
            placeholder="선택하세요"
            value={
              currentMajor != null
                ? { id: currentMajor.id, label: currentMajor.name }
                : null
            }
            options={categories.map((c) => ({ id: c.id, label: c.name }))}
            onChange={(item) => {
              setField("selectedMajorCategoryId", item.id)
              if (subId != null) {
                const stillValid = categories
                  .find((c) => c.id === item.id)
                  ?.subCategories.some((s) => s.id === subId)
                if (!stillValid) setField("subCategoryId", null)
              }
            }}
          />

          <RequiredLabel>중분류</RequiredLabel>
          <ExpandableSelect
            placeholder={currentMajor == null ? "대분류를 먼저 선택하세요" : "선택하세요"}
            disabled={currentMajor == null}
            value={
              subOptions.find((s) => s.id === subId)
                ? { id: subId as number, label: subOptions.find((s) => s.id === subId)!.name }
                : null
            }
            options={subOptions.map((s) => ({ id: s.id, label: s.name }))}
            onChange={(item) => setField("subCategoryId", item.id)}
          />
        </div>
      )}
    </StepCard>
  )
}

// ─── Location (OFFLINE only) ─────────────────────────────────────────────────

function LocationSection() {
  const region = useTicketCreateForm((s) => s.region)
  const locationDetail = useTicketCreateForm((s) => s.locationDetail)
  const setField = useTicketCreateForm((s) => s.setField)

  const handlePickRegion = async () => {
    const next = await openRegionPicker(region ?? undefined)
    if (next !== null) setField("region", next ?? null)
  }

  return (
    <StepCard
      title={
        <span className="flex items-baseline gap-1.5">
          희망 장소
          <Text as="span" typography="caption1-medium" className="text-destructive">
            (필수)
          </Text>
        </span>
      }
      subtitle="오프라인 의뢰 시 전문가가 참고할 위치 정보입니다."
    >
      <div className="flex flex-col gap-4">
        <RequiredLabel>지역</RequiredLabel>
        <button
          type="button"
          onClick={handlePickRegion}
          className={cn(
            "flex items-center gap-2 rounded-md border bg-background px-3 py-2.5 text-left transition-colors hover:border-primary/40",
            region ? "border-primary/40" : "border-border",
          )}
        >
          <MapPin
            className={cn("size-4 shrink-0", region ? "text-primary" : "text-muted-foreground")}
          />
          <Text
            typography="body2-regular"
            className={region ? "text-foreground" : "text-muted-foreground"}
          >
            {region ?? "지역을 검색하세요"}
          </Text>
        </button>

        <Text as="label" typography="body3-bold">
          상세 위치
        </Text>
        <Input
          value={locationDetail}
          onChange={(e) => setField("locationDetail", e.target.value)}
          placeholder="예) 테헤란로 근처, 삼성역 인근"
          className="h-11"
        />
      </div>
    </StepCard>
  )
}

// ─── Primitives ──────────────────────────────────────────────────────────────

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text as="label" typography="body3-bold" className="flex items-baseline gap-0.5">
      {children}
      <span className="text-destructive">*</span>
    </Text>
  )
}

type SelectItem = { id: number; label: string }

/**
 * 모바일 _ExpandableSelector 의 웹 버전 — Popover 로 구현 (드롭다운 더 익숙).
 */
function ExpandableSelect({
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: {
  value: SelectItem | null
  options: SelectItem[]
  placeholder: string
  disabled?: boolean
  onChange: (item: SelectItem) => void
}) {
  const isDisabled = disabled || options.length === 0
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isDisabled}
          className={cn(
            "flex w-full items-center justify-between rounded-md border px-3.5 py-3 transition-colors",
            value
              ? "border-primary/40 bg-primary-light/40"
              : "border-border bg-background",
            isDisabled
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "hover:border-primary/40",
          )}
        >
          <Text
            typography="body2-regular"
            className={value ? "text-foreground" : "text-muted-foreground"}
          >
            {value?.label ?? placeholder}
          </Text>
          <ChevronDown className="text-muted-foreground size-4 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-1"
        align="start"
      >
        <div className="flex max-h-72 flex-col overflow-y-auto">
          {options.map((opt) => {
            const selected = value?.id === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange(opt)}
                className={cn(
                  "flex items-center justify-between rounded-sm px-3 py-2 text-left transition-colors",
                  selected
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground hover:bg-accent",
                )}
              >
                <Text typography="body3-medium">{opt.label}</Text>
                {selected && <Check className="text-primary size-4" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
