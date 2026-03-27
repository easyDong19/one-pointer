"use client"

import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { X, Plus, ChevronLeft, Check } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/utils"
import { REGION_MAP, CITY_LIST } from "@/shared/data/region-data"
import type { ExpertRegisterFormValues } from "@/features/mypage/expert-register"
import { TimeSlotGrid } from "./time-slot-grid"

type Step4Props = {
  form: UseFormReturn<ExpertRegisterFormValues>
}

export function Step4ActivityInfo({ form }: Step4Props) {
  const { watch, setValue } = form
  const availableTimes = watch("availableTimes") ?? []
  const availableRegions = watch("availableRegions") ?? []

  return (
    <div className="flex flex-col gap-6">
      {/* 활동 시간대 */}
      <div className="flex flex-col gap-2">
        <Text as="label" typography="body3-medium">
          활동 가능 시간대
        </Text>
        <Text as="p" typography="caption2-medium" className="text-muted-foreground">
          시간대 또는 지역 중 1개 이상 선택해주세요
        </Text>
        <TimeSlotGrid
          selectedSlots={availableTimes}
          onChange={(slots) => setValue("availableTimes", slots)}
        />
      </div>

      {/* 활동 지역 */}
      <div className="flex flex-col gap-2">
        <Text as="label" typography="body3-medium">
          활동 지역
        </Text>

        {availableRegions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {availableRegions.map((region) => (
              <Badge key={region} variant="secondary" className="gap-1 pr-1">
                {region}
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "availableRegions",
                      availableRegions.filter((r) => r !== region),
                    )
                  }
                  className="rounded-full p-0.5 hover:bg-foreground/10"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <RegionMultiSelect
          selected={availableRegions}
          onChange={(regions) => setValue("availableRegions", regions)}
        />
      </div>
    </div>
  )
}

// ── 지역 다중 선택 ──

type RegionMultiSelectProps = {
  selected: string[]
  onChange: (regions: string[]) => void
}

function RegionMultiSelect({ selected, onChange }: RegionMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  const handleSelect = (region: string) => {
    if (selected.includes(region)) {
      onChange(selected.filter((r) => r !== region))
    } else {
      onChange([...selected, region])
    }
  }

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="mr-1 size-4" />
        지역 추가
      </Button>
    )
  }

  // 시/도 선택 화면
  if (!selectedCity) {
    return (
      <div className="max-h-60 overflow-y-auto rounded-md border">
        <div className="sticky top-0 flex items-center justify-between border-b bg-card px-3 py-2">
          <Text as="span" typography="caption1-medium">시/도 선택</Text>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            닫기
          </button>
        </div>
        {CITY_LIST.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => setSelectedCity(city)}
            className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-muted/50"
          >
            {city}
          </button>
        ))}
      </div>
    )
  }

  // 구/시/군 선택 화면
  const districts = REGION_MAP[selectedCity] ?? []

  return (
    <div className="max-h-60 overflow-y-auto rounded-md border">
      <button
        type="button"
        onClick={() => setSelectedCity(null)}
        className="sticky top-0 flex w-full items-center gap-2 border-b bg-card px-3 py-2 hover:bg-muted/50"
      >
        <ChevronLeft className="size-4" />
        <Text as="span" typography="caption1-medium">{selectedCity}</Text>
      </button>

      {districts.map((district) => {
        const fullRegion = `${selectedCity} ${district}`
        const isSelected = selected.includes(fullRegion)
        return (
          <button
            key={district}
            type="button"
            onClick={() => handleSelect(fullRegion)}
            className={cn(
              "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-muted/50",
              isSelected && "bg-primary/5",
            )}
          >
            {district}
            {isSelected && <Check className="size-4 text-primary" />}
          </button>
        )
      })}
    </div>
  )
}
